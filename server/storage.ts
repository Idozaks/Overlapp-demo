import { users, posts, comments, connections, likes, wallets, nfts, transactions, interests, interestContent, userInterests, type Interest, type InterestContent, type UserInterest, type InsertInterest, type InsertInterestContent, type InsertUserInterest } from "@shared/schema";
import { type User, type InsertUser, type Post, type Comment, type Connection, type Wallet, type NFT, type Transaction, type InsertNFT, type InsertWallet } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, inArray, or, sql } from "drizzle-orm";
import { log } from "./vite";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";

const PostgresStore = connectPgSimple(session);

const storageLog = (operation: string, details: any) => {
  const timestamp = new Date().toISOString();
  log(`[STORAGE] ${timestamp} - ${operation}:`, JSON.stringify(details, null, 2));
};

export interface IStorage {
  // User operations
  getAllUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;

  // Social operations
  followUser(followerId: number, followingId: number): Promise<Connection>;
  unfollowUser(followerId: number, followingId: number): Promise<void>;
  getFollowers(userId: number): Promise<User[]>;
  getFollowing(userId: number): Promise<User[]>;

  // Post operations
  createPost(userId: number, content: string, location?: any): Promise<Post>;
  getPosts(userId: number): Promise<(Post & { user: User })[]>;
  getFeed(userId: number): Promise<(Post & { user: User })[]>;

  // Interaction operations
  likePost(userId: number, postId: number): Promise<void>;
  unlikePost(userId: number, postId: number): Promise<void>;
  commentOnPost(userId: number, postId: number, content: string): Promise<Comment>;

  // Wallet operations
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  getWallet(userId: number): Promise<Wallet | undefined>;
  updateWalletBalance(walletId: number, amount: string): Promise<Wallet>;

  // NFT operations
  createNFT(nft: InsertNFT): Promise<NFT>;
  getNFTsByOwner(userId: number): Promise<NFT[]>;
  getNFTsByCreator(userId: number): Promise<NFT[]>;
  transferNFT(nftId: number, fromUserId: number, toUserId: number): Promise<Transaction>;

  // Transaction operations
  getTransactions(walletId: number): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  getRecommendations(userId: number): Promise<any[]>;
  // Add session store
  sessionStore: session.Store;

  // Add specific auth methods
  validateUserCredentials(username: string, password: string): Promise<User | null>;

  // Interest operations
  getInterests(): Promise<Interest[]>;
  getInterestsByCategory(category: string): Promise<Interest[]>;
  getInterest(id: number): Promise<Interest | undefined>;
  getInterestContent(interestId: number): Promise<InterestContent[]>;
  getUserInterests(userId: number): Promise<Interest[]>;
  addUserInterest(userId: number, interestId: number): Promise<void>;
  removeUserInterest(userId: number, interestId: number): Promise<void>;
  addInterestContent(content: InsertInterestContent): Promise<InterestContent>;

  // Contact Card operations
  createContactCard(card: InsertContactCard): Promise<ContactCard>;
  getContactCard(id: number): Promise<ContactCard | undefined>;
  getUserContactCard(userId: number): Promise<ContactCardWithLinks | undefined>;
  addCardLink(link: InsertCardLink): Promise<CardLink>;
  removeCardLink(id: number): Promise<void>;

  // Overlap Analysis operations
  createOverlapRecord(record: InsertOverlapRecord): Promise<OverlapRecord>;
  getOverlapRecord(id: number): Promise<OverlapRecordWithCards | undefined>;
  getOverlapHistory(cardId: number): Promise<OverlapRecordWithCards[]>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    try {
      log("[STORAGE] Initializing PostgreSQL session store...");

      if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL environment variable is not set");
      }

      this.sessionStore = new PostgresStore({
        conObject: {
          connectionString: process.env.DATABASE_URL,
        },
        createTableIfMissing: true,
        tableName: 'session',
        pruneSessionInterval: 60 * 15 // Prune invalid sessions every 15 minutes
      });

      log("[STORAGE] PostgreSQL session store initialized successfully");
    } catch (error) {
      log("[STORAGE] Failed to initialize session store:", error instanceof Error ? error.message : String(error));
      // Fallback to memory store in case of initialization failure
      const MemoryStore = require('memorystore')(session);
      log("[STORAGE] Falling back to memory store");
      this.sessionStore = new MemoryStore({
        checkPeriod: 86400000 // Prune expired entries every 24h
      });
    }
  }

  async validateUserCredentials(username: string, password: string): Promise<User | null> {
    try {
      const user = await this.getUserByUsername(username);
      if (!user) {
        log(`User not found: ${username}`);
        return null;
      }

      // Password comparison will be done in auth.ts
      return user;
    } catch (error) {
      log(`Error validating credentials: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const preferences = insertUser.preferences ? {
        interests: Array.isArray(insertUser.preferences.interests)
          ? insertUser.preferences.interests.filter((interest): interest is string => typeof interest === 'string')
          : [],
        retailPreferences: Array.isArray(insertUser.preferences.retailPreferences)
          ? insertUser.preferences.retailPreferences.filter((pref): pref is string => typeof pref === 'string')
          : []
      } : undefined;

      const [user] = await db
        .insert(users)
        .values({
          username: insertUser.username,
          password: insertUser.password,
          displayName: insertUser.displayName || undefined,
          bio: insertUser.bio || undefined,
          avatar: insertUser.avatar || undefined,
          preferences
        })
        .returning();
      return user;
    } catch (error) {
      log("Error creating user:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async deleteUsers(userIds: number[]): Promise<boolean> {
    try {
      log(`Starting deletion of users: ${userIds.join(', ')}`);

      // Delete in transaction to ensure atomicity
      const result = await db.transaction(async (tx) => {
        log(`Starting transaction to delete users: ${userIds.join(',')}`);

        // Delete wallet transactions
        const deletedLikes = await tx.delete(likes).where(inArray(likes.userId, userIds)).returning();
        log(`Deleted ${deletedLikes.length} likes`);

        const deletedComments = await tx.delete(comments).where(inArray(comments.userId, userIds)).returning();
        log(`Deleted ${deletedComments.length} comments`);

        const deletedPosts = await tx.delete(posts).where(inArray(posts.userId, userIds)).returning();
        log(`Deleted ${deletedPosts.length} posts`);

        const deletedConnections1 = await tx.delete(connections).where(inArray(connections.followerId, userIds)).returning();
        const deletedConnections2 = await tx.delete(connections).where(inArray(connections.followingId, userIds)).returning();
        log(`Deleted ${deletedConnections1.length + deletedConnections2.length} connections`);

        const walletIds = await tx
          .select({ id: wallets.id })
          .from(wallets)
          .where(inArray(wallets.userId, userIds));

        if (walletIds.length > 0) {
          const wIds = walletIds.map(w => w.id);
          await tx.delete(transactions).where(inArray(transactions.fromWalletId, wIds));
          await tx.delete(transactions).where(inArray(transactions.toWalletId, wIds));
        }

        await tx.delete(nfts).where(inArray(nfts.ownerId, userIds));
        await tx.delete(nfts).where(inArray(nfts.creatorId, userIds));
        await tx.delete(wallets).where(inArray(wallets.userId, userIds));

        const deleted = await tx.delete(users).where(inArray(users.id, userIds)).returning();
        return deleted;
      });

      log(`Successfully deleted ${result.length} users`);
      return result.length > 0;
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      log(`Failed to delete users: ${errMsg}`);
      return false; // Return false instead of throwing
    }
  }

  async updateUserCredentials(userId: number, username: string, password: string): Promise<void> {
    await db
      .update(users)
      .set({ username, password })
      .where(eq(users.id, userId));
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User> {
    try {
      storageLog("updateUser", { id, updateData });

      const preferences = updateData.preferences ? {
        interests: Array.isArray(updateData.preferences.interests)
          ? updateData.preferences.interests.filter((interest): interest is string => typeof interest === 'string')
          : [],
        retailPreferences: Array.isArray(updateData.preferences.retailPreferences)
          ? updateData.preferences.retailPreferences.filter((pref): pref is string => typeof pref === 'string')
          : []
      } : undefined;

      const [user] = await db
        .update(users)
        .set({
          displayName: updateData.displayName,
          bio: updateData.bio,
          avatar: updateData.avatar,
          preferences: preferences
        })
        .where(eq(users.id, id))
        .returning();

      if (!user) {
        throw new Error(`User with ID ${id} not found`);
      }

      return user;
    } catch (error) {
      log("Error updating user:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async followUser(followerId: number, followingId: number): Promise<Connection> {
    const [connection] = await db
      .insert(connections)
      .values([{ followerId, followingId }])
      .returning();
    return connection;
  }

  async unfollowUser(followerId: number, followingId: number): Promise<void> {
    await db
      .delete(connections)
      .where(
        and(
          eq(connections.followerId, followerId),
          eq(connections.followingId, followingId)
        )
      );
  }

  async getFollowers(userId: number): Promise<User[]> {
    const followers = await db
      .select({
        user: users
      })
      .from(users)
      .innerJoin(connections, eq(connections.followerId, users.id))
      .where(eq(connections.followingId, userId));
    return followers.map(({ user }) => user!);
  }

  async getFollowing(userId: number): Promise<User[]> {
    const following = await db
      .select({
        user: users
      })
      .from(users)
      .innerJoin(connections, eq(connections.followingId, users.id))
      .where(eq(connections.followerId, userId));
    return following.map(({ user }) => user!);
  }

  async createPost(userId: number, content: string, location?: any): Promise<Post> {
    const [post] = await db
      .insert(posts)
      .values([{ userId, content, location }])
      .returning();
    return post;
  }

  async getPosts(userId: number): Promise<(Post & { user: User })[]> {
    const result = await db
      .select({
        post: posts,
        user: users
      })
      .from(posts)
      .leftJoin(users, eq(users.id, posts.userId))
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt));

    return result.map(({ post, user }) => ({
      ...post,
      user: user!
    }));
  }

  async getFeed(userId: number): Promise<(Post & { user: User })[]> {
    const following = await this.getFollowing(userId);
    const followingIds = following.map(user => user.id);
    followingIds.push(userId); // Include user's own posts

    const result = await db
      .select({
        post: posts,
        user: users
      })
      .from(posts)
      .leftJoin(users, eq(users.id, posts.userId))
      .where(inArray(posts.userId, followingIds))
      .orderBy(desc(posts.createdAt));

    return result.map(({ post, user }) => ({
      ...post,
      user: user!
    }));
  }

  async likePost(userId: number, postId: number): Promise<void> {
    await db.insert(likes).values([{ userId, postId }]);
  }

  async unlikePost(userId: number, postId: number): Promise<void> {
    await db
      .delete(likes)
      .where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
  }

  async commentOnPost(userId: number, postId: number, content: string): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values([{ userId, postId, content }])
      .returning();
    return comment;
  }

  async createWallet(wallet: InsertWallet): Promise<Wallet> {
    const [newWallet] = await db
      .insert(wallets)
      .values([wallet])
      .returning();
    return newWallet;
  }

  async getWallet(userId: number): Promise<Wallet | undefined> {
    const [wallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, userId));
    return wallet;
  }

  async updateWalletBalance(walletId: number, amount: string): Promise<Wallet> {
    const [wallet] = await db
      .update(wallets)
      .set({ balance: amount })
      .where(eq(wallets.id, walletId))
      .returning();
    return wallet;
  }

  async createNFT(nft: InsertNFT): Promise<NFT> {
    try {
      const [newNFT] = await db
        .insert(nfts)
        .values({
          title: nft.title,
          description: nft.description || undefined,
          metadata: nft.metadata ? {
            image: nft.metadata.image || '',
            attributes: nft.metadata.attributes || {},
            externalUrl: nft.metadata.externalUrl || undefined
          } : undefined,
          creatorId: nft.creatorId,
          tokenId: nft.tokenId,
          ownerId: nft.creatorId
        })
        .returning();
      return newNFT;
    } catch (error) {
      log("Error creating NFT:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async getNFTsByOwner(userId: number): Promise<NFT[]> {
    return await db
      .select()
      .from(nfts)
      .where(eq(nfts.ownerId, userId));
  }

  async getNFTsByCreator(userId: number): Promise<NFT[]> {
    return await db
      .select()
      .from(nfts)
      .where(eq(nfts.creatorId, userId));
  }

  async transferNFT(nftId: number, fromUserId: number, toUserId: number): Promise<Transaction> {
    const [transaction] = await db.transaction(async (tx) => {
      // Update NFT ownership
      await tx
        .update(nfts)
        .set({ ownerId: toUserId })
        .where(eq(nfts.id, nftId));

      // Create transaction record
      const [txn] = await tx
        .insert(transactions)
        .values([{
          nftId,
          fromWalletId: fromUserId,
          toWalletId: toUserId,
          type: 'TRANSFER',
          status: 'COMPLETED',
          amount: "0" // Since this is an NFT transfer, not a sale
        }])
        .returning();

      return [txn];
    });

    return transaction;
  }

  async getTransactions(walletId: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(
        or(
          eq(transactions.fromWalletId, walletId),
          eq(transactions.toWalletId, walletId)
        )
      )
      .orderBy(desc(transactions.createdAt));
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id));
    return transaction;
  }

  async getRecommendations(userId: number): Promise<any[]> {
    const user = await this.getUser(userId);
    if (!user?.preferences) return [];

    const following = await this.getFollowing(userId);
    const followingIds = following.map(f => f.id);
    const interests = user.preferences?.interests || [];

    // Create recommendations based on interests
    return interests.map(interest => ({
      category: interest,
      items: [
        { name: `${interest} Item 1`, price: Math.floor(Math.random() * 100) + 20 },
        { name: `${interest} Item 2`, price: Math.floor(Math.random() * 100) + 20 }
      ]
    }));
  }

  async getInterests(): Promise<Interest[]> {
    return await db.select().from(interests);
  }

  async getInterestsByCategory(category: string): Promise<Interest[]> {
    return await db
      .select()
      .from(interests)
      .where(eq(interests.category, category));
  }

  async getInterest(id: number): Promise<Interest | undefined> {
    const [interest] = await db
      .select()
      .from(interests)
      .where(eq(interests.id, id));
    return interest;
  }

  async getInterestContent(interestId: number): Promise<InterestContent[]> {
    return await db
      .select()
      .from(interestContent)
      .where(eq(interestContent.interestId, interestId))
      .orderBy(desc(interestContent.createdAt));
  }

  async getUserInterests(userId: number): Promise<Interest[]> {
    const result = await db
      .select({
        interest: interests
      })
      .from(interests)
      .innerJoin(userInterests, eq(userInterests.interestId, interests.id))
      .where(eq(userInterests.userId, userId));

    return result.map(({ interest }) => interest);
  }

  async addUserInterest(userId: number, interestId: number): Promise<void> {
    await db
      .insert(userInterests)
      .values({ userId, interestId });
  }

  async removeUserInterest(userId: number, interestId: number): Promise<void> {
    await db
      .delete(userInterests)
      .where(
        and(
          eq(userInterests.userId, userId),
          eq(userInterests.interestId, interestId)
        )
      );
  }

  async addInterestContent(content: InsertInterestContent): Promise<InterestContent> {
    const [newContent] = await db
      .insert(interestContent)
      .values(content)
      .returning();
    return newContent;
  }

  async createContactCard(card: InsertContactCard): Promise<ContactCard> {
    const [newCard] = await db
      .insert(contactCards)
      .values(card)
      .returning();
    return newCard;
  }

  async getContactCard(id: number): Promise<ContactCard | undefined> {
    const [card] = await db
      .select()
      .from(contactCards)
      .where(eq(contactCards.id, id));
    return card;
  }

  async getUserContactCard(userId: number): Promise<ContactCardWithLinks | undefined> {
    const [card] = await db
      .select()
      .from(contactCards)
      .where(eq(contactCards.userId, userId));

    if (!card) return undefined;

    const links = await db
      .select()
      .from(cardLinks)
      .where(eq(cardLinks.cardId, card.id));

    return {
      ...card,
      links
    };
  }

  async addCardLink(link: InsertCardLink): Promise<CardLink> {
    const [newLink] = await db
      .insert(cardLinks)
      .values(link)
      .returning();
    return newLink;
  }

  async removeCardLink(id: number): Promise<void> {
    await db
      .delete(cardLinks)
      .where(eq(cardLinks.id, id));
  }

  async createOverlapRecord(record: InsertOverlapRecord): Promise<OverlapRecord> {
    const [newRecord] = await db
      .insert(overlapRecords)
      .values(record)
      .returning();
    return newRecord;
  }

  async getOverlapRecord(id: number): Promise<OverlapRecordWithCards | undefined> {
    const [record] = await db
      .select({
        record: overlapRecords,
        card1: contactCards,
        card2: contactCards
      })
      .from(overlapRecords)
      .leftJoin(contactCards, eq(contactCards.id, overlapRecords.card1Id))
      .leftJoin(contactCards, eq(contactCards.id, overlapRecords.card2Id))
      .where(eq(overlapRecords.id, id));

    if (!record) return undefined;

    const card1Links = await db
      .select()
      .from(cardLinks)
      .where(eq(cardLinks.cardId, record.card1.id));

    const card2Links = record.card2 ? await db
      .select()
      .from(cardLinks)
      .where(eq(cardLinks.cardId, record.card2.id)) : [];

    return {
      ...record.record,
      card1: {
        ...record.card1,
        links: card1Links
      },
      card2: record.card2 ? {
        ...record.card2,
        links: card2Links
      } : undefined
    };
  }

  async getOverlapHistory(cardId: number): Promise<OverlapRecordWithCards[]> {
    const records = await db
      .select({
        record: overlapRecords,
        card1: contactCards,
        card2: contactCards
      })
      .from(overlapRecords)
      .leftJoin(contactCards, eq(contactCards.id, overlapRecords.card1Id))
      .leftJoin(contactCards, eq(contactCards.id, overlapRecords.card2Id))
      .where(or(
        eq(overlapRecords.card1Id, cardId),
        eq(overlapRecords.card2Id, cardId)
      ))
      .orderBy(desc(overlapRecords.createdAt));

    // Fetch links for all cards
    const cardIds = records
      .flatMap(r => [r.card1.id, r.card2?.id])
      .filter((id): id is number => id !== undefined);

    const links = await db
      .select()
      .from(cardLinks)
      .where(inArray(cardLinks.cardId, cardIds));

    // Map links to their respective cards
    return records.map(record => ({
      ...record.record,
      card1: {
        ...record.card1,
        links: links.filter(l => l.cardId === record.card1.id)
      },
      card2: record.card2 ? {
        ...record.card2,
        links: links.filter(l => l.cardId === record.card2.id)
      } : undefined
    }));
  }
}

export const storage = new DatabaseStorage();
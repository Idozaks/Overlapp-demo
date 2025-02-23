import { users, posts, comments, connections, likes, wallets, nfts, transactions } from "@shared/schema";
import { type User, type InsertUser, type Post, type Comment, type Connection, type Wallet, type NFT, type Transaction, type InsertNFT, type InsertWallet } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, inArray, or } from "drizzle-orm";
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
            externalUrl: nft.metadata.externalUrl
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
}

export const storage = new DatabaseStorage();
import { users, posts, comments, connections, likes, wallets, nfts, transactions, interests, interestContent, userInterests, entities, entityContent, conversations, conversationParticipants, messages, messageStatus, aiCompanions, aiConversationContext, type Interest, type InterestContent, type UserInterest, type InsertInterest, type InsertInterestContent, type InsertUserInterest, type Entity, type EntityContent, type InsertEntity, type InsertEntityContent, type Conversation, type ConversationParticipant, type Message, type MessageStatus, type AiCompanion, type AiConversationContext, type InsertConversation, type InsertConversationParticipant, type InsertMessage, type InsertMessageStatus, type InsertAiCompanion, type InsertAiConversationContext, type MessageWithSender, type ConversationWithParticipants, type ConversationWithLastMessage } from "@shared/schema";
import { type User, type InsertUser, type Post, type Comment, type Connection, type Wallet, type NFT, type Transaction, type InsertNFT, type InsertWallet } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, inArray, or, not, sql } from "drizzle-orm";
import { log } from "./vite";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";

const PostgresStore = connectPgSimple(session);

const storageLog = (operation: string, details: any) => {
  const timestamp = new Date().toISOString();
  log(`[STORAGE] ${timestamp} - ${operation}:`, JSON.stringify(details, null, 2));
};

// IStorage interface

// Add to the IStorage interface
export interface IStorage {
  // User operations
  getAllUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  updateUserIdentityPreferences(userId: number, attributeImportance: Record<string, number>): Promise<User>;

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
  
  // Recommendations and Matching
  getRecommendations(userId: number): Promise<any[]>;
  getIdentityMatches(userId: number, options?: {
    limit?: number;
    identityWeight?: number;
    interestWeight?: number;
    minIdentityMatches?: number;
  }): Promise<any[]>;
  
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
  addAiGeneratedInterest(name: string): Promise<Interest>;
  getOrCreateAiInterest(name: string): Promise<Interest>;
  deleteInterest(id: number): Promise<void>;
  createInterest(interest: InsertInterest): Promise<Interest>;
  getInterestByName(name: string): Promise<Interest | undefined>;
  updateInterest(id: number, data: Partial<InsertInterest>): Promise<Interest>;
  
  // Entity operations
  getAllEntities(): Promise<Entity[]>;
  getEntitiesByCategory(category: string): Promise<Entity[]>;
  getEntity(id: number): Promise<Entity | undefined>;
  getEntityByName(name: string): Promise<Entity | undefined>;
  createEntity(entity: InsertEntity): Promise<Entity>;
  getEntityContent(entityId: number): Promise<EntityContent[]>;
  addEntityContent(content: InsertEntityContent): Promise<EntityContent>;
  deleteEntity(id: number): Promise<void>;
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
    try {
      if (!username) {
        log(`getUserByUsername called with empty username`);
        return undefined;
      }

      log(`Looking up user with username: ${username}`);

      // Simply select all fields from the user record without manually specifying columns
      // This avoids issues with column name mismatches
      const result = await db
        .select()
        .from(users)
        .where(eq(users.username, username));

      const user = result[0];

      if (user) {
        log(`User found: ${username}`);
      } else {
        log(`User not found: ${username}`);
      }

      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log(`Error in getUserByUsername: ${errorMessage}`);
      console.error(`Database error when looking up user ${username}:`, errorMessage);
      throw error;
    }
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

      // Include the new identity fields in the update
      const [user] = await db
        .update(users)
        .set({
          displayName: updateData.displayName,
          bio: updateData.bio,
          avatar: updateData.avatar,
          preferences: preferences,
          // New identity fields
          gender: updateData.gender,
          ageRange: updateData.ageRange,
          countryOfOrigin: updateData.countryOfOrigin,
          languagesSpoken: updateData.languagesSpoken,
          culturalBackground: updateData.culturalBackground,
          education: updateData.education,
          professionalField: updateData.professionalField,
          communityAffiliations: updateData.communityAffiliations,
          eventPreferences: updateData.eventPreferences,
          collaborationStyle: updateData.collaborationStyle,
          personalValues: updateData.personalValues,
          digitalIdentity: updateData.digitalIdentity,
          physicalActivityLevel: updateData.physicalActivityLevel,
          culturalExperiences: updateData.culturalExperiences,
          learningStyle: updateData.learningStyle,
          identityPreferences: updateData.identityPreferences
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

  async updateUserIdentityPreferences(userId: number, attributeImportance: Record<string, number>): Promise<User> {
    try {
      storageLog("updateUserIdentityPreferences", { userId, attributeImportance });

      // Get current user to keep existing preferences
      const user = await this.getUser(userId);
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      // Prepare identity preferences
      const identityPreferences = {
        attributeImportance
      };

      // Update only the identity preferences field
      const [updatedUser] = await db
        .update(users)
        .set({
          identityPreferences
        })
        .where(eq(users.id, userId))
        .returning();

      return updatedUser;
    } catch (error) {
      log("Error updating user identity preferences:", error instanceof Error ? error.message : String(error));
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
  
  async getIdentityMatches(userId: number, options: {
    limit?: number;
    identityWeight?: number;
    interestWeight?: number;
    minIdentityMatches?: number;
  } = {}): Promise<any[]> {
    try {
      // Default values if not provided
      const limit = options.limit || 10;
      const identityWeight = options.identityWeight || 0.7;
      const interestWeight = options.interestWeight || 0.3;
      const minIdentityMatches = options.minIdentityMatches !== undefined ? options.minIdentityMatches : 2;
      
      // Get current user
      const currentUser = await this.getUser(userId);
      if (!currentUser) {
        throw new Error(`User with ID ${userId} not found`);
      }
      
      // Get all users except the current user
      const allUsers = await db
        .select()
        .from(users)
        .where(not(eq(users.id, userId)));
        
      // Get user interests
      const userInterestsList = await this.getUserInterests(userId);
      const userInterestNames = userInterestsList.map(interest => interest.name);
      
      // Get user's importance weights for identity attributes
      const attributeImportance = currentUser.identityPreferences?.attributeImportance || {};
      
      // Calculate match scores for each user
      const matches = [];
      
      for (const potentialMatch of allUsers) {
        // Only skip users with no identity information if the minIdentityMatches is greater than 0
        // This allows matching with users who don't have identity attributes when minIdentityMatches is set to 0
        if (minIdentityMatches > 0 && 
            !potentialMatch.gender && !potentialMatch.ageRange && 
            !potentialMatch.countryOfOrigin && !potentialMatch.languagesSpoken &&
            !potentialMatch.culturalBackground && !potentialMatch.education &&
            !potentialMatch.professionalField && !potentialMatch.eventPreferences &&
            !potentialMatch.collaborationStyle) {
          continue;
        }
        
        // Calculate identity match
        const commonIdentities = [];
        let identityScore = 0;
        let maxPossibleScore = 0;
        
        // Default importance weights if not provided by the user
        const defaultImportance = {
          gender: 1,
          ageRange: 1,
          countryOfOrigin: 2,
          languagesSpoken: 2,
          culturalBackground: 3,
          education: 2,
          professionalField: 2,
          communityAffiliations: 2,
          eventPreferences: 1,
          collaborationStyle: 1,
          personalValues: 3,
          digitalIdentity: 1,
          physicalActivityLevel: 1,
          culturalExperiences: 2,
          learningStyle: 1
        };
        
        // Use provided importance or default
        const importance = {
          ...defaultImportance,
          ...attributeImportance
        };
        
        // Gender
        if (currentUser.gender && potentialMatch.gender && 
            currentUser.gender === potentialMatch.gender) {
          identityScore += importance.gender;
          commonIdentities.push('gender');
        }
        maxPossibleScore += importance.gender;
        
        // Age Range
        if (currentUser.ageRange && potentialMatch.ageRange && 
            currentUser.ageRange === potentialMatch.ageRange) {
          identityScore += importance.ageRange;
          commonIdentities.push('ageRange');
        }
        maxPossibleScore += importance.ageRange;
        
        // Country of Origin
        if (currentUser.countryOfOrigin && potentialMatch.countryOfOrigin && 
            currentUser.countryOfOrigin === potentialMatch.countryOfOrigin) {
          identityScore += importance.countryOfOrigin;
          commonIdentities.push('countryOfOrigin');
        }
        maxPossibleScore += importance.countryOfOrigin;
        
        // Languages Spoken
        if (currentUser.languagesSpoken && potentialMatch.languagesSpoken && 
            currentUser.languagesSpoken === potentialMatch.languagesSpoken) {
          identityScore += importance.languagesSpoken;
          commonIdentities.push('languagesSpoken');
        }
        maxPossibleScore += importance.languagesSpoken;
        
        // Education
        if (currentUser.education && potentialMatch.education && 
            currentUser.education === potentialMatch.education) {
          identityScore += importance.education;
          commonIdentities.push('education');
        }
        maxPossibleScore += importance.education;
        
        // Professional Field
        if (currentUser.professionalField && potentialMatch.professionalField && 
            currentUser.professionalField === potentialMatch.professionalField) {
          identityScore += importance.professionalField;
          commonIdentities.push('professionalField');
        }
        maxPossibleScore += importance.professionalField;
        
        // Community Affiliations
        if (currentUser.communityAffiliations && potentialMatch.communityAffiliations && 
            currentUser.communityAffiliations === potentialMatch.communityAffiliations) {
          identityScore += importance.communityAffiliations;
          commonIdentities.push('communityAffiliations');
        }
        maxPossibleScore += importance.communityAffiliations;
        
        // Event Preferences
        if (currentUser.eventPreferences && potentialMatch.eventPreferences && 
            currentUser.eventPreferences === potentialMatch.eventPreferences) {
          identityScore += importance.eventPreferences;
          commonIdentities.push('eventPreferences');
        }
        maxPossibleScore += importance.eventPreferences;
        
        // Collaboration Style
        if (currentUser.collaborationStyle && potentialMatch.collaborationStyle && 
            currentUser.collaborationStyle === potentialMatch.collaborationStyle) {
          identityScore += importance.collaborationStyle;
          commonIdentities.push('collaborationStyle');
        }
        maxPossibleScore += importance.collaborationStyle;
        
        // Personal Values
        if (currentUser.personalValues && potentialMatch.personalValues && 
            currentUser.personalValues === potentialMatch.personalValues) {
          identityScore += importance.personalValues;
          commonIdentities.push('personalValues');
        }
        maxPossibleScore += importance.personalValues;
        
        // Digital Identity
        if (currentUser.digitalIdentity && potentialMatch.digitalIdentity && 
            currentUser.digitalIdentity === potentialMatch.digitalIdentity) {
          identityScore += importance.digitalIdentity;
          commonIdentities.push('digitalIdentity');
        }
        maxPossibleScore += importance.digitalIdentity;
        
        // Physical Activity Level
        if (currentUser.physicalActivityLevel && potentialMatch.physicalActivityLevel && 
            currentUser.physicalActivityLevel === potentialMatch.physicalActivityLevel) {
          identityScore += importance.physicalActivityLevel;
          commonIdentities.push('physicalActivityLevel');
        }
        maxPossibleScore += importance.physicalActivityLevel;
        
        // Cultural Experiences
        if (currentUser.culturalExperiences && potentialMatch.culturalExperiences && 
            currentUser.culturalExperiences === potentialMatch.culturalExperiences) {
          identityScore += importance.culturalExperiences;
          commonIdentities.push('culturalExperiences');
        }
        maxPossibleScore += importance.culturalExperiences;
        
        // Learning Style
        if (currentUser.learningStyle && potentialMatch.learningStyle && 
            currentUser.learningStyle === potentialMatch.learningStyle) {
          identityScore += importance.learningStyle;
          commonIdentities.push('learningStyle');
        }
        maxPossibleScore += importance.learningStyle;
        
        // Cultural Background
        if (currentUser.culturalBackground && potentialMatch.culturalBackground && 
            currentUser.culturalBackground === potentialMatch.culturalBackground) {
          identityScore += importance.culturalBackground;
          commonIdentities.push('culturalBackground');
        }
        maxPossibleScore += importance.culturalBackground;
        
        // Only skip users based on minimum identity matches if minIdentityMatches is greater than 0
        if (minIdentityMatches > 0 && commonIdentities.length < minIdentityMatches) {
          continue;
        }
        
        // Normalize identity score
        const normalizedIdentityScore = maxPossibleScore > 0 ? identityScore / maxPossibleScore : 0;
        
        // Calculate interest match score
        let interestScore = 0;
        const matchInterests = await this.getUserInterests(potentialMatch.id);
        const matchInterestNames = matchInterests.map(interest => interest.name);
        
        // Find shared interests
        const sharedInterests = userInterestNames.filter(interest => 
          matchInterestNames.includes(interest)
        );
        
        // Calculate score based on number of shared interests
        const totalInterestCount = new Set([...userInterestNames, ...matchInterestNames]).size;
        interestScore = totalInterestCount > 0 ? sharedInterests.length / totalInterestCount : 0;
        
        // Calculate combined score
        const combinedScore = (identityWeight * normalizedIdentityScore) + 
                             (interestWeight * interestScore);
        
        matches.push({
          userId: potentialMatch.id,
          username: potentialMatch.username,
          displayName: potentialMatch.displayName,
          avatar: potentialMatch.avatar,
          bio: potentialMatch.bio,
          matchScore: combinedScore,
          sharedIdentityCount: commonIdentities.length,
          identityScore: normalizedIdentityScore,
          interestScore: interestScore,
          sharedInterests: sharedInterests,
          commonIdentities: commonIdentities
        });
      }
      
      // Sort matches by combined score (highest first)
      return matches
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, limit);
    } catch (error) {
      log("Error getting identity matches:", error instanceof Error ? error.message : String(error));
      throw error;
    }
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

  async addAiGeneratedInterest(name: string): Promise<Interest> {
    try {
      const [interest] = await db
        .insert(interests)
        .values({
          name,
          category: 'AI_GENERATED',
          description: `AI-suggested interest based on user preferences`,
          isAiGenerated: true
        })
        .returning();
      return interest;
    } catch (error) {
      log("Error creating AI interest:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async getOrCreateAiInterest(name: string): Promise<Interest> {
    try {
      // First try to find existing interest
      const [existingInterest] = await db
        .select()
        .from(interests)
        .where(eq(interests.name, name));

      if (existingInterest) {
        return existingInterest;
      }

      // If not found, create new AI-generated interest
      return await this.addAiGeneratedInterest(name);
    } catch (error) {
      log("Error in getOrCreateAiInterest:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async deleteInterest(id: number): Promise<void> {
    try {
      // First delete all user-interest relationships
      await db.delete(userInterests).where(eq(userInterests.interestId, id));
      
      // Then delete all interest content records (to avoid foreign key constraint violations)
      await db.delete(interestContent).where(eq(interestContent.interestId, id));

      // Finally delete the interest itself
      await db.delete(interests).where(eq(interests.id, id));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log("Error deleting interest:", errorMessage);
      throw error;
    }
  }
  async createInterest(interest: InsertInterest): Promise<Interest> {
    try {
      const [newInterest] = await db
        .insert(interests)
        .values(interest)
        .returning();
      return newInterest;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log("Error creating interest:", errorMessage);
      throw error;
    }
  }

  async getInterestByName(name: string): Promise<Interest | undefined> {
    try {
      const [interest] = await db
        .select()
        .from(interests)
        .where(eq(interests.name, name));
      return interest;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log("Error getting interest by name:", errorMessage);
      throw error;
    }
  }
  
  async updateInterest(id: number, data: Partial<InsertInterest>): Promise<Interest> {
    try {
      log(`Updating interest with ID ${id}:`, JSON.stringify(data));
      
      const [updatedInterest] = await db
        .update(interests)
        .set(data)
        .where(eq(interests.id, id))
        .returning();
      
      if (!updatedInterest) {
        throw new Error(`Interest with ID ${id} not found`);
      }
      
      return updatedInterest;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log("Error updating interest:", errorMessage);
      throw error;
    }
  }

  // Entity methods
  async getAllEntities(): Promise<Entity[]> {
    return await db.select().from(entities);
  }

  async getEntitiesByCategory(category: string): Promise<Entity[]> {
    return await db
      .select()
      .from(entities)
      .where(eq(entities.category, category));
  }

  async getEntity(id: number): Promise<Entity | undefined> {
    const [entity] = await db
      .select()
      .from(entities)
      .where(eq(entities.id, id));
    return entity;
  }

  async getEntityByName(name: string): Promise<Entity | undefined> {
    const [entity] = await db
      .select()
      .from(entities)
      .where(eq(entities.name, name));
    return entity;
  }

  async createEntity(entity: InsertEntity): Promise<Entity> {
    try {
      const [newEntity] = await db
        .insert(entities)
        .values({
          name: entity.name,
          category: entity.category,
          description: entity.description || undefined,
          entityType: entity.entityType,
          iconUrl: entity.iconUrl || undefined,
          coordinates: entity.coordinates || undefined
        })
        .returning();
      return newEntity;
    } catch (error) {
      log("Error creating entity:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async getEntityContent(entityId: number): Promise<EntityContent[]> {
    return await db
      .select()
      .from(entityContent)
      .where(eq(entityContent.entityId, entityId));
  }

  async addEntityContent(content: InsertEntityContent): Promise<EntityContent> {
    const [newContent] = await db
      .insert(entityContent)
      .values({
        entityId: content.entityId,
        title: content.title,
        description: content.description || undefined,
        url: content.url || undefined,
        thumbnailUrl: content.thumbnailUrl || undefined,
        type: content.type
      })
      .returning();
    return newContent;
  }

  async deleteEntity(id: number): Promise<void> {
    // First delete all entity content
    await db
      .delete(entityContent)
      .where(eq(entityContent.entityId, id));
    
    // Then delete the entity
    await db
      .delete(entities)
      .where(eq(entities.id, id));
  }
}

export const storage = new DatabaseStorage();
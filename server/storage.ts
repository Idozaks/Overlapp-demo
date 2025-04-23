import { users, posts, comments, connections, likes, wallets, nfts, transactions, interests, interestContent, userInterests, entities, entityContent, conversations, conversationParticipants, messages, messageStatus, aiCompanions, aiConversationContext, tenants, tenantProfiles, widgetSessions, widgetAnalytics, type Interest, type InterestContent, type UserInterest, type InsertInterest, type InsertInterestContent, type InsertUserInterest, type Entity, type EntityContent, type InsertEntity, type InsertEntityContent, type Conversation, type ConversationParticipant, type Message, type MessageStatus, type AiCompanion, type AiConversationContext, type InsertConversation, type InsertConversationParticipant, type InsertMessage, type InsertMessageStatus, type InsertAiCompanion, type InsertAiConversationContext, type MessageWithSender, type ConversationWithParticipants, type ConversationWithLastMessage, type Tenant, type TenantProfile, type WidgetSession, type WidgetAnalytics, type InsertTenant, type InsertTenantProfile, type InsertWidgetSession, type InsertWidgetAnalytics, type TenantWithProfile, type WidgetSessionWithDetails } from "@shared/schema";
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
  getOrCreateAiUser(): Promise<User>;

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
  
  // OverlapLite Widget operations
  // Tenant operations
  createTenant(tenant: InsertTenant): Promise<Tenant>;
  getTenant(id: number): Promise<Tenant | undefined>;
  getTenantByEmail(email: string): Promise<Tenant | undefined>;
  getTenantByTenantId(tenantId: string): Promise<Tenant | undefined>;
  getAllTenants(): Promise<Tenant[]>;
  updateTenant(id: number, data: Partial<InsertTenant>): Promise<Tenant>;
  deleteTenant(id: number): Promise<void>;
  validateTenantCredentials(email: string, password: string): Promise<Tenant | null>;
  updateTenantStripeInfo(tenantId: number, stripeCustomerId: string, stripeSubscriptionId?: string): Promise<Tenant>;
  
  // Tenant Profile operations
  createTenantProfile(profile: InsertTenantProfile): Promise<TenantProfile>;
  getTenantProfile(tenantId: number): Promise<TenantProfile | undefined>;
  updateTenantProfile(id: number, data: Partial<InsertTenantProfile>): Promise<TenantProfile>;
  getTenantWithProfile(tenantId: number): Promise<TenantWithProfile | undefined>;
  
  // Widget Session operations
  createWidgetSession(session: InsertWidgetSession): Promise<WidgetSession>;
  getWidgetSession(id: number): Promise<WidgetSession | undefined>;
  getWidgetSessionBySessionId(sessionId: string): Promise<WidgetSession | undefined>;
  updateWidgetSession(id: number, data: Partial<InsertWidgetSession>): Promise<WidgetSession>;
  getWidgetSessionsForTenant(tenantId: number): Promise<WidgetSession[]>;
  
  // Widget Analytics operations
  trackWidgetEvent(analytics: InsertWidgetAnalytics): Promise<WidgetAnalytics>;
  getWidgetAnalyticsForTenant(tenantId: number): Promise<WidgetAnalytics[]>;
  getWidgetAnalyticsByEventType(tenantId: number, eventType: string): Promise<WidgetAnalytics[]>;
  
  // Overlap calculation 
  calculateOverlap(userId: number, tenantId: number): Promise<{ score: number, commonInterests: string[] }>;
  
  // Chat operations
  // Conversation operations
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversation(id: number): Promise<Conversation | undefined>;
  getUserConversations(userId: number): Promise<ConversationWithLastMessage[]>;
  updateConversation(id: number, data: Partial<InsertConversation>): Promise<Conversation>;
  deleteConversation(id: number): Promise<void>;
  
  // Conversation participants
  addConversationParticipant(participant: InsertConversationParticipant): Promise<ConversationParticipant>;
  getConversationParticipants(conversationId: number): Promise<(ConversationParticipant & { user: User })[]>;
  updateParticipantSettings(participantId: number, settings: any): Promise<ConversationParticipant>;
  removeParticipantFromConversation(conversationId: number, userId: number): Promise<void>;
  
  // Message operations
  sendMessage(message: InsertMessage): Promise<Message>;
  getConversationMessages(conversationId: number, limit?: number, before?: number): Promise<MessageWithSender[]>;
  updateMessageStatus(statusUpdate: InsertMessageStatus): Promise<MessageStatus>;
  getUnreadMessageCount(conversationId: number, userId: number): Promise<number>;
  markMessagesAsRead(conversationId: number, userId: number, messageId?: number): Promise<void>;
  deleteMessage(messageId: number): Promise<void>;
  
  // AI Companion operations
  createAiCompanion(companion: InsertAiCompanion): Promise<AiCompanion>;
  getAiCompanion(id: number): Promise<AiCompanion | undefined>;
  getPublicAiCompanions(): Promise<AiCompanion[]>;
  getUserAiCompanions(userId: number): Promise<AiCompanion[]>;
  updateAiCompanion(id: number, data: Partial<InsertAiCompanion>): Promise<AiCompanion>;
  deleteAiCompanion(id: number): Promise<void>;
  
  // AI Conversation context
  saveAiConversationContext(context: InsertAiConversationContext): Promise<AiConversationContext>;
  getAiConversationContext(conversationId: number): Promise<AiConversationContext | undefined>;
  updateAiConversationContext(id: number, data: Partial<InsertAiConversationContext>): Promise<AiConversationContext>;
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

  /**
   * Gets or creates a special AI user account for AI companions
   * 
   * @returns The AI user
   */
  async getOrCreateAiUser(): Promise<User> {
    try {
      // Try to find the existing AI user (using ID 1 as the standard AI user ID)
      const existingUser = await this.getUser(1);
      if (existingUser) {
        log("Found existing AI user:", existingUser.username);
        return existingUser;
      }

      // Create AI user if not found
      log("AI user not found, creating...");
      // Generate a secure random password
      const randomPassword = Math.random().toString(36).substring(2, 15) + 
                            Math.random().toString(36).substring(2, 15);
      
      const aiUser = await this.createUser({
        username: "ai_assistant", 
        displayName: "AI Assistant",
        password: randomPassword, // Random password that won't be used
        isAdmin: false,
        avatar: null // Could set a default AI avatar
      });

      log("Created AI user:", aiUser.username);
      return aiUser;
    } catch (error) {
      log("Error getting/creating AI user:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
  
  // OverlapLite Widget Implementation
  
  // Tenant operations
  async createTenant(tenant: InsertTenant): Promise<Tenant> {
    try {
      storageLog("createTenant", { tenant: { ...tenant, password: "[REDACTED]" } });
      
      const [newTenant] = await db
        .insert(tenants)
        .values({
          name: tenant.name,
          email: tenant.email,
          password: tenant.password,
          logoUrl: tenant.logoUrl,
          settings: tenant.settings || {}
        })
        .returning();
      
      return newTenant;
    } catch (error) {
      log("Error creating tenant:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
  
  async getTenant(id: number): Promise<Tenant | undefined> {
    try {
      const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
      return tenant;
    } catch (error) {
      log(`Error getting tenant by ID ${id}:`, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
  
  async getTenantByEmail(email: string): Promise<Tenant | undefined> {
    try {
      const [tenant] = await db.select().from(tenants).where(eq(tenants.email, email));
      return tenant;
    } catch (error) {
      log(`Error getting tenant by email ${email}:`, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
  
  async getTenantByTenantId(tenantId: string): Promise<Tenant | undefined> {
    try {
      const [tenant] = await db.select().from(tenants).where(eq(tenants.tenantId, tenantId));
      return tenant;
    } catch (error) {
      log(`Error getting tenant by tenant ID ${tenantId}:`, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
  
  async getAllTenants(): Promise<Tenant[]> {
    try {
      return await db.select().from(tenants);
    } catch (error) {
      log("Error getting all tenants:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
  
  async updateTenant(id: number, data: Partial<InsertTenant>): Promise<Tenant> {
    try {
      storageLog("updateTenant", { id, data: { ...data, password: data.password ? "[REDACTED]" : undefined } });
      
      const updateData: any = { ...data };
      delete updateData.email; // Don't allow email to be updated as it's used for authentication
      
      if (data.settings) {
        updateData.settings = data.settings;
      }
      
      const [updatedTenant] = await db
        .update(tenants)
        .set({
          ...updateData,
          updatedAt: new Date()
        })
        .where(eq(tenants.id, id))
        .returning();
      
      if (!updatedTenant) {
        throw new Error(`Tenant with ID ${id} not found`);
      }
      
      return updatedTenant;
    } catch (error) {
      log(`Error updating tenant ${id}:`, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
  
  async deleteTenant(id: number): Promise<void> {
    try {
      await db.transaction(async (tx) => {
        // Delete related tenant profile
        await tx.delete(tenantProfiles).where(eq(tenantProfiles.tenantId, id));
        
        // Delete widget analytics
        await tx.delete(widgetAnalytics).where(eq(widgetAnalytics.tenantId, id));
        
        // Delete widget sessions
        await tx.delete(widgetSessions).where(eq(widgetSessions.tenantId, id));
        
        // Delete tenant
        await tx.delete(tenants).where(eq(tenants.id, id));
      });
    } catch (error) {
      log(`Error deleting tenant ${id}:`, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
  
  async validateTenantCredentials(email: string, password: string): Promise<Tenant | null> {
    try {
      const tenant = await this.getTenantByEmail(email);
      if (!tenant) {
        log(`Tenant not found with email: ${email}`);
        return null;
      }
      
      // Password comparison will be done in tenant auth logic
      return tenant;
    } catch (error) {
      log(`Error validating tenant credentials:`, error instanceof Error ? error.message : String(error));
      return null;
    }
  }
  
  async updateTenantStripeInfo(tenantId: number, stripeCustomerId: string, stripeSubscriptionId?: string): Promise<Tenant> {
    try {
      const [updatedTenant] = await db
        .update(tenants)
        .set({
          stripeCustomerId,
          ...(stripeSubscriptionId ? { stripeSubscriptionId } : {}),
          updatedAt: new Date()
        })
        .where(eq(tenants.id, tenantId))
        .returning();
      
      if (!updatedTenant) {
        throw new Error(`Tenant with ID ${tenantId} not found`);
      }
      
      return updatedTenant;
    } catch (error) {
      log(`Error updating tenant stripe info:`, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
  
  // Tenant Profile operations
  async createTenantProfile(profile: InsertTenantProfile): Promise<TenantProfile> {
    try {
      storageLog("createTenantProfile", { profile });
      
      const [newProfile] = await db
        .insert(tenantProfiles)
        .values({
          tenantId: profile.tenantId,
          name: profile.name,
          description: profile.description,
          tags: profile.tags || []
        })
        .returning();
      
      return newProfile;
    } catch (error) {
      log("Error creating tenant profile:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
  
  async getTenantProfile(tenantId: number): Promise<TenantProfile | undefined> {
    try {
      const [profile] = await db
        .select()
        .from(tenantProfiles)
        .where(eq(tenantProfiles.tenantId, tenantId));
      
      return profile;
    } catch (error) {
      log(`Error getting tenant profile for tenant ${tenantId}:`, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
  
  async updateTenantProfile(id: number, data: Partial<InsertTenantProfile>): Promise<TenantProfile> {
    try {
      storageLog("updateTenantProfile", { id, data });
      
      const [updatedProfile] = await db
        .update(tenantProfiles)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(tenantProfiles.id, id))
        .returning();
      
      if (!updatedProfile) {
        throw new Error(`Tenant profile with ID ${id} not found`);
      }
      
      return updatedProfile;
    } catch (error) {
      log(`Error updating tenant profile ${id}:`, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
  
  async getTenantWithProfile(tenantId: number): Promise<TenantWithProfile | undefined> {
    try {
      const tenant = await this.getTenant(tenantId);
      if (!tenant) return undefined;
      
      const profile = await this.getTenantProfile(tenantId);
      if (!profile) return undefined;
      
      return {
        ...tenant,
        profile
      };
    } catch (error) {
      log(`Error getting tenant with profile for tenant ${tenantId}:`, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
  
  // Widget Session operations
  async createWidgetSession(session: InsertWidgetSession): Promise<WidgetSession> {
    try {
      storageLog("createWidgetSession", { session });
      
      const [newSession] = await db
        .insert(widgetSessions)
        .values({
          tenantId: session.tenantId,
          userId: session.userId,
          score: session.score,
          commonInterests: session.commonInterests || [],
          metadata: session.metadata || {},
          status: session.status || 'pending'
        })
        .returning();
      
      return newSession;
    } catch (error) {
      log("Error creating widget session:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
  
  async getWidgetSession(id: number): Promise<WidgetSession | undefined> {
    try {
      const [session] = await db
        .select()
        .from(widgetSessions)
        .where(eq(widgetSessions.id, id));
      
      return session;
    } catch (error) {
      log(`Error getting widget session ${id}:`, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
  
  async getWidgetSessionBySessionId(sessionId: string): Promise<WidgetSession | undefined> {
    try {
      const [session] = await db
        .select()
        .from(widgetSessions)
        .where(eq(widgetSessions.sessionId, sessionId));
      
      return session;
    } catch (error) {
      log(`Error getting widget session by session ID ${sessionId}:`, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
  
  async updateWidgetSession(id: number, data: Partial<InsertWidgetSession>): Promise<WidgetSession> {
    try {
      storageLog("updateWidgetSession", { id, data });
      
      const [updatedSession] = await db
        .update(widgetSessions)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(widgetSessions.id, id))
        .returning();
      
      if (!updatedSession) {
        throw new Error(`Widget session with ID ${id} not found`);
      }
      
      return updatedSession;
    } catch (error) {
      log(`Error updating widget session ${id}:`, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
  
  async getWidgetSessionsForTenant(tenantId: number): Promise<WidgetSession[]> {
    try {
      return await db
        .select()
        .from(widgetSessions)
        .where(eq(widgetSessions.tenantId, tenantId))
        .orderBy(desc(widgetSessions.createdAt));
    } catch (error) {
      log(`Error getting widget sessions for tenant ${tenantId}:`, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
  
  // Widget Analytics operations
  async trackWidgetEvent(analytics: InsertWidgetAnalytics): Promise<WidgetAnalytics> {
    try {
      storageLog("trackWidgetEvent", { analytics });
      
      const [event] = await db
        .insert(widgetAnalytics)
        .values({
          tenantId: analytics.tenantId,
          eventType: analytics.eventType,
          sessionId: analytics.sessionId,
          data: analytics.data || {}
        })
        .returning();
      
      return event;
    } catch (error) {
      log("Error tracking widget event:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
  
  async getWidgetAnalyticsForTenant(tenantId: number): Promise<WidgetAnalytics[]> {
    try {
      return await db
        .select()
        .from(widgetAnalytics)
        .where(eq(widgetAnalytics.tenantId, tenantId))
        .orderBy(desc(widgetAnalytics.createdAt));
    } catch (error) {
      log(`Error getting widget analytics for tenant ${tenantId}:`, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
  
  async getWidgetAnalyticsByEventType(tenantId: number, eventType: string): Promise<WidgetAnalytics[]> {
    try {
      return await db
        .select()
        .from(widgetAnalytics)
        .where(and(
          eq(widgetAnalytics.tenantId, tenantId),
          eq(widgetAnalytics.eventType, eventType)
        ))
        .orderBy(desc(widgetAnalytics.createdAt));
    } catch (error) {
      log(`Error getting widget analytics for tenant ${tenantId} and event type ${eventType}:`, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
  
  // Overlap calculation
  async calculateOverlap(userId: number, tenantId: number): Promise<{ score: number, commonInterests: string[] }> {
    try {
      // Get user interests
      const user = await this.getUser(userId);
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }
      
      // Get tenant profile
      const tenantProfile = await this.getTenantProfile(tenantId);
      if (!tenantProfile) {
        throw new Error(`Tenant profile for tenant ID ${tenantId} not found`);
      }
      
      // Extract interest arrays
      const userInterests = user.preferences?.interests || [];
      const tenantTags = tenantProfile.tags || [];
      
      // Calculate common interests
      const commonInterests = userInterests.filter(interest => 
        tenantTags.includes(interest)
      );
      
      // Calculate score based on match percentage (0-100)
      const totalUniqueInterests = new Set([...userInterests, ...tenantTags]).size;
      const score = totalUniqueInterests > 0 
        ? Math.floor((commonInterests.length / totalUniqueInterests) * 100) 
        : 0;
      
      // Return result
      return {
        score,
        commonInterests: commonInterests.slice(0, 5) // Top 5 common interests
      };
    } catch (error) {
      log(`Error calculating overlap between user ${userId} and tenant ${tenantId}:`, error instanceof Error ? error.message : String(error));
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

  // Chat Implementation
  // Conversation operations
  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    try {
      const [newConversation] = await db
        .insert(conversations)
        .values({
          name: conversation.name,
          type: conversation.type,
          createdBy: conversation.createdBy,
          metadata: conversation.metadata,
          updatedAt: new Date()
        })
        .returning();
      return newConversation;
    } catch (error) {
      log("Error creating conversation:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id));
    return conversation;
  }

  async getUserConversations(userId: number): Promise<ConversationWithLastMessage[]> {
    try {
      // First get all conversation IDs the user is part of
      const userParticipations = await db
        .select({
          conversationId: conversationParticipants.conversationId
        })
        .from(conversationParticipants)
        .where(eq(conversationParticipants.userId, userId));

      const conversationIds = userParticipations.map(p => p.conversationId);

      if (conversationIds.length === 0) {
        return [];
      }

      // Get all conversations with their participants
      const result = await db
        .select({
          conversation: conversations,
          participant: conversationParticipants,
          user: users
        })
        .from(conversations)
        .innerJoin(conversationParticipants, eq(conversationParticipants.conversationId, conversations.id))
        .innerJoin(users, eq(users.id, conversationParticipants.userId))
        .where(inArray(conversations.id, conversationIds))
        .orderBy(desc(conversations.updatedAt));

      // Group by conversation
      const conversationsMap = new Map<number, ConversationWithParticipants>();
      
      for (const { conversation, participant, user } of result) {
        if (!conversationsMap.has(conversation.id)) {
          conversationsMap.set(conversation.id, {
            ...conversation,
            participants: [],
            lastMessage: null,
            unreadCount: 0
          });
        }
        
        const existingConversation = conversationsMap.get(conversation.id)!;
        existingConversation.participants.push({
          ...participant,
          user
        });
      }

      // Get last message for each conversation
      const conversationsWithLastMessage: ConversationWithLastMessage[] = [];
      
      for (const conversation of conversationsMap.values()) {
        const lastMessages = await db
          .select({
            message: messages,
            sender: users
          })
          .from(messages)
          .leftJoin(users, eq(users.id, messages.senderId))
          .where(eq(messages.conversationId, conversation.id))
          .orderBy(desc(messages.createdAt))
          .limit(1);

        // Get unread count
        const participant = conversation.participants.find(p => p.userId === userId);
        let unreadCount = 0;
        
        if (participant) {
          const lastReadId = participant.lastReadMessageId || 0;
          const unreadResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(messages)
            .where(
              and(
                eq(messages.conversationId, conversation.id),
                messages.id > lastReadId
              )
            );
          
          unreadCount = unreadResult[0]?.count || 0;
        }

        conversationsWithLastMessage.push({
          ...conversation,
          lastMessage: lastMessages.length > 0 ? 
            { ...lastMessages[0].message, sender: lastMessages[0].sender } : null,
          unreadCount
        });
      }

      return conversationsWithLastMessage;
    } catch (error) {
      log("Error getting user conversations:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async updateConversation(id: number, data: Partial<InsertConversation>): Promise<Conversation> {
    try {
      const [conversation] = await db
        .update(conversations)
        .set({
          name: data.name,
          type: data.type,
          metadata: data.metadata,
          updatedAt: new Date()
        })
        .where(eq(conversations.id, id))
        .returning();
      
      return conversation;
    } catch (error) {
      log("Error updating conversation:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async deleteConversation(id: number): Promise<void> {
    try {
      await db.transaction(async (tx) => {
        // Delete all messages status records
        const messageIds = await tx
          .select({ id: messages.id })
          .from(messages)
          .where(eq(messages.conversationId, id));
        
        if (messageIds.length > 0) {
          const ids = messageIds.map(m => m.id);
          await tx.delete(messageStatus).where(inArray(messageStatus.messageId, ids));
        }
        
        // Delete all messages
        await tx.delete(messages).where(eq(messages.conversationId, id));
        
        // Delete all participants
        await tx.delete(conversationParticipants).where(eq(conversationParticipants.conversationId, id));
        
        // Delete AI conversation context if exists
        await tx.delete(aiConversationContext).where(eq(aiConversationContext.conversationId, id));
        
        // Delete the conversation
        await tx.delete(conversations).where(eq(conversations.id, id));
      });
    } catch (error) {
      log("Error deleting conversation:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  // Conversation participants
  async addConversationParticipant(participant: InsertConversationParticipant): Promise<ConversationParticipant> {
    try {
      const [newParticipant] = await db
        .insert(conversationParticipants)
        .values({
          conversationId: participant.conversationId,
          userId: participant.userId,
          role: participant.role,
          settings: participant.settings
        })
        .returning();
      
      return newParticipant;
    } catch (error) {
      log("Error adding conversation participant:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async getConversationParticipants(conversationId: number): Promise<(ConversationParticipant & { user: User })[]> {
    try {
      const participants = await db
        .select({
          participant: conversationParticipants,
          user: users
        })
        .from(conversationParticipants)
        .innerJoin(users, eq(users.id, conversationParticipants.userId))
        .where(eq(conversationParticipants.conversationId, conversationId));
      
      return participants.map(({ participant, user }) => ({
        ...participant,
        user
      }));
    } catch (error) {
      log("Error getting conversation participants:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async updateParticipantSettings(participantId: number, settings: any): Promise<ConversationParticipant> {
    try {
      const [participant] = await db
        .update(conversationParticipants)
        .set({
          settings,
          lastSeenAt: new Date()
        })
        .where(eq(conversationParticipants.id, participantId))
        .returning();
      
      return participant;
    } catch (error) {
      log("Error updating participant settings:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async removeParticipantFromConversation(conversationId: number, userId: number): Promise<void> {
    try {
      await db.delete(conversationParticipants)
        .where(
          and(
            eq(conversationParticipants.conversationId, conversationId),
            eq(conversationParticipants.userId, userId)
          )
        );
    } catch (error) {
      log("Error removing participant from conversation:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  // Message operations
  async sendMessage(message: InsertMessage): Promise<Message> {
    try {
      // First, insert the message
      const [newMessage] = await db
        .insert(messages)
        .values({
          conversationId: message.conversationId,
          senderId: message.senderId,
          content: message.content,
          contentType: message.contentType || 'text',
          mediaUrl: message.mediaUrl,
          metadata: message.metadata
        })
        .returning();
      
      // Then, update the conversation's updatedAt timestamp
      await db
        .update(conversations)
        .set({ updatedAt: new Date() })
        .where(eq(conversations.id, message.conversationId));
      
      // Finally, create message status entries for all participants
      const participants = await db
        .select()
        .from(conversationParticipants)
        .where(eq(conversationParticipants.conversationId, message.conversationId));
      
      for (const participant of participants) {
        // Set status to 'read' for the sender, 'sent' for others
        const status = participant.userId === message.senderId ? 'read' : 'sent';
        
        await db
          .insert(messageStatus)
          .values({
            messageId: newMessage.id,
            userId: participant.userId,
            status
          });
        
        // Update lastReadMessageId for the sender
        if (participant.userId === message.senderId) {
          await db
            .update(conversationParticipants)
            .set({
              lastReadMessageId: newMessage.id,
              lastSeenAt: new Date()
            })
            .where(eq(conversationParticipants.id, participant.id));
        }
      }
      
      return newMessage;
    } catch (error) {
      log("Error sending message:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async getConversationMessages(conversationId: number, limit: number = 50, before?: number): Promise<MessageWithSender[]> {
    try {
      let query = db
        .select({
          message: messages,
          sender: users
        })
        .from(messages)
        .leftJoin(users, eq(users.id, messages.senderId))
        .where(eq(messages.conversationId, conversationId));
      
      if (before) {
        query = query.where(messages.id < before);
      }
      
      const result = await query
        .orderBy(desc(messages.createdAt))
        .limit(limit);
      
      // Return in chronological order (oldest first)
      return result
        .map(({ message, sender }) => ({
          ...message,
          sender
        }))
        .reverse();
    } catch (error) {
      log("Error getting conversation messages:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async updateMessageStatus(statusUpdate: InsertMessageStatus): Promise<MessageStatus> {
    try {
      // First check if status exists
      const existingStatus = await db
        .select()
        .from(messageStatus)
        .where(
          and(
            eq(messageStatus.messageId, statusUpdate.messageId),
            eq(messageStatus.userId, statusUpdate.userId)
          )
        );
      
      if (existingStatus.length > 0) {
        // Update existing status
        const [updatedStatus] = await db
          .update(messageStatus)
          .set({
            status: statusUpdate.status,
            updatedAt: new Date()
          })
          .where(
            and(
              eq(messageStatus.messageId, statusUpdate.messageId),
              eq(messageStatus.userId, statusUpdate.userId)
            )
          )
          .returning();
        
        return updatedStatus;
      } else {
        // Create new status
        const [newStatus] = await db
          .insert(messageStatus)
          .values({
            messageId: statusUpdate.messageId,
            userId: statusUpdate.userId,
            status: statusUpdate.status
          })
          .returning();
        
        return newStatus;
      }
    } catch (error) {
      log("Error updating message status:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async getUnreadMessageCount(conversationId: number, userId: number): Promise<number> {
    try {
      // Get the participant to find the lastReadMessageId
      const [participant] = await db
        .select()
        .from(conversationParticipants)
        .where(
          and(
            eq(conversationParticipants.conversationId, conversationId),
            eq(conversationParticipants.userId, userId)
          )
        );
      
      if (!participant) {
        return 0;
      }
      
      const lastReadId = participant.lastReadMessageId || 0;
      
      // Count messages newer than lastReadId
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(messages)
        .where(
          and(
            eq(messages.conversationId, conversationId),
            messages.id > lastReadId
          )
        );
      
      return result[0]?.count || 0;
    } catch (error) {
      log("Error getting unread message count:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async markMessagesAsRead(conversationId: number, userId: number, messageId?: number): Promise<void> {
    try {
      // Find the participant
      const [participant] = await db
        .select()
        .from(conversationParticipants)
        .where(
          and(
            eq(conversationParticipants.conversationId, conversationId),
            eq(conversationParticipants.userId, userId)
          )
        );
      
      if (!participant) {
        return;
      }
      
      // If messageId is provided, use that; otherwise find the latest message
      let lastMessageId = messageId;
      
      if (!lastMessageId) {
        const latestMessages = await db
          .select()
          .from(messages)
          .where(eq(messages.conversationId, conversationId))
          .orderBy(desc(messages.createdAt))
          .limit(1);
        
        if (latestMessages.length > 0) {
          lastMessageId = latestMessages[0].id;
        } else {
          return; // No messages to mark as read
        }
      }
      
      // Update participant's lastReadMessageId
      await db
        .update(conversationParticipants)
        .set({
          lastReadMessageId: lastMessageId,
          lastSeenAt: new Date()
        })
        .where(eq(conversationParticipants.id, participant.id));
      
      // Update message statuses
      await db
        .update(messageStatus)
        .set({
          status: 'read',
          updatedAt: new Date()
        })
        .where(
          and(
            eq(messageStatus.userId, userId),
            inArray(
              messageStatus.messageId,
              db
                .select({ id: messages.id })
                .from(messages)
                .where(
                  and(
                    eq(messages.conversationId, conversationId),
                    messages.id <= lastMessageId!
                  )
                )
            )
          )
        );
    } catch (error) {
      log("Error marking messages as read:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async deleteMessage(messageId: number): Promise<void> {
    try {
      // Soft delete - just mark as deleted
      await db
        .update(messages)
        .set({
          isDeleted: true,
          content: "[This message was deleted]",
          mediaUrl: null
        })
        .where(eq(messages.id, messageId));
    } catch (error) {
      log("Error deleting message:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  // AI Companion operations
  async createAiCompanion(companion: InsertAiCompanion): Promise<AiCompanion> {
    try {
      const [newCompanion] = await db
        .insert(aiCompanions)
        .values({
          name: companion.name,
          description: companion.description,
          avatarUrl: companion.avatarUrl,
          createdBy: companion.createdBy,
          personality: companion.personality,
          systemPrompt: companion.systemPrompt,
          isPublic: companion.isPublic,
          settings: companion.settings
        })
        .returning();
      
      return newCompanion;
    } catch (error) {
      log("Error creating AI companion:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async getAiCompanion(id: number): Promise<AiCompanion | undefined> {
    try {
      const [companion] = await db
        .select()
        .from(aiCompanions)
        .where(eq(aiCompanions.id, id));
      
      return companion;
    } catch (error) {
      log("Error getting AI companion:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async getPublicAiCompanions(): Promise<AiCompanion[]> {
    try {
      return await db
        .select()
        .from(aiCompanions)
        .where(eq(aiCompanions.isPublic, true));
    } catch (error) {
      log("Error getting public AI companions:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async getUserAiCompanions(userId: number): Promise<AiCompanion[]> {
    try {
      return await db
        .select()
        .from(aiCompanions)
        .where(
          or(
            eq(aiCompanions.createdBy, userId),
            eq(aiCompanions.isPublic, true)
          )
        );
    } catch (error) {
      log("Error getting user AI companions:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async updateAiCompanion(id: number, data: Partial<InsertAiCompanion>): Promise<AiCompanion> {
    try {
      const [companion] = await db
        .update(aiCompanions)
        .set({
          name: data.name,
          description: data.description,
          avatarUrl: data.avatarUrl,
          personality: data.personality,
          systemPrompt: data.systemPrompt,
          isPublic: data.isPublic,
          settings: data.settings
        })
        .where(eq(aiCompanions.id, id))
        .returning();
      
      return companion;
    } catch (error) {
      log("Error updating AI companion:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async deleteAiCompanion(id: number): Promise<void> {
    try {
      await db
        .delete(aiCompanions)
        .where(eq(aiCompanions.id, id));
    } catch (error) {
      log("Error deleting AI companion:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  // AI Conversation context
  async saveAiConversationContext(context: InsertAiConversationContext): Promise<AiConversationContext> {
    try {
      // Check if context already exists
      const existingContext = await db
        .select()
        .from(aiConversationContext)
        .where(eq(aiConversationContext.conversationId, context.conversationId));
      
      if (existingContext.length > 0) {
        // Update existing context
        const [updatedContext] = await db
          .update(aiConversationContext)
          .set({
            context: context.context,
            updatedAt: new Date()
          })
          .where(eq(aiConversationContext.id, existingContext[0].id))
          .returning();
        
        return updatedContext;
      } else {
        // Create new context
        const [newContext] = await db
          .insert(aiConversationContext)
          .values({
            conversationId: context.conversationId,
            context: context.context
          })
          .returning();
        
        return newContext;
      }
    } catch (error) {
      log("Error saving AI conversation context:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async getAiConversationContext(conversationId: number): Promise<AiConversationContext | undefined> {
    try {
      const [context] = await db
        .select()
        .from(aiConversationContext)
        .where(eq(aiConversationContext.conversationId, conversationId));
      
      return context;
    } catch (error) {
      log("Error getting AI conversation context:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async updateAiConversationContext(id: number, data: Partial<InsertAiConversationContext>): Promise<AiConversationContext> {
    try {
      const [context] = await db
        .update(aiConversationContext)
        .set({
          context: data.context,
          updatedAt: new Date()
        })
        .where(eq(aiConversationContext.id, id))
        .returning();
      
      return context;
    } catch (error) {
      log("Error updating AI conversation context:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
import { pgTable, text, serial, jsonb, timestamp, integer, decimal, boolean, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  avatar: text("avatar"),
  bio: text("bio"),
  age: integer("age"),
  occupation: text("occupation"),
  location: text("location"),
  // New identity attributes
  gender: text("gender"), // Male, Female, Non-binary, Prefer not to say
  ageRange: text("age_range"), // 18-25, 26-35, 36-45, 46+
  countryOfOrigin: text("country_of_origin"),
  languagesSpoken: text("languages_spoken"), // Languages the user speaks
  culturalBackground: text("cultural_background"),
  education: text("education"), // High School, Bachelor's, Master's, PhD, Other
  professionalField: text("professional_field"), // User's professional field or industry
  communityAffiliations: text("community_affiliations"), // Groups or communities user belongs to
  eventPreferences: text("event_preferences"), // In-person, Virtual, Small groups, etc.
  collaborationStyle: text("collaboration_style"), // Solo worker, Team player, etc.
  personalValues: text("personal_values"), // Core values important to the user
  digitalIdentity: text("digital_identity"), // Early adopter, Content creator, etc.
  physicalActivityLevel: text("physical_activity_level"), // Very active, Moderately active, etc.
  culturalExperiences: text("cultural_experiences"), // Well-traveled, Local expert, etc.
  learningStyle: text("learning_style"), // Self-taught, Formal education, etc.
  identityPreferences: jsonb("identity_preferences").$type<{
    attributeImportance: Record<string, number>; // Store importance weightings
  }>(),
  isAdmin: boolean("is_admin").default(false),
  preferences: jsonb("preferences").$type<{
    interests: string[];
    retailPreferences: string[];
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const connections = pgTable("connections", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").references(() => users.id),
  followingId: integer("following_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  content: text("content").notNull(),
  location: jsonb("location").$type<{
    latitude: number;
    longitude: number;
    placeName: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  balance: text("balance").default("0"),
  encryptedPrivateKey: text("encrypted_private_key").notNull(),
  publicKey: text("public_key").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const nfts = pgTable("nfts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  metadata: jsonb("metadata").$type<{
    attributes: Record<string, string | number>;
    image: string;
    externalUrl?: string;
  }>(),
  ownerId: integer("owner_id").references(() => users.id),
  creatorId: integer("creator_id").references(() => users.id),
  mintedAt: timestamp("minted_at").defaultNow(),
  tokenId: text("token_id").notNull().unique(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  fromWalletId: integer("from_wallet_id").references(() => wallets.id),
  toWalletId: integer("to_wallet_id").references(() => wallets.id),
  nftId: integer("nft_id").references(() => nfts.id),
  amount: text("amount"),
  type: text("type").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id),
  userId: integer("user_id").references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const interests = pgTable("interests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  category: text("category").notNull(),
  description: text("description"),
  iconUrl: text("icon_url"),
  isAiGenerated: boolean("is_ai_generated").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const interestContent = pgTable("interest_content", {
  id: serial("id").primaryKey(),
  interestId: integer("interest_id").references(() => interests.id),
  title: text("title").notNull(),
  description: text("description"),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  type: text("type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userInterests = pgTable("user_interests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  interestId: integer("interest_id").references(() => interests.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  avatar: true,
  bio: true,
  age: true,
  occupation: true,
  location: true,
  // New identity fields
  gender: true,
  ageRange: true,
  countryOfOrigin: true,
  languagesSpoken: true,
  culturalBackground: true,
  education: true,
  professionalField: true,
  communityAffiliations: true,
  eventPreferences: true,
  collaborationStyle: true,
  personalValues: true,
  digitalIdentity: true,
  physicalActivityLevel: true,
  culturalExperiences: true,
  learningStyle: true,
  identityPreferences: true,
  isAdmin: true,
  preferences: true,
});

export const insertPostSchema = createInsertSchema(posts).pick({
  userId: true,
  content: true,
  location: true,
});

export const insertNFTSchema = createInsertSchema(nfts).pick({
  title: true,
  description: true,
  metadata: true,
  creatorId: true,
  tokenId: true,
});

export const insertWalletSchema = createInsertSchema(wallets).pick({
  userId: true,
  encryptedPrivateKey: true,
  publicKey: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  fromWalletId: true,
  toWalletId: true,
  nftId: true,
  amount: true,
  type: true,
  status: true,
});

export const insertInterestSchema = createInsertSchema(interests).pick({
  name: true,
  category: true,
  description: true,
  iconUrl: true,
  isAiGenerated: true,
});

export const insertInterestContentSchema = createInsertSchema(interestContent).pick({
  interestId: true,
  title: true,
  description: true,
  url: true,
  thumbnailUrl: true,
  type: true,
});

export const insertUserInterestSchema = createInsertSchema(userInterests).pick({
  userId: true,
  interestId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type InsertNFT = z.infer<typeof insertNFTSchema>;
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type InsertInterest = z.infer<typeof insertInterestSchema>;
export type InsertInterestContent = z.infer<typeof insertInterestContentSchema>;
export type InsertUserInterest = z.infer<typeof insertUserInterestSchema>;

export type User = typeof users.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Connection = typeof connections.$inferSelect;
export type NFT = typeof nfts.$inferSelect;
export type Wallet = typeof wallets.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;

export type Interest = typeof interests.$inferSelect;
export type InterestContent = typeof interestContent.$inferSelect;
export type UserInterest = typeof userInterests.$inferSelect;


export type PostWithUser = Post & { user: User };
export type NFTWithCreator = NFT & { creator: User };
export type TransactionWithDetails = Transaction & {
  nft?: NFT;
  fromWallet?: Wallet;
  toWallet?: Wallet;
};

export type InterestWithContent = Interest & { content: InterestContent[] };
export type UserWithInterests = User & { interests: Interest[] };

// Entity Tables for Synthetic Data
export const entities = pgTable("entities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  category: text("category").notNull(),
  description: text("description"),
  entityType: text("entity_type").notNull(), // PHYSICAL or DIGITAL
  iconUrl: text("icon_url"),
  coordinates: jsonb("coordinates").$type<{
    latitude: string;
    longitude: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const entityContent = pgTable("entity_content", {
  id: serial("id").primaryKey(),
  entityId: integer("entity_id").references(() => entities.id),
  title: text("title").notNull(),
  description: text("description"),
  url: text("url"),
  thumbnailUrl: text("thumbnail_url"),
  type: text("type").notNull(), // product, service, article, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// Entity schemas
export const insertEntitySchema = createInsertSchema(entities).pick({
  name: true,
  category: true,
  description: true,
  entityType: true,
  iconUrl: true,
  coordinates: true,
});

export const insertEntityContentSchema = createInsertSchema(entityContent).pick({
  entityId: true,
  title: true,
  description: true,
  url: true,
  thumbnailUrl: true,
  type: true,
});

// Entity types
export type InsertEntity = z.infer<typeof insertEntitySchema>;
export type InsertEntityContent = z.infer<typeof insertEntityContentSchema>;
export type Entity = typeof entities.$inferSelect;
export type EntityContent = typeof entityContent.$inferSelect;
export type EntityWithContent = Entity & { content: EntityContent[] };

// Chat Tables
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  name: text("name"),
  type: text("type").notNull().default("user_to_user"), // "user_to_user", "ai_companion"
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: jsonb("metadata").$type<{
    iconUrl?: string;
    activeIdentityContext?: string;
    aiPersonality?: string;
    customSettings?: Record<string, any>;
  }>(),
});

export const conversationParticipants = pgTable("conversation_participants", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id),
  userId: integer("user_id").notNull().references(() => users.id),
  joinedAt: timestamp("joined_at").defaultNow(),
  role: text("role").notNull().default("member"), // "member", "admin", "ai"
  lastReadMessageId: integer("last_read_message_id"),
  lastSeenAt: timestamp("last_seen_at"),
  isActive: boolean("is_active").default(true),
  settings: jsonb("settings").$type<{
    notifications: boolean;
    muteUntil?: string;
    activeIdentityContext?: string;
  }>(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id),
  senderId: integer("sender_id").references(() => users.id),
  content: text("content").notNull(),
  contentType: text("content_type").notNull().default("text"), // "text", "media", "action"
  mediaUrl: text("media_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isDeleted: boolean("is_deleted").default(false),
  metadata: jsonb("metadata").$type<{
    identityContext?: string;
    attachments?: Array<{
      type: string;
      url: string;
      name: string;
      size?: number;
    }>;
    reactions?: Record<string, string[]>; // emoji: [userId1, userId2]
    replyToMessageId?: number;
    aiGenerationParams?: Record<string, any>;
  }>(),
});

export const messageStatus = pgTable("message_status", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").notNull().references(() => messages.id),
  userId: integer("user_id").notNull().references(() => users.id),
  status: text("status").notNull().default("sent"), // "sent", "delivered", "read"
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    unq: primaryKey({ columns: [table.messageId, table.userId] })
  };
});

export const aiCompanions = pgTable("ai_companions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  avatarUrl: text("avatar_url"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  personality: text("personality").notNull(),
  systemPrompt: text("system_prompt").notNull(),
  isPublic: boolean("is_public").default(false),
  settings: jsonb("settings").$type<{
    model: string;
    temperature: number;
    contextWindow: number;
    customAttributes: Record<string, any>;
  }>(),
});

export const aiConversationContext = pgTable("ai_conversation_context", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id),
  context: jsonb("context"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat Schemas
export const insertConversationSchema = createInsertSchema(conversations).pick({
  name: true,
  type: true,
  createdBy: true,
  metadata: true,
});

export const insertConversationParticipantSchema = createInsertSchema(conversationParticipants).pick({
  conversationId: true,
  userId: true,
  role: true,
  settings: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  conversationId: true,
  senderId: true,
  content: true,
  contentType: true,
  mediaUrl: true,
  metadata: true,
});

export const insertMessageStatusSchema = createInsertSchema(messageStatus).pick({
  messageId: true,
  userId: true,
  status: true,
});

export const insertAiCompanionSchema = createInsertSchema(aiCompanions).pick({
  name: true,
  description: true,
  avatarUrl: true,
  createdBy: true,
  personality: true,
  systemPrompt: true,
  isPublic: true,
  settings: true,
});

export const insertAiConversationContextSchema = createInsertSchema(aiConversationContext).pick({
  conversationId: true,
  context: true,
});

// Chat Types
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type InsertConversationParticipant = z.infer<typeof insertConversationParticipantSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertMessageStatus = z.infer<typeof insertMessageStatusSchema>;
export type InsertAiCompanion = z.infer<typeof insertAiCompanionSchema>;
export type InsertAiConversationContext = z.infer<typeof insertAiConversationContextSchema>;

export type Conversation = typeof conversations.$inferSelect;
export type ConversationParticipant = typeof conversationParticipants.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type MessageStatus = typeof messageStatus.$inferSelect;
export type AiCompanion = typeof aiCompanions.$inferSelect;
export type AiConversationContext = typeof aiConversationContext.$inferSelect;

// Combined Types
export type MessageWithSender = Message & { sender: User };
export type ConversationWithParticipants = Conversation & { participants: (ConversationParticipant & { user: User })[] };
export type ConversationWithLastMessage = Conversation & { lastMessage: Message | null, unreadCount: number };
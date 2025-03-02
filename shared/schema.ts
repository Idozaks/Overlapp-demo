import { pgTable, text, serial, jsonb, timestamp, integer, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  avatar: text("avatar_url"),
  bio: text("bio"),
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
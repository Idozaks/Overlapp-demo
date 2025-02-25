import { pgTable, text, serial, jsonb, timestamp, integer, decimal } from "drizzle-orm/pg-core";
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
    privacySettings: {
      shareLocation: boolean;
      allowAiSuggestions: boolean;
      publicProfile: boolean;
      shareInterests: boolean;
    };
    onboardingCompleted: boolean;
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
  type: text("type").notNull(), // 'MINT', 'TRANSFER', 'SALE'
  status: text("status").notNull(), // 'PENDING', 'COMPLETED', 'FAILED'
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

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  avatar: true,
  bio: true,
  preferences: true,
}).extend({
  preferences: z.object({
    interests: z.array(z.string()).optional(),
    retailPreferences: z.array(z.string()).optional(),
    privacySettings: z.object({
      shareLocation: z.boolean(),
      allowAiSuggestions: z.boolean(),
      publicProfile: z.boolean(),
      shareInterests: z.boolean(),
    }).optional(),
    onboardingCompleted: z.boolean().optional(),
  }).optional(),
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type InsertNFT = z.infer<typeof insertNFTSchema>;
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type User = typeof users.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Connection = typeof connections.$inferSelect;
export type NFT = typeof nfts.$inferSelect;
export type Wallet = typeof wallets.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;

export type PostWithUser = Post & { user: User };
export type NFTWithCreator = NFT & { creator: User };
export type TransactionWithDetails = Transaction & {
  nft?: NFT;
  fromWallet?: Wallet;
  toWallet?: Wallet;
};
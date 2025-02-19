import { pgTable, text, serial, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  preferences: jsonb("preferences").$type<{
    interests: string[];
    retailPreferences: string[];
  }>(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  preferences: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

import { users, posts, comments, connections, likes } from "@shared/schema";
import { type User, type InsertUser, type Post, type Comment, type Connection } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Social operations
  followUser(followerId: number, followingId: number): Promise<Connection>;
  unfollowUser(followerId: number, followingId: number): Promise<void>;
  getFollowers(userId: number): Promise<User[]>;
  getFollowing(userId: number): Promise<User[]>;

  // Post operations
  createPost(userId: number, content: string, location?: any): Promise<Post>;
  getPosts(userId: number): Promise<Post[]>;
  getFeed(userId: number): Promise<Post[]>;

  // Interaction operations
  likePost(userId: number, postId: number): Promise<void>;
  unlikePost(userId: number, postId: number): Promise<void>;
  commentOnPost(userId: number, postId: number, content: string): Promise<Comment>;

  // Recommendations
  getRecommendations(userId: number): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values([insertUser])
      .returning();
    return user;
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
      .select()
      .from(users)
      .innerJoin(connections, eq(connections.followerId, users.id))
      .where(eq(connections.followingId, userId));
    return followers.map(({ users: user }) => user);
  }

  async getFollowing(userId: number): Promise<User[]> {
    const following = await db
      .select()
      .from(users)
      .innerJoin(connections, eq(connections.followingId, users.id))
      .where(eq(connections.followerId, userId));
    return following.map(({ users: user }) => user);
  }

  async createPost(userId: number, content: string, location?: any): Promise<Post> {
    const [post] = await db
      .insert(posts)
      .values([{ userId, content, location }])
      .returning();
    return post;
  }

  async getPosts(userId: number): Promise<Post[]> {
    return db
      .select()
      .from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt));
  }

  async getFeed(userId: number): Promise<Post[]> {
    const following = await this.getFollowing(userId);
    const followingIds = following.map(user => user.id);
    followingIds.push(userId); // Include user's own posts

    return db
      .select()
      .from(posts)
      .where(inArray(posts.userId, followingIds))
      .orderBy(desc(posts.createdAt));
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

  async getRecommendations(userId: number): Promise<any[]> {
    const user = await this.getUser(userId);
    if (!user?.preferences) return [];

    // Enhanced recommendations based on user interests and social connections
    const following = await this.getFollowing(userId);
    const followingInterests = await Promise.all(
      following.map(async (f) => {
        const user = await this.getUser(f.id);
        return user?.preferences?.interests || [];
      })
    );

    // Use Array.from instead of spread operator for better compatibility
    const allInterests = Array.from(new Set([
      ...(user.preferences.interests || []),
      ...followingInterests.flat()
    ]));

    return allInterests.map(interest => ({
      category: interest,
      items: [
        { name: `${interest} Item 1`, price: Math.floor(Math.random() * 100) + 20 },
        { name: `${interest} Item 2`, price: Math.floor(Math.random() * 100) + 20 }
      ]
    }));
  }
}

export const storage = new DatabaseStorage();
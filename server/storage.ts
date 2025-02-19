import { users, type User, type InsertUser } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getRecommendations(userId: number): Promise<any[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
    
    // Add mock user
    this.createUser({
      username: "demo",
      password: "password",
      preferences: {
        interests: ["Fashion", "Technology", "Fitness"],
        retailPreferences: ["Nike", "Apple", "Lululemon"]
      }
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getRecommendations(userId: number): Promise<any[]> {
    const user = await this.getUser(userId);
    if (!user?.preferences) return [];

    // Mock recommendations based on user interests
    return user.preferences.interests.map(interest => ({
      category: interest,
      items: [
        { name: `${interest} Item 1`, price: Math.floor(Math.random() * 100) + 20 },
        { name: `${interest} Item 2`, price: Math.floor(Math.random() * 100) + 20 }
      ]
    }));
  }
}

export const storage = new MemStorage();

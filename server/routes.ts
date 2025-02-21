import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertPostSchema } from "@shared/schema";
import { log } from "./vite";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication
  app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await storage.getUserByUsername(username);

    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({ user });
  });

  // User Management
  app.get("/api/users", async (_req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json({ users });
    } catch (error) {
      res.status(500).json({ message: "Unable to fetch users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    const result = insertUserSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid user data" });
    }

    const user = await storage.createUser(result.data);
    res.status(201).json({ user });
  });

  app.get("/api/users/:id", async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  });

  // Social Connections
  app.post("/api/users/:id/follow", async (req, res) => {
    const followerId = Number(req.body.followerId);
    const followingId = Number(req.params.id);

    try {
      const connection = await storage.followUser(followerId, followingId);
      res.status(201).json({ connection });
    } catch (error) {
      res.status(400).json({ message: "Unable to follow user" });
    }
  });

  app.delete("/api/users/:id/follow", async (req, res) => {
    const followerId = Number(req.body.followerId);
    const followingId = Number(req.params.id);

    try {
      await storage.unfollowUser(followerId, followingId);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: "Unable to unfollow user" });
    }
  });

  app.get("/api/users/:id/followers", async (req, res) => {
    const followers = await storage.getFollowers(Number(req.params.id));
    res.json({ followers });
  });

  app.get("/api/users/:id/following", async (req, res) => {
    const following = await storage.getFollowing(Number(req.params.id));
    res.json({ following });
  });

  // Posts
  app.post("/api/posts", async (req, res) => {
    const result = insertPostSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid post data" });
    }

    const { content, location } = result.data;
    const userId = Number(req.body.userId); // In production, get from session

    try {
      const post = await storage.createPost(userId, content, location);
      res.status(201).json({ post });
    } catch (error) {
      res.status(400).json({ message: "Unable to create post" });
    }
  });

  app.get("/api/users/:id/posts", async (req, res) => {
    const posts = await storage.getPosts(Number(req.params.id));
    res.json({ posts });
  });

  app.get("/api/feed", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : 1; // Default to user 1 for now
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const posts = await storage.getFeed(userId);
      res.json({ posts });
    } catch (error) {
      console.error("Error fetching feed:", error);
      res.status(500).json({ message: "Unable to fetch feed" });
    }
  });

  // Post Interactions
  app.post("/api/posts/:id/like", async (req, res) => {
    const postId = Number(req.params.id);
    const userId = Number(req.body.userId); // In production, get from session

    try {
      await storage.likePost(userId, postId);
      res.status(201).send();
    } catch (error) {
      res.status(400).json({ message: "Unable to like post" });
    }
  });

  app.delete("/api/posts/:id/like", async (req, res) => {
    const postId = Number(req.params.id);
    const userId = Number(req.body.userId); // In production, get from session

    try {
      await storage.unlikePost(userId, postId);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: "Unable to unlike post" });
    }
  });

  app.post("/api/posts/:id/comments", async (req, res) => {
    const postId = Number(req.params.id);
    const userId = Number(req.body.userId); // In production, get from session
    const { content } = req.body;

    try {
      const comment = await storage.commentOnPost(userId, postId, content);
      res.status(201).json({ comment });
    } catch (error) {
      res.status(400).json({ message: "Unable to create comment" });
    }
  });

  // Recommendations
  app.get("/api/recommendations/:userId", async (req, res) => {
    const recommendations = await storage.getRecommendations(Number(req.params.userId));
    res.json({ recommendations });
  });

  // Wallet Operations
  app.get("/api/wallet", async (req, res) => {
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ message: "Valid userId is required" });
    }

    try {
      let wallet = await storage.getWallet(userId);

      if (!wallet) {
        // If wallet doesn't exist, create one with default values
        wallet = await storage.createWallet({
          userId,
          encryptedPrivateKey: "temp-key", // In production, generate proper keys
          publicKey: "temp-pub-key",
        });
      }

      res.json({ wallet });
    } catch (error) {
      log("Error fetching wallet:", error);
      res.status(500).json({ message: "Unable to fetch wallet" });
    }
  });

  app.get("/api/wallet/nfts", async (req, res) => {
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ message: "Valid userId is required" });
    }

    try {
      const nfts = await storage.getNFTsByOwner(userId);
      res.json({ nfts: nfts || [] });
    } catch (error) {
      log("Error fetching NFTs:", error);
      res.status(500).json({ message: "Unable to fetch NFTs" });
    }
  });

  app.get("/api/wallet/transactions", async (req, res) => {
    const walletId = req.query.walletId ? parseInt(req.query.walletId as string) : undefined;

    if (!walletId || isNaN(walletId)) {
      return res.status(400).json({ message: "Valid walletId is required" });
    }

    try {
      const transactions = await storage.getTransactions(walletId);
      res.json({ transactions: transactions || [] });
    } catch (error) {
      log("Error fetching transactions:", error);
      res.status(500).json({ message: "Unable to fetch transactions" });
    }
  });


  const httpServer = createServer(app);
  return httpServer;
}
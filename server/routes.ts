import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertPostSchema } from "@shared/schema";
import { log } from "./vite";
import express from "express";
import { setupAuth } from "./auth";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(express.json());

  // Authentication setup
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid credentials" });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Authentication routes
  app.post("/api/register", async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid user data" });
      }

      const { username, password, ...rest } = result.data;
      const existingUser = await storage.getUserByUsername(username);

      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        ...rest,
        username,
        password: hashedPassword,
      });

      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error during login after registration" });
        }
        return res.status(201).json(user);
      });
    } catch (error) {
      log("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return res.status(500).json({ message: "Internal server error" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error during login" });
        }
        return res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error during logout" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.user);
  });

  // Add these debug routes at the top of the routes, after health check
  app.get("/api/auth/test/session", (req, res) => {
    res.json({
      session: req.session,
      isAuthenticated: req.isAuthenticated(),
      user: req.user,
      cookies: req.cookies,
      sessionID: req.sessionID
    });
  });

  app.post("/api/auth/test/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      log(`Test login attempt for user: ${username}`);

      const user = await storage.getUserByUsername(username);
      if (!user) {
        log(`User not found: ${username}`);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.login(user, (err) => {
        if (err) {
          log(`Login error: ${err.message}`);
          return res.status(500).json({ message: "Login failed", error: err.message });
        }
        log(`Successfully logged in user: ${username}`);
        res.json({
          message: "Login successful",
          user,
          sessionID: req.sessionID,
          isAuthenticated: req.isAuthenticated()
        });
      });
    } catch (error) {
      log(`Login error: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ message: "Login failed", error: String(error) });
    }
  });


  // Add these debug routes at the top of the routes, after health check
  app.get("/api/test/public", (req, res) => {
    res.json({
      message: "Public route accessible",
      timestamp: new Date().toISOString()
    });
  });

  app.get("/api/test/private", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    res.json({
      message: "Private route accessible",
      user: req.user,
      timestamp: new Date().toISOString()
    });
  });

  // Add request logging middleware
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const requestLog = {
      timestamp,
      method: req.method,
      path: req.path,
      query: req.query,
      headers: req.headers,
      body: req.method !== 'GET' ? req.body : undefined,
      isAuthenticated: req.isAuthenticated?.() || false
    };
    log(`[REQUEST] ${timestamp} - Incoming request:`, JSON.stringify(requestLog, null, 2));

    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      const responseLog = {
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        isAuthenticated: req.isAuthenticated?.() || false
      };
      log(`[RESPONSE] ${timestamp} - Outgoing response:`, JSON.stringify(responseLog, null, 2));
    });
    next();
  });
  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });
  app.post("/api/debug/generate-users", async (req, res) => {
    try {
      log("Starting synthetic user generation...");
      const createdUsers = [];
      for (const userData of SYNTHETIC_USERS) {
        const result = insertUserSchema.safeParse(userData);
        if (result.success) {
          const user = await storage.createUser(result.data);
          createdUsers.push(user);
          log(`Created user: ${user.displayName}`);
        } else {
          log(`Failed to validate user data: ${JSON.stringify(result.error)}`);
        }
      }
      log(`Successfully created ${createdUsers.length} synthetic users`);
      return res.status(201).json({ message: "Synthetic users created", users: createdUsers });
    } catch (error) {
      log("Error creating synthetic users:", String(error));
      return res.status(500).json({ message: "Unable to create synthetic users", error: String(error) });
    }
  });

  // Feed endpoint
  app.get("/api/feed", async (req, res) => {
    try {
      const userId = typeof req.query.userId === 'string' ? parseInt(req.query.userId) : 1;
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const posts = await storage.getFeed(userId);
      res.json({ posts });
    } catch (error) {
      log("Error fetching feed:", String(error));
      res.status(500).json({ message: "Unable to fetch feed" });
    }
  });

  // User Management
  app.get("/api/users", async (req, res) => {
    try {
      const currentUserId = typeof req.query.currentUserId === 'string' ? parseInt(req.query.currentUserId) : undefined;
      const users = await storage.getAllUsers();

      if (currentUserId) {
        // Get all followers for the current user to determine follow status
        const following = await storage.getFollowing(currentUserId);
        const followingIds = following.map(f => f.id);

        // Enhance users with isFollowing property
        const enhancedUsers = users.map(user => ({
          ...user,
          isFollowing: followingIds.includes(user.id)
        }));

        return res.json({ users: enhancedUsers });
      }

      res.json({ users });
    } catch (error) {
      log("Error fetching users:", String(error));
      res.status(500).json({ message: "Unable to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ user });
    } catch (error) {
      log("Error fetching user:", String(error));
      res.status(500).json({ message: "Unable to fetch user" });
    }
  });

  // Add the update user endpoint
  app.patch("/api/users/:id", async (req, res) => {
    try {
      const userId = Number(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      // Get the current user to ensure it exists
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Create an update schema by making all fields optional
      const updateUserSchema = insertUserSchema.partial();
      const result = updateUserSchema.safeParse(req.body);

      if (!result.success) {
        return res.status(400).json({
          message: "Invalid user data",
          errors: result.error.errors
        });
      }

      // Update the user
      const updatedUser = await storage.updateUser(userId, result.data);
      res.json({ user: updatedUser });
    } catch (error) {
      log("Error updating user:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Unable to update user" });
    }
  });


  // Social Connections
  app.post("/api/users/:id/follow", async (req, res) => {
    try {
      const followerId = Number(req.body.followerId);
      const followingId = Number(req.params.id);

      log(`Follow request received - followerId: ${followerId}, followingId: ${followingId}`);

      if (isNaN(followerId) || isNaN(followingId)) {
        log(`Invalid user IDs - followerId: ${followerId}, followingId: ${followingId}`);
        return res.status(400).json({ message: "Invalid user IDs" });
      }

      // Check if users exist
      const follower = await storage.getUser(followerId);
      const following = await storage.getUser(followingId);

      if (!follower || !following) {
        log(`User not found - follower: ${!!follower}, following: ${!!following}`);
        return res.status(404).json({ message: "One or both users not found" });
      }

      const connection = await storage.followUser(followerId, followingId);
      log(`Successfully created follow connection:`, JSON.stringify(connection));
      res.status(201).json({ success: true, connection });
    } catch (error) {
      log("Error following user:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Unable to follow user", error: String(error) });
    }
  });

  app.delete("/api/users/:id/follow", async (req, res) => {
    try {
      const followerId = Number(req.body.followerId);
      const followingId = Number(req.params.id);

      log(`Unfollow request received - followerId: ${followerId}, followingId: ${followingId}`);

      if (isNaN(followerId) || isNaN(followingId)) {
        log(`Invalid user IDs - followerId: ${followerId}, followingId: ${followingId}`);
        return res.status(400).json({ message: "Invalid user IDs" });
      }

      // Check if users exist
      const follower = await storage.getUser(followerId);
      const following = await storage.getUser(followingId);

      if (!follower || !following) {
        log(`User not found - follower: ${!!follower}, following: ${!!following}`);
        return res.status(404).json({ message: "One or both users not found" });
      }

      await storage.unfollowUser(followerId, followingId);
      log(`Successfully unfollowed - followerId: ${followerId}, followingId: ${followingId}`);
      res.status(200).json({ success: true });
    } catch (error) {
      log("Error unfollowing user:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Unable to unfollow user", error: String(error) });
    }
  });

  app.get("/api/users/:id/followers", async (req, res) => {
    try {
      const userId = Number(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const followers = await storage.getFollowers(userId);
      res.json({ followers });
    } catch (error) {
      log("Error fetching followers:", String(error));
      res.status(500).json({ message: "Unable to fetch followers" });
    }
  });

  app.get("/api/users/:id/following", async (req, res) => {
    try {
      const userId = Number(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const following = await storage.getFollowing(userId);
      res.json({ following });
    } catch (error) {
      log("Error fetching following:", String(error));
      res.status(500).json({ message: "Unable to fetch following" });
    }
  });

  // Posts
  app.post("/api/posts", async (req, res) => {
    try {
      const result = insertPostSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid post data" });
      }

      const { content, location } = result.data;
      const userId = Number(req.body.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const post = await storage.createPost(userId, content, location);
      res.status(201).json({ post });
    } catch (error) {
      log("Error creating post:", String(error));
      res.status(400).json({ message: "Unable to create post" });
    }
  });

  // Admin routes for user management
  app.delete("/api/admin/users", async (req, res) => {
    try {
      const userIds = req.body.userIds;
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ message: "Invalid user IDs provided" });
      }

      log(`Attempting to delete users with IDs: ${userIds.join(', ')}`);
      const result = await storage.deleteUsers(userIds);

      if (!result) {
        return res.status(404).json({ message: "No users found to delete" });
      }

      res.status(200).json({ message: "Users deleted successfully" });
    } catch (error) {
      log("Error deleting users:", String(error));
      res.status(500).json({ message: "Unable to delete users" });
    }
  });

  app.patch("/api/admin/users/:id/credentials", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { username, password } = req.body;
      const hashedPassword = await hashPassword(password);
      await storage.updateUserCredentials(userId, username, hashedPassword);
      res.status(200).json({ message: "Credentials updated successfully" });
    } catch (error) {
      log("Error updating credentials:", String(error));
      res.status(500).json({ message: "Unable to update credentials" });
    }
  });


  app.get("/api/users/:id/posts", async (req, res) => {
    try {
      const userId = Number(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const posts = await storage.getPosts(userId);
      res.json({ posts });
    } catch (error) {
      log("Error fetching posts:", String(error));
      res.status(500).json({ message: "Unable to fetch posts" });
    }
  });

  app.post("/api/posts/:id/like", async (req, res) => {
    try {
      const postId = Number(req.params.id);
      const userId = Number(req.body.userId);
      if (isNaN(postId) || isNaN(userId)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      await storage.likePost(userId, postId);
      res.status(201).send();
    } catch (error) {
      log("Error liking post:", String(error));
      res.status(400).json({ message: "Unable to like post" });
    }
  });

  app.delete("/api/posts/:id/like", async (req, res) => {
    try {
      const postId = Number(req.params.id);
      const userId = Number(req.body.userId);
      if (isNaN(postId) || isNaN(userId)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      await storage.unlikePost(userId, postId);
      res.status(204).send();
    } catch (error) {
      log("Error unliking post:", String(error));
      res.status(400).json({ message: "Unable to unlike post" });
    }
  });

  // Recommendations
  app.get("/api/recommendations/:userId", async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const recommendations = await storage.getRecommendations(userId);
      res.json({ recommendations });
    } catch (error) {
      log("Error fetching recommendations:", String(error));
      res.status(500).json({ message: "Unable to fetch recommendations" });
    }
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
        wallet = await storage.createWallet({
          userId,
          encryptedPrivateKey: "temp-key",
          publicKey: "temp-pub-key",
        });
      }

      res.json({ wallet });
    } catch (error) {
      log("Error fetching wallet:", error instanceof Error ? error.message : String(error));
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
      log("Error fetching NFTs:", error instanceof Error ? error.message : String(error));
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
      log("Error fetching transactions:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Unable to fetch transactions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

const SYNTHETIC_USERS = [
  {
    username: "tech_explorer",
    password: "password123",
    displayName: "Alex Tech",
    bio: "Tech enthusiast exploring the intersection of AI and human creativity",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    preferences: {
      interests: ["AI", "Technology", "Innovation"],
      retailPreferences: ["Electronics", "Books"]
    }
  },
  {
    username: "nature_lens",
    password: "password123",
    displayName: "Sam Nature",
    bio: "Wildlife photographer capturing Earth's beauty one frame at a time",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sam",
    preferences: {
      interests: ["Photography", "Nature", "Travel"],
      retailPreferences: ["Camera Gear", "Outdoor Equipment"]
    }
  },
  {
    username: "fitness_guru",
    password: "password123",
    displayName: "Jordan Fit",
    bio: "Personal trainer helping others achieve their fitness goals",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan",
    preferences: {
      interests: ["Fitness", "Nutrition", "Wellness"],
      retailPreferences: ["Sports Equipment", "Health Foods"]
    }
  },
  {
    username: "art_soul",
    password: "password123",
    displayName: "Morgan Art",
    bio: "Digital artist exploring new forms of expression",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Morgan",
    preferences: {
      interests: ["Art", "Digital Media", "Design"],
      retailPreferences: ["Art Supplies", "Digital Tools"]
    }
  },
  {
    username: "food_adventurer",
    password: "password123",
    displayName: "Jamie Food",
    bio: "Culinary explorer sharing global flavors and recipes",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jamie",
    preferences: {
      interests: ["Cooking", "Travel", "Culture"],
      retailPreferences: ["Kitchen Equipment", "Specialty Foods"]
    }
  }
];
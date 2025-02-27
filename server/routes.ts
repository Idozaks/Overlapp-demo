import type { Express, Request, Response, NextFunction } from "express";
import type { User } from "@shared/schema";
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
import multer from "multer";
import path from "path";
import fs from "fs";
import OpenAI from "openai";
import { interests, interestContent, userInterests, type Interest, type InterestContent, type UserInterest, type InsertInterest, type InsertInterestContent, type InsertUserInterest } from "@shared/schema";
import { type InsertUser, type Post, type Comment, type Connection, type Wallet, type NFT, type Transaction, type InsertNFT, type InsertWallet } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, inArray, or, sql } from "drizzle-orm";


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

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(express.json());

  // Authentication setup
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username: string, password: string, done) => {
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

  passport.serializeUser((user: Express.User, done) => {
    done(null, (user as User).id);
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
  app.post("/api/register", async (req: Request, res: Response) => {
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
      log("Registration error:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/login", (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("local", (err: any, user: User | false, info: { message?: string }) => {
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

  app.post("/api/logout", (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error during logout" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/user", (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.user);
  });

  // Add these debug routes at the top of the routes, after health check
  app.get("/api/auth/test/session", (req: Request, res: Response) => {
    res.json({
      session: req.session,
      isAuthenticated: req.isAuthenticated(),
      user: req.user,
      cookies: req.cookies,
      sessionID: req.sessionID
    });
  });

  app.post("/api/auth/test/login", async (req: Request, res: Response) => {
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
  app.get("/api/test/public", (req: Request, res: Response) => {
    res.json({
      message: "Public route accessible",
      timestamp: new Date().toISOString()
    });
  });

  app.get("/api/test/private", (req: Request, res: Response) => {
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
  app.use((req: Request, res: Response, next: NextFunction) => {
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
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });
  app.post("/api/debug/generate-users", async (req: Request, res: Response) => {
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
  app.get("/api/feed", async (req: Request, res: Response) => {
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
  app.get("/api/users", async (req: Request, res: Response) => {
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

  app.get("/api/users/:id", async (req: Request, res: Response) => {
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

  const upload = multer({
    storage: multer.diskStorage({
      destination: './uploads/',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    }),
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type'));
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit
    }
  });

  // Ensure uploads directory exists
  if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
  }

  app.patch("/api/users/:id", upload.single('avatar'), async (req: Request, res: Response) => {
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

      let updateData = req.body;

      // If file was uploaded, add the file path to update data
      if (req.file) {
        updateData = {
          ...updateData,
          avatar: `/uploads/${req.file.filename}`
        };
      }

      // Create an update schema by making all fields optional
      const updateUserSchema = insertUserSchema.partial();
      const result = updateUserSchema.safeParse(updateData);

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

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));


  // Social Connections
  app.post("/api/users/:id/follow", async (req: Request, res: Response) => {
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

  app.delete("/api/users/:id/follow", async (req: Request, res: Response) => {
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

  app.get("/api/users/:id/followers", async (req: Request, res: Response) => {
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

  app.get("/api/users/:id/following", async (req: Request, res: Response) => {
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
  app.post("/api/posts", async (req: Request, res: Response) => {
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
  app.delete("/api/admin/users", async (req: Request, res: Response) => {
    // TODO: Re-enable auth check after testing
    // if (!req.isAuthenticated()) {
    //   return res.status(401).json({ message: "Not authenticated" });
    // }
    try {
      const userIds = req.body.userIds;
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ message: "Invalid user IDs provided" });
      }

      log(`Attempting to delete users with IDs: ${userIds.join(', ')}`);
      const result = await storage.deleteUsers(userIds);
      log(`Delete operation result: ${result}`);

      if (result) {
        res.status(200).json({ message: "Users deleted successfully" });
      } else {
        res.status(404).json({ message: "Unable to delete users" });
      }
    } catch (error) {
      log("Error deleting users:", String(error));
      res.status(500).json({ message: "Unable to delete users" });
    }
  });

  app.patch("/api/admin/users/:id/credentials", async (req: Request, res: Response) => {
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


  app.get("/api/users/:id/posts", async (req: Request, res: Response) => {
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

  app.post("/api/posts/:id/like", async (req: Request, res: Response) => {
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

  app.delete("/api/posts/:id/like", async (req: Request, res: Response) => {
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
  app.get("/api/recommendations/:userId", async (req: Request, res: Response) => {
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

  // Add this new route before httpServer creation
  app.post("/api/interests/enrich", async (req: Request, res: Response) => {
    try {
      const { interests } = req.body;

      if (!Array.isArray(interests) || interests.length === 0) {
        return res.status(400).json({ message: "Invalid interests format" });
      }

      const prompt = `Given these interests: ${interests.join(", ")}\n\n` +
        "For each interest, suggest 2-3 related or more specific interests. " +
        "Format the response as a simple array of strings, including only the new suggestions. " +
        "The suggestions should be specific and related to the original interests. " +
        "For example, if 'Sports' is given, suggest specific sports or related activities.";

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that suggests related interests based on a user's current interests. Keep suggestions concise and relevant."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      });

      let suggestions: string[] = [];
      try {
        const content = completion.choices[0].message.content || "[]";
        if (content.startsWith("[") && content.endsWith("]")) {
          suggestions = JSON.parse(content);
        } else {
          suggestions = content
            .split(",")
            .map(s => s.trim())
            .filter(s => s.length > 0);
        }
      } catch (error) {
        log("Error parsing OpenAI response:", error instanceof Error ? error.message : String(error));
        suggestions = (completion.choices[0].message.content || "")
          .split("\n")
          .map(s => s.replace(/^[-*\d.]+\s*/, "").trim())
          .filter(s => s.length > 0);
      }

      // Filter out duplicates and existing interests using Array.from for better compatibility
      suggestions = Array.from(new Set(suggestions))
        .filter(s => !interests.includes(s));

      res.json({ suggestions });
    } catch (error) {
      log("Interest enrichment error:", error instanceof Error ? error.message : String(error));
      res.status(500).json({
        message: "Failed to enrich interests",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Contact Card Routes
  app.post("/api/contact-cards", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { customMessage, jobTitle } = req.body;
      const userId = (req.user as User).id;

      // Generate a unique QR code (in reality, you'd want to use a proper QR code library)
      const qrCode = `https://overlapp.io/cards/${userId}-${Date.now()}`;

      const card = await storage.createContactCard({
        userId,
        qrCode,
        customMessage,
        jobTitle
      });

      res.status(201).json({ card });
    } catch (error) {
      log("Error creating contact card:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Unable to create contact card" });
    }
  });

  app.get("/api/contact-cards/:id", async (req: Request, res: Response) => {
    try {
      const cardId = parseInt(req.params.id);
      if (isNaN(cardId)) {
        return res.status(400).json({ message: "Invalid card ID" });
      }

      const card = await storage.getContactCard(cardId);
      if (!card) {
        return res.status(404).json({ message: "Contact card not found" });
      }

      res.json({ card });
    } catch (error) {
      log("Error fetching contact card:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Unable to fetch contact card" });
    }
  });

  app.get("/api/users/:userId/contact-card", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const card = await storage.getUserContactCard(userId);
      if (!card) {
        return res.status(404).json({ message: "Contact card not found" });
      }

      res.json({ card });
    } catch (error) {
      log("Error fetching user contact card:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Unable to fetch user contact card" });
    }
  });

  // Card Links Routes
  app.post("/api/contact-cards/:cardId/links", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const cardId = parseInt(req.params.cardId);
      if (isNaN(cardId)) {
        return res.status(400).json({ message: "Invalid card ID" });
      }

      const { platform, url } = req.body;
      const link = await storage.addCardLink({
        cardId,
        platform,
        url
      });

      res.status(201).json({ link });
    } catch (error) {
      log("Error adding card link:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Unable to add card link" });
    }
  });

  app.delete("/api/contact-cards/:cardId/links/:linkId", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const linkId = parseInt(req.params.linkId);
      if (isNaN(linkId)) {
        return res.status(400).json({ message: "Invalid link ID" });
      }

      await storage.removeCardLink(linkId);
      res.status(204).send();
    } catch (error) {
      log("Error removing card link:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Unable to remove card link" });
    }
  });

  // Overlap Analysis Routes
  app.post("/api/overlap-analysis", async (req: Request, res: Response) => {
    try {
      const { card1Id, card2Id } = req.body;

      if (!card1Id || isNaN(card1Id)) {
        return res.status(400).json({ message: "Invalid card1 ID" });
      }

      // Get cards and their user data
      const card1WithUser = await storage.getUserContactCard(card1Id);
      const card2WithUser = card2Id ? await storage.getUserContactCard(card2Id) : undefined;

      if (!card1WithUser) {
        return res.status(404).json({ message: "Card 1 not found" });
      }

      // Analyze overlap between the cards
      const analysisResult = {
        sharedInterests: ["Technology", "Innovation"],  // This would come from actual analysis
        commonConnections: [1, 2, 3],  // Example connection IDs
        relevanceScore: 0.85,
        suggestedActions: [
          "Connect on LinkedIn",
          "Schedule a coffee chat",
          "Explore mutual interests in Technology"
        ]
      };

      // Create overlap record
      const overlapRecord = await storage.createOverlapRecord({
        card1Id,
        card2Id: card2Id || undefined,
        type: card2Id ? "MUTUAL_SCAN" : "SINGLE_SCAN",
        analysisResult
      });

      res.status(201).json({
        overlap: overlapRecord,
        card1: card1WithUser,
        card2: card2WithUser
      });
    } catch (error) {
      log("Error analyzing overlap:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Unable to analyze overlap" });
    }
  });

  app.get("/api/overlap-history/:cardId", async (req: Request, res: Response) => {
    try {
      const cardId = parseInt(req.params.cardId);
      if (isNaN(cardId)) {
        return res.status(400).json({ message: "Invalid card ID" });
      }

      const history = await storage.getOverlapHistory(cardId);
      res.json({ history });
    } catch (error) {
      log("Error fetching overlap history:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Unable to fetch overlap history" });
    }
  });

  // Continue with the httpServer creation
  const httpServer = createServer(app);
  return httpServer;
}

// Keep the synthetic users data at the end
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
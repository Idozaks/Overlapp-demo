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
import * as openaiService from "./openai";
import * as userOverlapService from "./userOverlap";
import * as entityOverlapService from "./entityOverlap";

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
      // Convert username to lowercase for case-insensitive check
      const lowercaseUsername = username.toLowerCase();
      const existingUser = await storage.getUserByUsername(lowercaseUsername);

      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        ...rest,
        username: lowercaseUsername, // Store username in lowercase
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
    // Convert username to lowercase before authentication
    if (req.body.username) {
      req.body.username = req.body.username.toLowerCase();
    }
    
    passport.authenticate("local", (err: any, user: User | false, info: { message?: string }) => {
      if (err) {
        log("Login error:", err instanceof Error ? err.message : String(err));
        return res.status(500).json({ message: "Internal server error" });
      }
      if (!user) {
        log(`Login failed for username: ${req.body.username}`);
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      req.login(user, (err) => {
        if (err) {
          log("Session error:", err instanceof Error ? err.message : String(err));
          return res.status(500).json({ message: "Error during login" });
        }
        log(`User logged in successfully: ${user.username}`);
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
  
  // AI Companions routes
  app.get("/api/ai/companions", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const companions = await storage.getPublicAiCompanions();
      res.json({ companions });
    } catch (error) {
      log("Error fetching AI companions:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Unable to fetch AI companions" });
    }
  });
  
  // Create a demo AI companion for testing
  app.post("/api/ai/companions/demo", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Check if a demo companion already exists
      const existingCompanions = await storage.getPublicAiCompanions();
      const demoCompanion = existingCompanions.find(c => c.name === "Identity Assistant");
      
      if (demoCompanion) {
        return res.json({ companion: demoCompanion, message: "Demo companion already exists" });
      }
      
      // Create a new demo companion
      const companion = await storage.createAiCompanion({
        name: "Identity Assistant",
        description: "I'm your personal digital identity assistant. I can help you understand your identity traits and explore connections with others.",
        avatarUrl: null,
        createdBy: (req.user as User).id,
        personality: "Helpful, insightful, and focused on identity exploration",
        systemPrompt: "You are an AI assistant that helps users understand and develop their digital identity. Draw connections between interests, values, and experiences. Always be respectful and encouraging.",
        isPublic: true,
        settings: {
          model: "gpt-4o",
          temperature: 0.7,
          contextWindow: 8000,
          customAttributes: {}
        }
      });
      
      res.status(201).json({ companion, message: "Demo companion created successfully" });
    } catch (error) {
      log("Error creating demo AI companion:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Unable to create demo AI companion" });
    }
  });
  
  app.get("/api/ai/companions/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const companionId = parseInt(req.params.id);
      if (isNaN(companionId)) {
        return res.status(400).json({ message: "Invalid companion ID" });
      }
      
      const companion = await storage.getAiCompanion(companionId);
      if (!companion) {
        return res.status(404).json({ message: "AI companion not found" });
      }
      
      res.json({ companion });
    } catch (error) {
      log("Error fetching AI companion:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Unable to fetch AI companion" });
    }
  });
  
  // Conversations routes
  app.get("/api/conversations", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const userId = (req.user as User).id;
      const conversations = await storage.getUserConversations(userId);
      res.json({ conversations });
    } catch (error) {
      log("Error fetching conversations:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Unable to fetch conversations" });
    }
  });
  
  app.get("/api/conversations/:id/participants", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const userId = (req.user as User).id;
      const conversationId = parseInt(req.params.id);
      
      if (isNaN(conversationId)) {
        return res.status(400).json({ message: "Invalid conversation ID" });
      }
      
      // Fetch conversation to check if user is a participant
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      // Get participants for the conversation
      const participants = await storage.getConversationParticipants(conversationId);
      
      // Check if user is a participant
      const isParticipant = participants.some(p => p.userId === userId);
      if (!isParticipant && !((req.user as User).isAdmin)) {
        return res.status(403).json({ message: "You are not a participant in this conversation" });
      }
      
      res.json({ participants });
    } catch (error) {
      log("Error fetching conversation participants:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Unable to fetch conversation participants" });
    }
  });
  
  app.get("/api/conversations/:id/messages", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const userId = (req.user as User).id;
      const conversationId = parseInt(req.params.id);
      
      if (isNaN(conversationId)) {
        return res.status(400).json({ message: "Invalid conversation ID" });
      }
      
      // Get limit and before parameters for pagination
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const before = req.query.before ? parseInt(req.query.before as string) : undefined;
      
      // Fetch conversation to check if user is a participant
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      // Get participants for the conversation to check if user is a participant
      const participants = await storage.getConversationParticipants(conversationId);
      const isParticipant = participants.some(p => p.userId === userId);
      
      if (!isParticipant && !((req.user as User).isAdmin)) {
        return res.status(403).json({ message: "You are not a participant in this conversation" });
      }
      
      // Fetch messages for the conversation
      const messages = await storage.getConversationMessages(conversationId, limit, before);
      
      // Mark messages as read for the user
      await storage.markMessagesAsRead(conversationId, userId);
      
      res.json({ messages });
    } catch (error) {
      log("Error fetching conversation messages:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Unable to fetch conversation messages" });
    }
  });
  
  app.post("/api/conversations", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { name, userIds, type, companionId } = req.body;
      const userId = (req.user as User).id;
      
      // Create conversation
      const conversation = await storage.createConversation({
        name: name || null,
        type: type || 'direct',
        createdBy: userId,
        metadata: type === 'ai_companion' ? { aiCompanionId: companionId } : undefined
      });
      
      // Add creator as participant
      await storage.addConversationParticipant({
        conversationId: conversation.id,
        userId: userId,
        role: 'admin',
        settings: {
          notifications: true
        }
      });
      
      // Handle AI conversation (add AI companion as participant)
      if (type === 'ai_companion' && companionId) {
        try {
          // Get the AI companion details
          const aiCompanion = await storage.getAiCompanion(companionId);
          
          if (!aiCompanion) {
            return res.status(404).json({ message: "AI companion not found" });
          }
          
          // Get or create AI user
          const aiUser = await storage.getOrCreateAiUser();
          const aiUserId = aiUser.id;
          
          // Add AI as participant
          await storage.addConversationParticipant({
            conversationId: conversation.id,
            userId: aiUserId,
            role: 'ai',
            settings: {
              notifications: false
            }
          });
          
          // Store conversation context for the AI
          await storage.saveAiConversationContext({
            conversationId: conversation.id,
            context: JSON.stringify({
              systemPrompt: aiCompanion.systemPrompt,
              personality: aiCompanion.personality,
              messages: [],
              settings: aiCompanion.settings || {}
            })
          });
          
          // Send initial welcome message
          await storage.sendMessage({
            conversationId: conversation.id,
            senderId: aiUserId,
            content: `Hello! I'm ${aiCompanion.name}. ${aiCompanion.description || "How can I help you today?"}`,
            contentType: 'text'
          });
        } catch (aiError) {
          log("Error setting up AI conversation:", aiError instanceof Error ? aiError.message : String(aiError));
          // We'll continue even if AI setup fails - can be handled as a fallback
        }
      } else {
        // Add other human participants for regular conversations
        if (Array.isArray(userIds) && userIds.length > 0) {
          for (const participantId of userIds) {
            if (participantId !== userId) {
              await storage.addConversationParticipant({
                conversationId: conversation.id,
                userId: participantId,
                role: 'member',
                settings: {
                  notifications: true
                }
              });
            }
          }
        }
      }
      
      res.status(201).json({ conversation });
    } catch (error) {
      log("Error creating conversation:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Unable to create conversation" });
    }
  });
  app.post("/api/debug/generate-users", async (req: Request, res: Response) => {
    try {
      log("Starting synthetic user generation...");
      const createdUsers = [];
      const skippedUsers = [];
      
      for (const userData of SYNTHETIC_USERS) {
        try {
          // Check if user already exists
          const existingUser = await storage.getUserByUsername(userData.username);
          if (existingUser) {
            log(`Skipping existing user: ${userData.username}`);
            skippedUsers.push({
              username: userData.username,
              displayName: userData.displayName
            });
            continue;
          }
          
          // Validate and create user
          const result = insertUserSchema.safeParse(userData);
          if (result.success) {
            const user = await storage.createUser(result.data);
            createdUsers.push(user);
            log(`Created user: ${user.displayName}`);
          } else {
            log(`Failed to validate user data: ${JSON.stringify(result.error)}`);
          }
        } catch (userError) {
          log(`Error processing user ${userData.username}:`, String(userError));
          // Continue with next user instead of failing the entire operation
        }
      }
      
      log(`Successfully created ${createdUsers.length} synthetic users, skipped ${skippedUsers.length} existing users`);
      return res.status(201).json({ 
        message: `Created ${createdUsers.length} users, skipped ${skippedUsers.length} existing users`, 
        users: createdUsers,
        skipped: skippedUsers
      });
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

  // Admin user creation endpoint
  app.post("/api/admin/create", async (req: Request, res: Response) => {
    try {
      const { username, password, displayName } = req.body;
      
      // Validate required fields
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      // Convert username to lowercase and check if user already exists
      const lowercaseUsername = username.toLowerCase();
      const existingUser = await storage.getUserByUsername(lowercaseUsername);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Create admin user with lowercase username
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username: lowercaseUsername,
        password: hashedPassword,
        displayName: displayName || username,
        isAdmin: true,
      });

      log(`Admin user created: ${username}`);
      res.status(201).json({ message: "Admin user created successfully", user });
    } catch (error) {
      log("Error creating admin user:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Unable to create admin user" });
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
      // Convert username to lowercase for consistency
      const lowercaseUsername = username.toLowerCase();
      const hashedPassword = await hashPassword(password);
      await storage.updateUserCredentials(userId, lowercaseUsername, hashedPassword);
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
  
  // Identity-based matching with enhanced algorithm
  app.get("/api/identity-matches/:userId", async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Get query parameters
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const identityWeight = req.query.identityWeight ? Number(req.query.identityWeight) : undefined;
      const interestWeight = req.query.interestWeight ? Number(req.query.interestWeight) : undefined;
      const minIdentityMatches = req.query.minIdentityMatches ? Number(req.query.minIdentityMatches) : undefined;
      const includeCompatibilityInsights = req.query.includeCompatibilityInsights === 'true';
      
      // Create options object
      const options = {
        limit,
        identityWeight,
        interestWeight,
        minIdentityMatches,
        includeCompatibilityInsights
      };
      
      // Filter out undefined values
      const filteredOptions = Object.fromEntries(
        Object.entries(options).filter(([_, v]) => v !== undefined)
      );
      
      // Use the direct matching function instead of going through storage
      // This allows us to leverage the enhanced algorithm
      const matches = await import('./matching').then(({ getPotentialMatches }) => {
        return getPotentialMatches(userId, filteredOptions);
      });
      
      res.json({ matches });
    } catch (error) {
      log("Error fetching identity matches:", String(error));
      res.status(500).json({ message: "Unable to fetch identity matches" });
    }
  });
  
  // Update user identity preferences
  app.patch("/api/users/:userId/identity-preferences", async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const { attributeImportance } = req.body;
      if (!attributeImportance || typeof attributeImportance !== 'object') {
        return res.status(400).json({ message: "Invalid attribute importance data" });
      }
      
      const updatedUser = await storage.updateUserIdentityPreferences(userId, attributeImportance);
      res.json({ user: updatedUser });
    } catch (error) {
      log("Error updating identity preferences:", String(error));
      res.status(500).json({ message: "Unable to update identity preferences" });
    }
  });
  
  // Submit feedback on match quality for adaptive learning
  app.post("/api/matches/:userId/feedback", async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const { 
        targetUserId, 
        score, 
        interactionType, 
        interactionDetails 
      } = req.body;
      
      if (typeof targetUserId !== 'number' || 
          typeof score !== 'number' || 
          ![-1, 0, 1].includes(score)) {
        return res.status(400).json({ 
          message: "Invalid feedback data. Required: targetUserId (number) and score (-1, 0, or 1)" 
        });
      }
      
      // Create feedback object
      const feedback = {
        userId,
        targetUserId,
        score,
        timestamp: new Date(),
        interactionType: interactionType || 'explicit',
        interactionDetails
      };
      
      // Get recent feedback for this user to use in adapting weights
      // In a real system, you would store feedback in the database
      // Here we'll just use the current feedback for demonstration
      const recentFeedback = [feedback];
      
      // Update matching weights based on feedback
      await import('./matching').then(({ updateMatchingWeights }) => {
        return updateMatchingWeights(userId, recentFeedback);
      });
      
      res.json({ 
        success: true, 
        message: "Feedback received and preferences updated" 
      });
    } catch (error) {
      log("Error processing match feedback:", String(error));
      res.status(500).json({ message: "Unable to process match feedback" });
    }
  });

  // Add new endpoint to get all interests
  app.get("/api/interests", async (req: Request, res: Response) => {
    try {
      const { category } = req.query;
      let interests;
      
      if (category && typeof category === 'string') {
        interests = await storage.getInterestsByCategory(category);
      } else {
        interests = await storage.getInterests();
      }
      
      res.json({ interests });
    } catch (error) {
      log("Error fetching interests:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Unable to fetch interests" });
    }
  });
  
  app.get("/api/interests/categories", async (req: Request, res: Response) => {
    try {
      const allInterests = await storage.getInterests();
      // Extract unique categories
      const categories = [...new Set(allInterests.map(interest => interest.category))];
      res.json({ categories });
    } catch (error) {
      log("Error fetching interest categories:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Unable to fetch interest categories" });
    }
  });

  // Get a single interest by ID
  app.get("/api/interests/:id", async (req: Request, res: Response) => {
    try {
      const interestId = parseInt(req.params.id);
      if (isNaN(interestId)) {
        return res.status(400).json({ message: "Invalid interest ID" });
      }

      const interest = await storage.getInterest(interestId);
      if (!interest) {
        return res.status(404).json({ message: "Interest not found" });
      }

      res.json({ interest });
    } catch (error) {
      log("Error fetching interest:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Unable to fetch interest" });
    }
  });

  // Get content for a specific interest
  app.get("/api/interests/:id/content", async (req: Request, res: Response) => {
    try {
      const interestId = parseInt(req.params.id);
      if (isNaN(interestId)) {
        return res.status(400).json({ message: "Invalid interest ID" });
      }

      const content = await storage.getInterestContent(interestId);
      res.json({ content });
    } catch (error) {
      log("Error fetching interest content:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Unable to fetch interest content" });
    }
  });

  // User interest management routes
  app.post("/api/user/interests/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const interestId = parseInt(req.params.id);
      if (isNaN(interestId)) {
        return res.status(400).json({ message: "Invalid interest ID" });
      }

      const userId = req.user!.id;
      await storage.addUserInterest(userId, interestId);
      res.status(200).json({ message: "Interest added successfully" });
    } catch (error) {
      log("Error adding user interest:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Unable to add interest" });
    }
  });

  app.delete("/api/user/interests/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const interestId = parseInt(req.params.id);
      if (isNaN(interestId)) {
        return res.status(400).json({ message: "Invalid interest ID" });
      }

      const userId = req.user!.id;
      await storage.removeUserInterest(userId, interestId);
      res.status(200).json({ message: "Interest removed successfully" });
    } catch (error) {
      log("Error removing user interest:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Unable to remove interest" });
    }
  });

  app.get("/api/user/interests", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userId = req.user!.id;
      const interests = await storage.getUserInterests(userId);
      res.json({ interests });
    } catch (error) {
      log("Error fetching user interests:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Unable to fetch user interests" });
    }
  });

  // Add DELETE endpoint for interests
  app.delete("/api/interests/:id", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated and is admin
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Unauthorized. Admin access required." });
      }

      const interestId = Number(req.params.id);
      if (isNaN(interestId)) {
        return res.status(400).json({ message: "Invalid interest ID" });
      }

      // Check if interest exists first
      const interest = await storage.getInterest(interestId);
      if (!interest) {
        return res.status(404).json({ message: `Interest with ID ${interestId} not found` });
      }

      try {
        // Delete the interest
        await storage.deleteInterest(interestId);
        res.status(200).json({ message: "Interest deleted successfully" });
      } catch (deleteError) {
        // Check if error is due to foreign key constraint
        const errorMessage = deleteError instanceof Error ? deleteError.message : String(deleteError);
        if (errorMessage.includes('foreign key constraint')) {
          return res.status(409).json({ 
            message: "Cannot delete this interest as it is currently being used by users. Please remove all user associations first.",
            error: errorMessage
          });
        }
        throw deleteError; // Re-throw other errors to be caught by outer catch
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log("Error deleting interest:", errorMessage);
      res.status(500).json({ 
        message: "Failed to delete interest", 
        error: errorMessage,
        details: "This could be due to a database connection issue or the interest being referenced by other users"
      });
    }
  });

  app.post("/api/interests", async (req: Request, res: Response) => {
    try {
      const { name, category, description, isAiGenerated } = req.body;

      // Validate required fields
      if (!name || !category) {
        return res.status(400).json({ 
          message: "Missing required fields", 
          details: "Name and category are required" 
        });
      }

      // For non-admin users, only allow creation of AI-generated interests
      if (!req.isAuthenticated() || (!req.user?.isAdmin && !isAiGenerated)) {
        return res.status(403).json({ 
          message: "Unauthorized. Only admins can create regular interests." 
        });
      }

      // Check if interest already exists
      const existingInterest = await storage.getInterestByName(name);
      if (existingInterest) {
        return res.status(200).json({ 
          interest: existingInterest
        });
      }

      // Create new interest
      const interest = await storage.createInterest({
        name,
        category,
        description: description || `AI-suggested interest: ${name}`,
        isAiGenerated: isAiGenerated || false
      });

      res.status(201).json(interest);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log("Error creating interest:", errorMessage);
      res.status(500).json({ 
        message: "Failed to create interest",
        error: errorMessage
      });
    }
  });

  app.post("/api/interests/generate-emojis", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated and is admin
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Unauthorized. Admin access required." });
      }
      
      // Get all interests or use the list from the request
      let interestsToProcess;
      
      if (req.body.interestIds && Array.isArray(req.body.interestIds) && req.body.interestIds.length > 0) {
        // Process specific interests if IDs are provided
        const allInterests = await storage.getInterests();
        interestsToProcess = allInterests.filter(interest => 
          req.body.interestIds.includes(interest.id)
        );
      } else {
        // Get all interests if no specific IDs are provided
        interestsToProcess = await storage.getInterests();
      }
      
      if (interestsToProcess.length === 0) {
        return res.status(400).json({ message: "No interests found to process" });
      }
      
      log(`Generating emojis for ${interestsToProcess.length} interests`);
      
      // Generate emojis using OpenAI
      const result = await openaiService.generateEmojisForInterests(
        interestsToProcess.map(interest => ({ 
          id: interest.id, 
          name: interest.name 
        }))
      );
      
      // Update each interest with its new emoji
      let updatedCount = 0;
      for (const interest of result.interests) {
        try {
          // Update the interest in the database by adding the emoji to iconUrl field
          // Find interest by name and update
          const existingInterest = await storage.getInterestByName(interest.name);
          if (existingInterest) {
            await storage.updateInterest(existingInterest.id, { 
              iconUrl: interest.emoji 
            });
          }
          updatedCount++;
        } catch (error) {
          log(`Error updating interest ${interest.id} with emoji:`, error);
        }
      }
      
      res.json({ 
        message: `Successfully updated ${updatedCount} interests with emojis`,
        processed: updatedCount,
        total: interestsToProcess.length
      });
    } catch (error) {
      log("Interest emoji generation error:", error instanceof Error ? error.message : String(error));
      res.status(500).json({
        message: "Failed to generate emojis for interests",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.post("/api/interests/enrich", async (req: Request, res: Response) => {
    try {
      log("[DEBUG] Received interests enrichment request body:", JSON.stringify(req.body));
      
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ message: "Invalid request body format" });
      }
      
      const { interests } = req.body;
      
      log("[DEBUG] Extracted interests:", interests);
      
      if (!Array.isArray(interests) || interests.length === 0) {
        return res.status(400).json({ message: "Invalid interests format - must be a non-empty array" });
      }

      const prompt = `Given these interests: ${interests.join(", ")}\n\n` +
        "For each interest, suggest 2-3 related or more specific interests. " +
        "Format the response as a simple array of strings, including only the new suggestions. " +
        "The suggestions should be specific and related to the original interests. " +
        "For example, if 'Sports' is given, suggest specific sports or related activities.";

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
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

        // Clean suggestions without creating them in the database
        suggestions = suggestions
          .map(suggestion => suggestion.replace(/[\[\]"]/g, '').trim())
          .filter(s => s.length > 0);

        // Filter out duplicates and existing interests
        suggestions = Array.from(new Set(suggestions))
          .filter(s => !interests.includes(s));

        res.json({ suggestions });
      } catch (error) {
        log("Error parsing OpenAI response:", error instanceof Error ? error.message : String(error));
        suggestions = (completion.choices[0].message.content || "")
          .split("\n")
          .map(s => s.replace(/^[-*\d.]+\s*/, "").trim())
          .filter(s => s.length > 0);
        res.json({ suggestions });
      }
    } catch (error) {
      log("Interest enrichment error:", error instanceof Error ? error.message : String(error));
      res.status(500).json({
        message: "Failed to enrich interests",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  app.post("/api/interests/categorize-all", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated and is admin
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Unauthorized. Admin access required." });
      }
      
      // Get all interests
      const allInterests = await storage.getInterests();
      
      // First pass: Find and process any interests with the "AI_GENERATED" category specifically
      // to ensure they get proper categorization
      const directAIInterests = allInterests.filter(interest => 
        interest.category === 'AI_GENERATED'
      );
      
      if (directAIInterests.length > 0) {
        log(`Found ${directAIInterests.length} interests with literal "AI_GENERATED" category that need direct processing`);
        
        for (const interest of directAIInterests) {
          log(`Processing AI-generated interest: "${interest.name}"`);
          
          try {
            // Generate a specific category for this AI interest
            const prompt = `Generate a single appropriate category name (1-2 words in Title Case) for this interest: "${interest.name}".
            Just respond with the category name only, no explanation or additional text.`;
            
            const response = await openai.chat.completions.create({
              model: "gpt-4o",
              messages: [
                { role: "system", content: "You are a categorization API that responds with only a single category name in Title Case with no additional text." },
                { role: "user", content: prompt }
              ],
              temperature: 0.3,
              max_tokens: 20
            });
            
            const category = response.choices[0].message.content?.trim();
            
            if (category && category.length > 0) {
              log(`Directly updating AI-generated interest "${interest.name}" with category "${category}"`);
              await storage.updateInterest(interest.id, { 
                category,
                isAiGenerated: true 
              });
            }
          } catch (error) {
            log(`Error processing AI-generated interest "${interest.name}":`, error instanceof Error ? error.message : String(error));
          }
        }
      }
      
      // Get all interests that need categorization - including any remaining AI-generated ones
      const interestsToProcess = allInterests.filter(interest => 
        !interest.category || 
        interest.category === 'AI_GENERATED' ||  // Double-check any that might have been missed
        interest.category === 'UNCATEGORIZED' ||
        interest.isAiGenerated === true // Explicitly include AI-generated interests
      );
      
      if (interestsToProcess.length === 0) {
        return res.json({ 
          message: "No interests found that need categorization",
          totalProcessed: 0 
        });
      }
      
      // Process interests in batches to avoid rate limits and improve performance
      const batchSize = 20;
      const batches = [];
      
      for (let i = 0; i < interestsToProcess.length; i += batchSize) {
        batches.push(interestsToProcess.slice(i, i + batchSize));
      }
      
      let totalProcessed = 0;
      
      // Process each batch
      for (const batch of batches) {
        const interestNames = batch.map(interest => interest.name);
        
        log(`Processing batch of ${interestNames.length} interests for categorization`);
        
        const prompt = `I have a list of user interests that need to be categorized. Many of these are AI-generated interests that need proper categorization. Please assign each interest to the most appropriate category.
        
Interests to categorize: ${interestNames.join(", ")}

Categorization instructions:
1. Pay special attention to AI-generated interests which may be more specific or nuanced
2. Use descriptive yet concise category names (1-2 words, Title Case)
3. Group similar interests under the same category for consistency
4. Be specific with categories - avoid generic terms like "Hobby" or "Activity"
5. Consider the primary domain/field of the interest when categorizing

Response format instructions:
1. Respond with ONLY a valid JSON object where keys are interest names and values are appropriate categories
2. Example categories: "Technology", "Fitness", "Fine Arts", "Culinary", "Travel", "Education", "Music", "Science", etc.

Example response format:
{
  "Running": "Fitness",
  "Machine Learning": "Technology",
  "Watercolor Painting": "Fine Arts",
  "Neural Networks": "Computer Science",
  "Classical Guitar": "Music"
}`;

        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a specialized JSON API that categorizes interests. You must respond with ONLY valid JSON with no additional text."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1000
        });
        
        try {
          let content = completion.choices[0].message.content || "{}";
          
          // Clean up OpenAI response in case it returns markdown-formatted JSON
          if (content.includes('```json')) {
            // Extract JSON from markdown code blocks
            content = content.replace(/```json\s*|\s*```/g, '');
          }
          
          // Attempt to parse and validate JSON
          const categorizations = JSON.parse(content);
          
          // Update each interest with its new category
          for (const interest of batch) {
            if (categorizations[interest.name]) {
              const category = categorizations[interest.name];
              log(`Updating interest "${interest.name}" with category "${category}"`);
              
              // If the interest was previously marked as AI_GENERATED, make sure to update both the
              // category and set isAiGenerated flag to true to maintain the proper tracking
              if (interest.category === 'AI_GENERATED') {
                await storage.updateInterest(interest.id, { 
                  category,
                  isAiGenerated: true
                });
              } else {
                await storage.updateInterest(interest.id, { category });
              }
              totalProcessed++;
            } else if (interest.category === 'AI_GENERATED' || interest.isAiGenerated) {
              // Force a retry for AI-generated interests with no category match
              // Try to generate a reasonable category based on the interest name
              log(`Generating fallback category for AI-generated interest: "${interest.name}"`);
              
              try {
                const fallbackPrompt = `Generate a single appropriate category name (1-2 words in Title Case) for this interest: "${interest.name}".
                Just respond with the category name only, no explanation or additional text.`;
                
                const fallbackResponse = await openai.chat.completions.create({
                  model: "gpt-4o",
                  messages: [
                    { role: "system", content: "You are a categorization API that responds with only a single category name in Title Case with no additional text." },
                    { role: "user", content: fallbackPrompt }
                  ],
                  temperature: 0.3,
                  max_tokens: 20
                });
                
                const fallbackCategory = fallbackResponse.choices[0].message.content?.trim();
                
                if (fallbackCategory && fallbackCategory.length > 0) {
                  log(`Generated fallback category "${fallbackCategory}" for interest "${interest.name}"`);
                  await storage.updateInterest(interest.id, { 
                    category: fallbackCategory,
                    isAiGenerated: true  // Ensure we maintain the AI-generated flag
                  });
                  totalProcessed++;
                }
              } catch (error) {
                log(`Error generating fallback category for "${interest.name}":`, error instanceof Error ? error.message : String(error));
              }
            }
          }
        } catch (error) {
          log("Error processing categorization batch:", error instanceof Error ? error.message : String(error));
          // Continue with next batch if one fails
          continue;
        }
      }
      
      // Final check - look for any remaining interests with literal "AI_GENERATED" category
      const finalCheck = await storage.getInterests();
      const remainingAIMarked = finalCheck.filter(interest => interest.category === 'AI_GENERATED');
      
      if (remainingAIMarked.length > 0) {
        log(`Found ${remainingAIMarked.length} interests still marked as AI_GENERATED after main processing - fixing now`);
        
        for (const interest of remainingAIMarked) {
          try {
            // Use a more specific category
            const fallbackCategory = interest.name.split(' ')[0] + ' Interests';
            log(`Updating last-chance AI interest "${interest.name}" with category "${fallbackCategory}"`);
            
            await storage.updateInterest(interest.id, { 
              category: fallbackCategory,
              isAiGenerated: true
            });
            totalProcessed++;
          } catch (error) {
            log(`Error in final AI interest cleanup for "${interest.name}":`, error instanceof Error ? error.message : String(error));
          }
        }
      }
      
      res.json({ 
        message: `Successfully categorized ${totalProcessed} interests`,
        totalProcessed
      });
    } catch (error) {
      log("Interest categorization error:", error instanceof Error ? error.message : String(error));
      res.status(500).json({
        message: "Failed to categorize interests",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Wallet Operations
  app.get("/api/wallet", async (req: Request, res: Response) => {
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

  app.get("/api/wallet/nfts", async (req: Request, res: Response) => {
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

  app.get("/api/wallet/transactions", async (req: Request, res: Response) => {
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

  app.get("/api/users/:id/interests", async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const userInterests = await storage.getUserInterests(userId);
      res.json({ interests: userInterests });
    }catch (error) {
      log("Error fetching user interests:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Unable to fetch user interests" });
    }
  });

  app.post("/api/users/:id/interests", async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.id);
      const { interestId } = req.body;

      if (isNaN(userId) || !interestId) {
        return res.status(400).json({ message: "Invalid user ID or interest ID" });
      }

      await storage.addUserInterest(userId, interestId);
      res.status(201).json({ message: "Interest added successfully" });
    } catch (error) {
      log("Error adding user interest:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Unable to add user interest" });
    }
  });

  // User Overlap Analysis
  app.get("/api/users/:id/overlap", async (req: Request, res: Response) => {
    try {
      // Ensure user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const currentUser = req.user as User;
      const targetUserId = parseInt(req.params.id);

      if (isNaN(targetUserId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      // Fetch target user
      const targetUser = await storage.getUser(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ message: "Target user not found" });
      }

      // Get interests for both users
      const currentUserInterests = await storage.getUserInterests(currentUser.id);
      const targetUserInterests = await storage.getUserInterests(targetUserId);

      // Extract interest names
      const currentUserInterestNames = currentUserInterests.map(interest => interest.name);
      const targetUserInterestNames = targetUserInterests.map(interest => interest.name);

      // Generate the overlap analysis
      const analysisResult = await userOverlapService.generateUserOverlapAnalysis(
        currentUser,
        targetUser,
        currentUserInterestNames,
        targetUserInterestNames
      );

      res.json(analysisResult);
    } catch (error) {
      log("Error generating user overlap analysis:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Unable to generate user overlap analysis" });
    }
  });

  app.delete("/api/users/:id/interests/:interestId", async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.id);
      const interestId = Number(req.params.interestId);

      if (isNaN(userId) || isNaN(interestId)) {
        return res.status(400).json({ message: "Invalid user ID or interest ID" });
      }

      await storage.removeUserInterest(userId, interestId);
      res.status(200).json({ message: "Interest removed successfully" });
    } catch (error) {
      log("Error removing user interest:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Unable to remove user interest" });
    }
  });

  // Marketplace API routes
  app.get("/api/marketplace/categories", async (req: Request, res: Response) => {
    try {
      const entities = await storage.getAllEntities();
      const categories = [...new Set(entities.map(entity => entity.category))];
      res.status(200).json({ categories });
    } catch (error) {
      log("Error fetching entity categories:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Unable to fetch entity categories" });
    }
  });

  app.get("/api/marketplace/entities", async (req: Request, res: Response) => {
    try {
      const category = req.query.category as string;
      let entities;
      
      if (category && category !== 'all') {
        entities = await storage.getEntitiesByCategory(category);
      } else {
        entities = await storage.getAllEntities();
      }
      
      res.status(200).json({ entities });
    } catch (error) {
      log("Error fetching entities:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Unable to fetch entities" });
    }
  });

  app.get("/api/marketplace/entities/:id", async (req: Request, res: Response) => {
    try {
      const entityId = Number(req.params.id);
      
      if (isNaN(entityId)) {
        return res.status(400).json({ message: "Invalid entity ID" });
      }
      
      const entity = await storage.getEntity(entityId);
      
      if (!entity) {
        return res.status(404).json({ message: "Entity not found" });
      }
      
      const content = await storage.getEntityContent(entityId);
      
      res.status(200).json({ 
        entity: {
          ...entity,
          content
        } 
      });
    } catch (error) {
      log("Error fetching entity details:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Unable to fetch entity details" });
    }
  });
  
  // Entity-User overlap analysis endpoint
  app.get("/api/marketplace/entities/:id/overlap", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const currentUser = req.user as User;
      const entityId = Number(req.params.id);
      
      if (isNaN(entityId)) {
        return res.status(400).json({ message: "Invalid entity ID" });
      }
      
      // Get entity details
      const entity = await storage.getEntity(entityId);
      if (!entity) {
        return res.status(404).json({ message: "Entity not found" });
      }
      
      // Get entity content
      const entityContent = await storage.getEntityContent(entityId);
      
      // Get user interests
      const userInterests = await storage.getUserInterests(currentUser.id);
      const userInterestNames = userInterests.map(interest => interest.name);
      
      // Generate the overlap analysis
      const analysisResult = await entityOverlapService.generateEntityUserOverlapAnalysis(
        currentUser,
        entity,
        entityContent,
        userInterestNames
      );
      
      res.json(analysisResult);
    } catch (error) {
      log("Error generating entity-user overlap analysis:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Unable to generate entity-user overlap analysis" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

const SYNTHETIC_USERS = [
  {
    username: "blakebrown208",
    password: "password123",
    displayName: "Blake Brown",
    bio: "Focused on Culinary Exploration and Network Security while working as a Artist. Valuing Tradition and Wellness.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=blakebrown208",
    age: 58,
    occupation: "Artist",
    location: "Mumbai, India",
    gender: "Non-binary",
    ageRange: "46+",
    countryOfOrigin: "United States",
    educationLevel: "Master's",
    income: "Medium",
    politicalView: "Moderate",
    culturalBackground: "Middle Eastern",
    sexualOrientation: "",
    relationshipStatus: "",
    familySize: 1,
    digitalLiteracy: "Medium",
    ruralUrban: "Urban",
    personalValues: "Wellness, Tradition, Innovation, Sustainability",
    attributeImportance: {
      gender: 2,
      ageRange: 10,
      countryOfOrigin: 3,
      languagesSpoken: 9,
      culturalBackground: 6,
      education: 6,
      professionalField: 8,
      communityAffiliations: 9,
      eventPreferences: 2,
      collaborationStyle: 7,
      personalValues: 2,
      digitalIdentity: 9,
      physicalActivityLevel: 7,
      culturalExperiences: 4,
      learningStyle: 7
    },
  },
  {
    username: "blakewilliams869",
    password: "password123",
    displayName: "Blake Williams",
    bio: "Committed to Data Analytics with a background in Filmmaker. Guided by principles of Community.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=blakewilliams869",
    age: 43,
    occupation: "Filmmaker",
    location: "Toronto, Canada",
    gender: "Prefer not to say",
    ageRange: "46+",
    countryOfOrigin: "China",
    educationLevel: "High School",
    income: "Medium",
    politicalView: "Moderate",
    culturalBackground: "Asian",
    sexualOrientation: "",
    relationshipStatus: "",
    familySize: 1,
    digitalLiteracy: "Medium",
    ruralUrban: "Urban",
    personalValues: "Creativity, Community",
    attributeImportance: {
      gender: 3,
      ageRange: 4,
      countryOfOrigin: 5,
      languagesSpoken: 8,
      culturalBackground: 6,
      education: 9,
      professionalField: 9,
      communityAffiliations: 1,
      eventPreferences: 6,
      collaborationStyle: 7,
      personalValues: 1,
      digitalIdentity: 6,
      physicalActivityLevel: 1,
      culturalExperiences: 5,
      learningStyle: 4
    },
  },
  {
    username: "haydenrodriguez2",
    password: "password123",
    displayName: "Hayden Rodriguez",
    bio: "Committed to Blockchain with a background in Artist. Valuing Adventure.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=haydenrodriguez2",
    age: 40,
    occupation: "Artist",
    location: "Barcelona, Spain",
    gender: "Female",
    ageRange: "36-45",
    countryOfOrigin: "Australia",
    educationLevel: "High School",
    income: "Medium",
    politicalView: "Moderate",
    culturalBackground: "European",
    sexualOrientation: "",
    relationshipStatus: "",
    familySize: 1,
    digitalLiteracy: "Medium",
    ruralUrban: "Urban",
    personalValues: "Creativity, Adventure",
    attributeImportance: {
      gender: 8,
      ageRange: 1,
      countryOfOrigin: 7,
      languagesSpoken: 2,
      culturalBackground: 10,
      education: 7,
      professionalField: 8,
      communityAffiliations: 4,
      eventPreferences: 2,
      collaborationStyle: 5,
      personalValues: 10,
      digitalIdentity: 4,
      physicalActivityLevel: 4,
      culturalExperiences: 6,
      learningStyle: 1
    },
  },
  {
    username: "kaijohnson505",
    password: "password123",
    displayName: "Kai Johnson",
    bio: "Dedicated Storyboarding and Remote Work combining expertise in Designer. Believing in the importance of Independence and Family.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=kaijohnson505",
    age: 18,
    occupation: "Designer",
    location: "New York, USA",
    gender: "Male",
    ageRange: "18-25",
    countryOfOrigin: "Canada",
    educationLevel: "Self-taught",
    income: "Medium",
    politicalView: "Moderate",
    culturalBackground: "Middle Eastern",
    sexualOrientation: "",
    relationshipStatus: "",
    familySize: 1,
    digitalLiteracy: "Medium",
    ruralUrban: "Urban",
    personalValues: "Adventure, Independence, Sustainability, Family",
    attributeImportance: {
      gender: 8,
      ageRange: 8,
      countryOfOrigin: 7,
      languagesSpoken: 8,
      culturalBackground: 6,
      education: 7,
      professionalField: 9,
      communityAffiliations: 5,
      eventPreferences: 2,
      collaborationStyle: 1,
      personalValues: 6,
      digitalIdentity: 3,
      physicalActivityLevel: 5,
      culturalExperiences: 1,
      learningStyle: 1
    },
  },
  {
    username: "rileygonzalez51",
    password: "password123",
    displayName: "Riley Gonzalez",
    bio: "Committed to Choreography and Art & Design while working as a Fitness Instructor. Always pursuing Innovation.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=rileygonzalez51",
    age: 61,
    occupation: "Fitness Instructor",
    location: "Paris, France",
    gender: "Prefer not to say",
    ageRange: "18-25",
    countryOfOrigin: "United States",
    educationLevel: "Bachelor's",
    income: "Medium",
    politicalView: "Moderate",
    culturalBackground: "Asian",
    sexualOrientation: "",
    relationshipStatus: "",
    familySize: 1,
    digitalLiteracy: "Medium",
    ruralUrban: "Urban",
    personalValues: "Innovation, Adventure",
    attributeImportance: {
      gender: 5,
      ageRange: 2,
      countryOfOrigin: 9,
      languagesSpoken: 3,
      culturalBackground: 7,
      education: 2,
      professionalField: 7,
      communityAffiliations: 9,
      eventPreferences: 4,
      collaborationStyle: 10,
      personalValues: 9,
      digitalIdentity: 8,
      physicalActivityLevel: 1,
      culturalExperiences: 9,
      learningStyle: 9
    },
  },
  {
    username: "novalopez126",
    password: "password123",
    displayName: "Nova Lopez",
    bio: "Dedicated Music production and professionally involved with Student. Striving for Learning and Creativity.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=novalopez126",
    age: 26,
    occupation: "Student",
    location: "Mexico City, Mexico",
    gender: "Male",
    ageRange: "46+",
    countryOfOrigin: "Australia",
    educationLevel: "Vocational Training",
    income: "Medium",
    politicalView: "Moderate",
    culturalBackground: "Middle Eastern",
    sexualOrientation: "",
    relationshipStatus: "",
    familySize: 1,
    digitalLiteracy: "Medium",
    ruralUrban: "Urban",
    personalValues: "Learning, Creativity",
    attributeImportance: {
      gender: 10,
      ageRange: 8,
      countryOfOrigin: 10,
      languagesSpoken: 7,
      culturalBackground: 3,
      education: 8,
      professionalField: 9,
      communityAffiliations: 9,
      eventPreferences: 3,
      collaborationStyle: 6,
      personalValues: 6,
      digitalIdentity: 8,
      physicalActivityLevel: 6,
      culturalExperiences: 6,
      learningStyle: 1
    },
  },
  {
    username: "quinndavis97",
    password: "password123",
    displayName: "Quinn Davis",
    bio: "Focused on Singing and Woodworking with professional experience in Designer. Striving for Career growth and Innovation.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=quinndavis97",
    age: 33,
    occupation: "Designer",
    location: "Tokyo, Japan",
    gender: "Female",
    ageRange: "46+",
    countryOfOrigin: "France",
    educationLevel: "High School",
    income: "Medium",
    politicalView: "Moderate",
    culturalBackground: "South Asian",
    sexualOrientation: "",
    relationshipStatus: "",
    familySize: 1,
    digitalLiteracy: "Medium",
    ruralUrban: "Urban",
    personalValues: "Career growth, Learning, Innovation, Creativity",
    attributeImportance: {
      gender: 10,
      ageRange: 3,
      countryOfOrigin: 6,
      languagesSpoken: 7,
      culturalBackground: 4,
      education: 3,
      professionalField: 4,
      communityAffiliations: 10,
      eventPreferences: 2,
      collaborationStyle: 7,
      personalValues: 9,
      digitalIdentity: 9,
      physicalActivityLevel: 6,
      culturalExperiences: 1,
      learningStyle: 7
    },
  },
  {
    username: "rileymoore962",
    password: "password123",
    displayName: "Riley Moore",
    bio: "Inspired by Digital Innovation and Mindful Living with professional experience in Artist. Always pursuing Family.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=rileymoore962",
    age: 31,
    occupation: "Artist",
    location: "Toronto, Canada",
    gender: "Male",
    ageRange: "46+",
    countryOfOrigin: "Japan",
    educationLevel: "Other",
    income: "Medium",
    politicalView: "Moderate",
    culturalBackground: "Asian",
    sexualOrientation: "",
    relationshipStatus: "",
    familySize: 1,
    digitalLiteracy: "Medium",
    ruralUrban: "Urban",
    personalValues: "Family, Social justice, Tradition, Career growth",
    attributeImportance: {
      gender: 2,
      ageRange: 5,
      countryOfOrigin: 7,
      languagesSpoken: 6,
      culturalBackground: 7,
      education: 1,
      professionalField: 7,
      communityAffiliations: 9,
      eventPreferences: 3,
      collaborationStyle: 9,
      personalValues: 7,
      digitalIdentity: 3,
      physicalActivityLevel: 2,
      culturalExperiences: 5,
      learningStyle: 4
    },
  },
  {
    username: "jamiewilson602",
    password: "password123",
    displayName: "Jamie Wilson",
    bio: "Focused on Books with professional experience in Fitness Instructor. Guided by principles of Career growth and Tradition.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jamiewilson602",
    age: 67,
    occupation: "Fitness Instructor",
    location: "New York, USA",
    gender: "Non-binary",
    ageRange: "18-25",
    countryOfOrigin: "France",
    educationLevel: "Other",
    income: "Medium",
    politicalView: "Moderate",
    culturalBackground: "African",
    sexualOrientation: "",
    relationshipStatus: "",
    familySize: 1,
    digitalLiteracy: "Medium",
    ruralUrban: "Urban",
    personalValues: "Career growth, Tradition, Community, Innovation",
    attributeImportance: {
      gender: 7,
      ageRange: 6,
      countryOfOrigin: 7,
      languagesSpoken: 8,
      culturalBackground: 5,
      education: 5,
      professionalField: 1,
      communityAffiliations: 8,
      eventPreferences: 3,
      collaborationStyle: 9,
      personalValues: 3,
      digitalIdentity: 7,
      physicalActivityLevel: 3,
      culturalExperiences: 5,
      learningStyle: 5
    },
  },
  {
    username: "parkerjackson495",
    password: "password123",
    displayName: "Parker Jackson",
    bio: "Exploring the world of Digital Art and Digital Innovation with professional experience in Writer. Believing in the importance of Career growth.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=parkerjackson495",
    age: 23,
    occupation: "Writer",
    location: "Toronto, Canada",
    gender: "Non-binary",
    ageRange: "26-35",
    countryOfOrigin: "South Africa",
    educationLevel: "Vocational Training",
    income: "Medium",
    politicalView: "Moderate",
    culturalBackground: "Middle Eastern",
    sexualOrientation: "",
    relationshipStatus: "",
    familySize: 1,
    digitalLiteracy: "Medium",
    ruralUrban: "Urban",
    personalValues: "Career growth, Family, Community, Adventure",
    attributeImportance: {
      gender: 9,
      ageRange: 6,
      countryOfOrigin: 9,
      languagesSpoken: 3,
      culturalBackground: 6,
      education: 10,
      professionalField: 2,
      communityAffiliations: 7,
      eventPreferences: 7,
      collaborationStyle: 7,
      personalValues: 2,
      digitalIdentity: 1,
      physicalActivityLevel: 9,
      culturalExperiences: 6,
      learningStyle: 2
    },
  },
  {
    username: "parkerhernandez874",
    password: "password123",
    displayName: "Parker Hernandez",
    bio: "Inspired by Renewable Energy and Digital Marketing with professional experience in Marketing Manager. Striving for Adventure and Independence.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=parkerhernandez874",
    age: 56,
    occupation: "Marketing Manager",
    location: "Barcelona, Spain",
    gender: "Female",
    ageRange: "18-25",
    countryOfOrigin: "Germany",
    educationLevel: "Master's",
    income: "Medium",
    politicalView: "Moderate",
    culturalBackground: "Multicultural",
    sexualOrientation: "",
    relationshipStatus: "",
    familySize: 1,
    digitalLiteracy: "Medium",
    ruralUrban: "Urban",
    personalValues: "Independence, Adventure",
    attributeImportance: {
      gender: 8,
      ageRange: 1,
      countryOfOrigin: 10,
      languagesSpoken: 5,
      culturalBackground: 1,
      education: 7,
      professionalField: 9,
      communityAffiliations: 5,
      eventPreferences: 1,
      collaborationStyle: 9,
      personalValues: 4,
      digitalIdentity: 1,
      physicalActivityLevel: 3,
      culturalExperiences: 9,
      learningStyle: 9
    },
  },
  {
    username: "finleymartin209",
    password: "password123",
    displayName: "Finley Martin",
    bio: "Focused on Storyboarding combining expertise in Architect. Always pursuing Creativity.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=finleymartin209",
    age: 66,
    occupation: "Architect",
    location: "Dubai, UAE",
    gender: "Female",
    ageRange: "18-25",
    countryOfOrigin: "France",
    educationLevel: "Bachelor's",
    income: "Medium",
    politicalView: "Moderate",
    culturalBackground: "Asian",
    sexualOrientation: "",
    relationshipStatus: "",
    familySize: 1,
    digitalLiteracy: "Medium",
    ruralUrban: "Urban",
    personalValues: "Discipline, Sustainability, Social justice, Creativity",
    attributeImportance: {
      gender: 6,
      ageRange: 5,
      countryOfOrigin: 10,
      languagesSpoken: 1,
      culturalBackground: 9,
      education: 8,
      professionalField: 7,
      communityAffiliations: 8,
      eventPreferences: 9,
      collaborationStyle: 3,
      personalValues: 8,
      digitalIdentity: 7,
      physicalActivityLevel: 10,
      culturalExperiences: 4,
      learningStyle: 9
    },
  },
  {
    username: "quinnjohnson475",
    password: "password123",
    displayName: "Quinn Johnson",
    bio: "Dedicated Cultural Immersion and Tech Leadership while working as a Data Scientist. Always pursuing Adventure and Creativity.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=quinnjohnson475",
    age: 27,
    occupation: "Data Scientist",
    location: "Dubai, UAE",
    gender: "Prefer not to say",
    ageRange: "26-35",
    countryOfOrigin: "United Kingdom",
    educationLevel: "High School",
    income: "Medium",
    politicalView: "Moderate",
    culturalBackground: "Middle Eastern",
    sexualOrientation: "",
    relationshipStatus: "",
    familySize: 1,
    digitalLiteracy: "Medium",
    ruralUrban: "Urban",
    personalValues: "Adventure, Sustainability, Creativity",
    attributeImportance: {
      gender: 7,
      ageRange: 3,
      countryOfOrigin: 10,
      languagesSpoken: 1,
      culturalBackground: 1,
      education: 1,
      professionalField: 3,
      communityAffiliations: 9,
      eventPreferences: 1,
      collaborationStyle: 8,
      personalValues: 3,
      digitalIdentity: 10,
      physicalActivityLevel: 2,
      culturalExperiences: 8,
      learningStyle: 10
    },
  },
  {
    username: "morgananderson336",
    password: "password123",
    displayName: "Morgan Anderson",
    bio: "Exploring the world of Mindful Living and professionally involved with Software Engineer. Valuing Wellness.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=morgananderson336",
    age: 29,
    occupation: "Software Engineer",
    location: "Singapore",
    gender: "Non-binary",
    ageRange: "26-35",
    countryOfOrigin: "France",
    educationLevel: "High School",
    income: "Medium",
    politicalView: "Moderate",
    culturalBackground: "Hispanic/Latino",
    sexualOrientation: "",
    relationshipStatus: "",
    familySize: 1,
    digitalLiteracy: "Medium",
    ruralUrban: "Urban",
    personalValues: "Wellness, Sustainability, Tradition, Creativity",
    attributeImportance: {
      gender: 10,
      ageRange: 2,
      countryOfOrigin: 8,
      languagesSpoken: 3,
      culturalBackground: 9,
      education: 2,
      professionalField: 8,
      communityAffiliations: 3,
      eventPreferences: 5,
      collaborationStyle: 5,
      personalValues: 3,
      digitalIdentity: 9,
      physicalActivityLevel: 8,
      culturalExperiences: 3,
      learningStyle: 8
    },
  },
  {
    username: "caseyjackson310",
    password: "password123",
    displayName: "Casey Jackson",
    bio: "Focused on Remote Work and Data Analytics with a background in Doctor. Believing in the importance of Wellness and Creativity.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=caseyjackson310",
    age: 65,
    occupation: "Doctor",
    location: "Barcelona, Spain",
    gender: "Non-binary",
    ageRange: "46+",
    countryOfOrigin: "United States",
    educationLevel: "Vocational Training",
    income: "Medium",
    politicalView: "Moderate",
    culturalBackground: "Multicultural",
    sexualOrientation: "",
    relationshipStatus: "",
    familySize: 1,
    digitalLiteracy: "Medium",
    ruralUrban: "Urban",
    personalValues: "Community, Wellness, Creativity",
    attributeImportance: {
      gender: 9,
      ageRange: 6,
      countryOfOrigin: 1,
      languagesSpoken: 7,
      culturalBackground: 6,
      education: 8,
      professionalField: 10,
      communityAffiliations: 6,
      eventPreferences: 8,
      collaborationStyle: 8,
      personalValues: 6,
      digitalIdentity: 8,
      physicalActivityLevel: 9,
      culturalExperiences: 1,
      learningStyle: 6
    },
  },
  {
    username: "parkerdavis935",
    password: "password123",
    displayName: "Parker Davis",
    bio: "Exploring the world of Network Security and Digital Education and professionally involved with Artist. Striving for Social justice and Career growth.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=parkerdavis935",
    age: 30,
    occupation: "Artist",
    location: "Mumbai, India",
    gender: "Male",
    ageRange: "26-35",
    countryOfOrigin: "Australia",
    educationLevel: "Other",
    income: "Medium",
    politicalView: "Moderate",
    culturalBackground: "Pacific Islander",
    sexualOrientation: "",
    relationshipStatus: "",
    familySize: 1,
    digitalLiteracy: "Medium",
    ruralUrban: "Urban",
    personalValues: "Social justice, Career growth",
    attributeImportance: {
      gender: 6,
      ageRange: 2,
      countryOfOrigin: 4,
      languagesSpoken: 6,
      culturalBackground: 8,
      education: 2,
      professionalField: 7,
      communityAffiliations: 6,
      eventPreferences: 7,
      collaborationStyle: 1,
      personalValues: 5,
      digitalIdentity: 10,
      physicalActivityLevel: 2,
      culturalExperiences: 10,
      learningStyle: 4
    },
  },
  {
    username: "skylermartinez295",
    password: "password123",
    displayName: "Skyler Martinez",
    bio: "Inspired by Storyboarding and Privacy in Technology while working as a Fitness Instructor. Valuing Discipline.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=skylermartinez295",
    age: 43,
    occupation: "Fitness Instructor",
    location: "Dubai, UAE",
    gender: "Non-binary",
    ageRange: "26-35",
    countryOfOrigin: "Brazil",
    educationLevel: "Vocational Training",
    income: "Medium",
    politicalView: "Moderate",
    culturalBackground: "Pacific Islander",
    sexualOrientation: "",
    relationshipStatus: "",
    familySize: 1,
    digitalLiteracy: "Medium",
    ruralUrban: "Urban",
    personalValues: "Wellness, Discipline",
    attributeImportance: {
      gender: 5,
      ageRange: 4,
      countryOfOrigin: 5,
      languagesSpoken: 8,
      culturalBackground: 10,
      education: 9,
      professionalField: 1,
      communityAffiliations: 3,
      eventPreferences: 5,
      collaborationStyle: 1,
      personalValues: 10,
      digitalIdentity: 1,
      physicalActivityLevel: 6,
      culturalExperiences: 3,
      learningStyle: 6
    },
  },
  {
    username: "parkermartinez12",
    password: "password123",
    displayName: "Parker Martinez",
    bio: "Enthusiastic Graphic Design Software while working as a Chef. Valuing Creativity and Discipline.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=parkermartinez12",
    age: 54,
    occupation: "Chef",
    location: "Mumbai, India",
    gender: "Female",
    ageRange: "46+",
    countryOfOrigin: "China",
    educationLevel: "Self-taught",
    income: "Medium",
    politicalView: "Moderate",
    culturalBackground: "Hispanic/Latino",
    sexualOrientation: "",
    relationshipStatus: "",
    familySize: 1,
    digitalLiteracy: "Medium",
    ruralUrban: "Urban",
    personalValues: "Creativity, Discipline",
    attributeImportance: {
      gender: 9,
      ageRange: 5,
      countryOfOrigin: 5,
      languagesSpoken: 2,
      culturalBackground: 9,
      education: 10,
      professionalField: 10,
      communityAffiliations: 8,
      eventPreferences: 6,
      collaborationStyle: 6,
      personalValues: 3,
      digitalIdentity: 6,
      physicalActivityLevel: 1,
      culturalExperiences: 5,
      learningStyle: 4
    },
  },
  {
    username: "quinndavis17",
    password: "password123",
    displayName: "Quinn Davis",
    bio: "Enthusiastic Fitness and professionally involved with Software Engineer. Always pursuing Creativity.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=quinndavis17",
    age: 56,
    occupation: "Software Engineer",
    location: "Tokyo, Japan",
    gender: "Non-binary",
    ageRange: "46+",
    countryOfOrigin: "India",
    educationLevel: "Self-taught",
    income: "Medium",
    politicalView: "Moderate",
    culturalBackground: "Western",
    sexualOrientation: "",
    relationshipStatus: "",
    familySize: 1,
    digitalLiteracy: "Medium",
    ruralUrban: "Urban",
    personalValues: "Community, Creativity, Tradition",
    attributeImportance: {
      gender: 7,
      ageRange: 3,
      countryOfOrigin: 2,
      languagesSpoken: 3,
      culturalBackground: 7,
      education: 10,
      professionalField: 6,
      communityAffiliations: 9,
      eventPreferences: 4,
      collaborationStyle: 10,
      personalValues: 6,
      digitalIdentity: 6,
      physicalActivityLevel: 6,
      culturalExperiences: 3,
      learningStyle: 3
    },
  },
  {
    username: "finleyjackson763",
    password: "password123",
    displayName: "Finley Jackson",
    bio: "Enthusiastic Network Security and Business combining expertise in Doctor. Striving for Social justice and Independence.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=finleyjackson763",
    age: 53,
    occupation: "Doctor",
    location: "Singapore",
    gender: "Female",
    ageRange: "26-35",
    countryOfOrigin: "Japan",
    educationLevel: "Bachelor's",
    income: "Medium",
    politicalView: "Moderate",
    culturalBackground: "European",
    sexualOrientation: "",
    relationshipStatus: "",
    familySize: 1,
    digitalLiteracy: "Medium",
    ruralUrban: "Urban",
    personalValues: "Tradition, Social justice, Independence, Sustainability",
    attributeImportance: {
      gender: 4,
      ageRange: 5,
      countryOfOrigin: 1,
      languagesSpoken: 5,
      culturalBackground: 3,
      education: 5,
      professionalField: 7,
      communityAffiliations: 4,
      eventPreferences: 6,
      collaborationStyle: 10,
      personalValues: 1,
      digitalIdentity: 7,
      physicalActivityLevel: 9,
      culturalExperiences: 2,
      learningStyle: 1
    },
  }
];

//Needed Type Definition (Assuming)
interface Interest {
  id: number;
  name: string;
}
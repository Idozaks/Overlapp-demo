import type { Express, Request, Response, NextFunction } from "express";
import type { User } from "@shared/schema";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertPostSchema, events, eventAttendees } from "@shared/schema";
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
import { eq, and } from 'drizzle-orm';

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

  // Add new endpoint to get all interests
  app.get("/api/interests", async (req: Request, res: Response) => {
    try {
      const allInterests = await storage.getInterests();
      res.json({ interests: allInterests });
    } catch (error) {
      log("Error fetching interests:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Unable to fetch interests" });
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

  app.post("/api/interests/enrich", async (req: Request, res: Response) => {
    try {
      const { interests, userId } = req.body;

      if (!Array.isArray(interests) || interests.length === 0) {
        return res.status(400).json({ message: "Invalid interests format" });
      }

      // Get user's system prompt if available
      let systemPrompt = "You are a helpful assistant that suggests related interests based on a user's current interests. Keep suggestions concise and relevant.";

      if (userId) {
        const user = await storage.getUser(userId);
        if (user?.preferences?.systemPrompt) {
          systemPrompt = user.preferences.systemPrompt;
        }
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
            content: systemPrompt
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

        suggestions = suggestions
          .map(suggestion => suggestion.replace(/[\[\]"]/g, '').trim())
          .filter(s => s.length > 0);

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

  // Add an endpoint to update system prompt
  app.patch("/api/users/:id/preferences", async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json{ message: "Invalid user ID" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { systemPrompt } = req.body;
      if (typeof systemPrompt !== 'string') {
        return res.status(400).json({ message: "Invalid system prompt format" });
      }

      // Update user preferences
      const updatedPreferences = {
        ...user.preferences,
        systemPrompt
      };

      await storage.updateUser(userId, { preferences: updatedPreferences });
      res.json({ message: "Preferences updated successfully", preferences: updatedPreferences });
    } catch (error) {
      log("Error updating preferences:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Unable to update preferences" });
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

  // Add Events routes here.  This is a placeholder and needs to be fleshed out based on your events schema and storage implementation.
  app.post('/api/events', async (req: Request, res: Response) => {
    try {
      // Implement event creation logic here.  This will likely involve validating the request body against your events schema,
      // creating a new event in your database using the `storage` object, and returning the newly created event data.
      const newEvent = await storage.createEvent(req.body);
      res.status(201).json(newEvent);
    } catch (error) {
      log("Error creating event:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Unable to create event" });
    }
  });


  app.get('/api/events', async (req: Request, res: Response) => {
    try {
      const allEvents = await storage.getAllEvents();
      res.json({ events: allEvents });
    } catch (error) {
      log("Error fetching events:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Unable to fetch events" });
    }
  });

  app.get('/api/events/:id', async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json({ event });
    } catch (error) {
      log("Error fetching event:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Unable to fetch event" });
    }
  });

  app.post('/api/events/:eventId/attendees', async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const userId = parseInt(req.body.userId);
      if (isNaN(eventId) || isNaN(userId)) {
        return res.status(400).json({ message: "Invalid event or user ID" });
      }
      await storage.addEventAttendee(eventId, userId);
      res.status(201).json({ message: "Attendee added successfully" });
    } catch (error) {
      log("Error adding attendee:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Unable to add attendee" });
    }
  });

  app.delete('/api/events/:eventId/attendees/:userId', async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const userId = parseInt(req.params.userId);
      if (isNaN(eventId) || isNaN(userId)) {
        return res.status(400).json({ message: "Invalid event or user ID" });
      }
      await storage.removeEventAttendee(eventId, userId);
      res.status(200).json({ message: "Attendee removed successfully" });
    } catch (error) {
      log("Error removing attendee:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Unable to remove attendee" });
    }
  });

  app.get('/api/events/:eventId/attendees', async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      const attendees = await storage.getEventAttendees(eventId);
      res.json({ attendees });
    } catch (error) {
      log("Error fetching attendees:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ message: "Unable to fetch attendees" });
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
    bio: "Tech enthusiast exploring theintersection of AI and human creativity",
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

//Needed Type Definition (Assuming)
interface Interest {
  id: number;
  name: string;
}
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { log } from "./vite";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

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

export function setupAuth(app: Express) {
  // Add detailed auth logging middleware
  app.use((req, res, next) => {
    log(`[AUTH] ${req.method} ${req.path}`);
    log(`[AUTH] Session ID: ${req.sessionID}`);
    log(`[AUTH] Is Authenticated: ${req.isAuthenticated?.()}`);
    log(`[AUTH] User: ${req.user ? JSON.stringify(req.user) : 'Not logged in'}`);
    next();
  });

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: Express.User, done) => {
    try {
      log(`[AUTH] Serializing user: ${user.id}`);
      done(null, user.id);
    } catch (error) {
      log(`[AUTH] Error serializing user:`, error);
      done(error);
    }
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      log(`[AUTH] Deserializing user: ${id}`);
      const user = await storage.getUser(id);
      if (!user) {
        log(`[AUTH] User not found during deserialization: ${id}`);
        return done(null, false);
      }
      log(`[AUTH] Successfully deserialized user: ${id}`);
      done(null, user);
    } catch (error) {
      log(`[AUTH] Error deserializing user: ${error instanceof Error ? error.message : String(error)}`);
      done(error);
    }
  });

  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      log(`[AUTH] Login attempt for user: ${username}`);
      
      try {
        // Special case for our new admin user
        if (username.toLowerCase() === "dannizaks" && password === "12345") {
          log(`[AUTH] Creating admin user: ${username}`);
          // Check if admin user already exists - converting to lowercase
          let adminUser = await storage.getUserByUsername(username.toLowerCase());
          
          if (!adminUser) {
            // Create new admin user
            const hashedPassword = await hashPassword(password);
            adminUser = await storage.createUser({
              username: username.toLowerCase(),
              password: hashedPassword,
              displayName: "Danni Zaks",
              isAdmin: true
            });
            log(`[AUTH] Admin user created: ${username.toLowerCase()}`);
          } else if (!adminUser.isAdmin) {
            // Update existing user to admin if needed
            adminUser = await storage.updateUser(adminUser.id, { isAdmin: true });
            log(`[AUTH] User upgraded to admin: ${username.toLowerCase()}`);
          }
          
          return done(null, adminUser);
        }
      
      // Regular user authentication - convert to lowercase for case-insensitive comparison
      const lowercaseUsername = username.toLowerCase();
      const user = await storage.getUserByUsername(lowercaseUsername);
      
      log(`[AUTH] Looking up user: ${lowercaseUsername}`);
      
      if (!user) {
        log(`[AUTH] User not found: ${lowercaseUsername}`);
        return done(null, false, { message: "Invalid username or password" });
      }

      if (!(await comparePasswords(password, user.password))) {
        log(`[AUTH] Invalid password for user: ${username}`);
        return done(null, false, { message: "Invalid username or password" });
      }

      log(`[AUTH] Successful login for user: ${username}`);
      return done(null, user);
    } catch (error) {
      log(`[AUTH] Error during login: ${error instanceof Error ? error.message : String(error)}`);
      return done(error);
    }
  }));
  app.post("/api/register", async (req, res) => {
    try {
      // Convert username to lowercase for case-insensitive check
      const lowercaseUsername = req.body.username.toLowerCase();
      const existingUser = await storage.getUserByUsername(lowercaseUsername);
      if (existingUser) {
        log(`[AUTH] Registration failed - Username exists: ${lowercaseUsername}`);
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        username: lowercaseUsername, // Store username in lowercase
        password: hashedPassword
      });

      req.login(user, (err) => {
        if (err) {
          log(`[AUTH] Registration login error: ${err.message}`);
          return res.status(500).json({ message: "Error during login after registration" });
        }
        log(`[AUTH] Registration successful: ${user.username}`);
        res.status(201).json(user);
      });
    } catch (error) {
      log(`[AUTH] Registration error: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/login", (req, res, next) => {
    try {
      passport.authenticate("local", (err: Error | null, user: Express.User | false, info: { message: string } | undefined) => {
        if (err) {
          log(`[AUTH] Login error: ${err.message}`);
          return res.status(500).json({ message: "Login failed", error: err.message });
        }
        if (!user) {
          log(`[AUTH] Login failed: ${info?.message || 'Invalid credentials'}`);
          return res.status(401).json({ message: info?.message || "Invalid credentials" });
        }
        req.login(user, (err) => {
          if (err) {
            log(`[AUTH] Login session error: ${err.message}`);
            return res.status(500).json({ message: "Error establishing session" });
          }
          log(`[AUTH] Login successful: ${user.username}`);
          res.json(user);
        });
      })(req, res, next);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log(`[AUTH] Unexpected login error: ${errorMessage}`);
      res.status(500).json({ message: "Login failed due to an unexpected error", error: errorMessage });
    }
  });

  app.post("/api/logout", (req, res) => {
    const username = req.user?.username;
    req.logout((err) => {
      if (err) {
        log(`[AUTH] Logout error: ${err.message}`);
        return res.status(500).json({ message: "Logout failed" });
      }
      log(`[AUTH] Logout successful: ${username}`);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      log(`[AUTH] Unauthorized /api/user access attempt`);
      return res.status(401).json({ message: "Not authenticated" });
    }
    log(`[AUTH] User data retrieved: ${req.user.username}`);
    res.json(req.user);
  });
}
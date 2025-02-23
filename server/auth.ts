import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import createMemoryStore from "memorystore";
import { log } from "./vite";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);
const MemoryStore = createMemoryStore(session);

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
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    cookie: {
      secure: false, // Changed to false for development
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      path: '/'
    }
  };

  // Debug middleware to log session and auth state
  app.use((req, res, next) => {
    log(`[SESSION] Request path: ${req.path}`);
    log(`[SESSION] Session ID: ${req.sessionID}`);
    log(`[SESSION] Is Authenticated: ${req.isAuthenticated?.()}`);
    log(`[SESSION] Session data:`, JSON.stringify(req.session, null, 2));
    log(`[SESSION] Cookies:`, JSON.stringify(req.cookies, null, 2));
    next();
  });

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username: string, password: string, done: any) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          log(`[AUTH] Login failed for user: ${username}`);
          return done(null, false, { message: "Invalid username or password" });
        }
        log(`[AUTH] Login successful for user: ${username}`);
        return done(null, user);
      } catch (error) {
        log(`[AUTH] Error during login: ${error instanceof Error ? error.message : String(error)}`);
        return done(error);
      }
    })
  );

  passport.serializeUser((user, done) => {
    log(`[AUTH] Serializing user: ${user.id}`);
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        log(`[AUTH] Failed to deserialize user: ${id} - User not found`);
        return done(null, false);
      }
      log(`[AUTH] Successfully deserialized user: ${id}`);
      done(null, user);
    } catch (error) {
      log(`[AUTH] Error deserializing user: ${error instanceof Error ? error.message : String(error)}`);
      done(error);
    }
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

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        log(`[AUTH] Registration failed - Username already exists: ${req.body.username}`);
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword
      });

      req.login(user, (err) => {
        if (err) {
          log(`[AUTH] Error during post-registration login: ${err.message}`);
          return next(err);
        }
        log(`[AUTH] Successfully registered and logged in user: ${user.username}`);
        res.status(201).json(user);
      });
    } catch (error) {
      log(`[AUTH] Registration error: ${error instanceof Error ? error.message : String(error)}`);
      next(error);
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    log(`[AUTH] Login successful - Session ID: ${req.sessionID}`);
    res.json(req.user);
  });

  app.post("/api/logout", (req, res, next) => {
    const username = req.user?.username;
    req.logout((err) => {
      if (err) {
        log(`[AUTH] Logout error for user ${username}: ${err.message}`);
        return next(err);
      }
      log(`[AUTH] Successfully logged out user: ${username}`);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      log(`[AUTH] Unauthorized access attempt to /api/user - No valid session`);
      return res.status(401).json({ message: "Not authenticated" });
    }
    log(`[AUTH] Successfully retrieved user data for: ${req.user.username}`);
    res.json(req.user);
  });
}
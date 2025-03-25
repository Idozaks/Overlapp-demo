import express, { type Request, type Response, type NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { db, sql } from "./db";
import { setupAuth } from "./auth";
import cookieParser from "cookie-parser";
import session from "express-session";
import { storage } from "./storage";
import { setupSocketServer } from "./socket";

// Global error handlers
process.on('uncaughtException', (error) => {
  log('Uncaught Exception:');
  log(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  log('Unhandled Rejection at:', String(promise));
  log('Reason:', String(reason));
  process.exit(1);
});

const app = express();

// Important: Order of middleware matters
// 1. Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set trust proxy first
app.set('trust proxy', 1);

// Configure session middleware
const sessionConfig = {
  store: storage.sessionStore,
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' as const : 'lax' as const
  },
  name: 'overlapp.sid' // Custom session cookie name
};

// Add cookie parser and session before auth
app.use(cookieParser());
app.use(session(sessionConfig));

// Add detailed request logging
app.use((req, res, next) => {
  const start = Date.now();
  log(`[REQUEST] ${req.method} ${req.path}`);
  log(`[SESSION] ID: ${req.sessionID}, Authenticated: ${req.isAuthenticated?.()}`);

  res.on("finish", () => {
    const duration = Date.now() - start;
    log(`[RESPONSE] ${req.method} ${req.path} ${res.statusCode} (${duration}ms)`);
  });

  next();
});

// Setup auth after session middleware
setupAuth(app);

(async () => {
  try {
    log("Starting server initialization...");

    // Enhanced database connection testing
    try {
      log("Testing database connection...");
      const result = await db.execute(sql`SELECT current_timestamp as time, current_database() as database`);
      log("Database connection successful:", JSON.stringify(result));
    } catch (error) {
      log("Database connection failed:");
      log(error instanceof Error ? error.stack || error.message : "Unknown error");
      throw error;
    }

    log("Setting up server environment...");
    const server = await registerRoutes(app);
    
    // Initialize Socket.io server
    log("Setting up Socket.io server...");
    const socketManager = setupSocketServer(server);
    log("Socket.io server initialized");

    if (app.get("env") === "development") {
      log("Setting up Vite in development mode...");
      await setupVite(app, server);
      log("Vite setup complete");
    } else {
      log("Setting up static file serving...");
      serveStatic(app);
    }

    // Enhanced error middleware
    app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
      const timestamp = new Date().toISOString();
      const errorDetails = {
        timestamp,
        path: req.path,
        method: req.method,
        ip: req.ip,
        error: err instanceof Error ? {
          name: err.name,
          message: err.message,
          stack: err.stack
        } : String(err),
        headers: req.headers,
        query: req.query,
        body: req.body
      };

      log(`[ERROR] ${timestamp} - Error caught in middleware:`, JSON.stringify(errorDetails, null, 2));

      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({
        message,
        timestamp,
        path: req.path,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    });

    // Ensure we use port 5000 for consistency
    const PORT = 5000;
    log(`Attempting to start server on port ${PORT}...`);

    await new Promise<void>((resolve, reject) => {
      server.listen(PORT, "0.0.0.0", () => {
        log(`Server successfully started and listening on port ${PORT}`);
        log(`Environment: ${app.get("env")}`);
        log(`Database: ${process.env.PGDATABASE}`);
        resolve();
      }).on('error', (err) => {
        log(`Failed to start server: ${err.message}`);
        reject(err);
      });
    });
  } catch (error) {
    log("Fatal error during server startup:");
    log(error instanceof Error ? error.stack || error.message : String(error));
    process.exit(1);
  }
})();
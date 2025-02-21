import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { db, sql } from "./db";

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
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enhanced logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

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

    log("Registering routes...");
    const server = await registerRoutes(app);
    log("Routes registered successfully");

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

    if (app.get("env") === "development") {
      log("Setting up Vite in development mode...");
      await setupVite(app, server);
      log("Vite setup complete");
    } else {
      log("Setting up static file serving...");
      serveStatic(app);
    }

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, "0.0.0.0", () => {
      log(`Server successfully started and listening on port ${PORT}`);
      log(`Environment: ${app.get("env")}`);
      log(`Database: ${process.env.PGDATABASE}`);
    });
  } catch (error) {
    log("Fatal error during server startup:");
    log(error instanceof Error ? error.stack || error.message : String(error));
    process.exit(1);
  }
})();
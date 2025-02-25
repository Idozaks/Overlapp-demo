import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { log } from "./vite";

const dbLog = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[DATABASE] ${timestamp} - ${message}`;
  if (data) {
    log(logMessage, JSON.stringify(data, null, 2));
  } else {
    log(logMessage);
  }
};

import { sql } from "drizzle-orm";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

dbLog("Initializing database connection pool...");
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Test the database connection
pool.connect()
  .then(() => dbLog("Successfully connected to database"))
  .catch(err => dbLog("Error connecting to database:", err));

dbLog("Creating Drizzle ORM instance...");
export const db = drizzle(pool, { schema });
dbLog("Drizzle ORM instance created successfully");

// Export sql for raw queries
export { sql };
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await storage.getUserByUsername(username);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({ user });
  });

  app.post("/api/users", async (req, res) => {
    const result = insertUserSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid user data" });
    }

    const user = await storage.createUser(result.data);
    res.status(201).json({ user });
  });

  app.get("/api/recommendations/:userId", async (req, res) => {
    const recommendations = await storage.getRecommendations(Number(req.params.userId));
    res.json({ recommendations });
  });

  const httpServer = createServer(app);
  return httpServer;
}

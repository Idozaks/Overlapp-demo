import { Request, Response, Router } from "express";
import { analyzeConnectionPotential } from "./connection-analysis";
import { log } from "./vite";

// Create a dedicated router for connection-related endpoints
const connectionRouter = Router();

// Connection potential analysis endpoint for nearby people
connectionRouter.post("/analyze", async (req: Request, res: Response) => {
  try {
    // Log request without stringifying again to avoid double-stringification issues
    log("[Connection Analysis] Received request");
    
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ message: "Invalid request body format" });
    }
    
    const { userInterests, targetInterests, userBio, targetBio } = req.body;
    
    if (!userInterests || !targetInterests) {
      const missingFields = [];
      if (!userInterests) missingFields.push('userInterests');
      if (!targetInterests) missingFields.push('targetInterests');
      
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }
    
    // Check if OpenAI API key is set
    if (!process.env.OPENAI_API_KEY) {
      log("[Connection Analysis] OPENAI_API_KEY is not set");
      return res.status(500).json({ 
        message: "OpenAI API key is not configured" 
      });
    }
    
    // Generate connection analysis using OpenAI
    log("[Connection Analysis] Calling analyzeConnectionPotential...");
    log("[Connection Analysis] User interests:", JSON.stringify(userInterests));
    log("[Connection Analysis] Target interests:", JSON.stringify(targetInterests));
    
    try {
      const analysis = await analyzeConnectionPotential(
        userInterests,
        targetInterests,
        userBio as string || '',
        targetBio as string || ''
      );
    
      log("[Connection Analysis] Analysis complete:", JSON.stringify({
        score: analysis.compatibilityScore,
        hasReasoning: !!analysis.compatibilityReasoning,
        conversationStartersCount: analysis.conversationStarters?.length || 0
      }));
      
      // Ensure we're setting the correct content type
      res.setHeader('Content-Type', 'application/json');
      return res.json(analysis);
    } catch (analysisError) {
      log("[Connection Analysis] Analysis Error:", 
        analysisError instanceof Error ? analysisError.message : String(analysisError));
      return res.status(500).json({ 
        message: "Failed to analyze connection: OpenAI API error",
        error: analysisError instanceof Error ? analysisError.message : String(analysisError)
      });
    }
  } catch (error) {
    log("[Connection Analysis] General Error:", error instanceof Error ? error.message : String(error));
    return res.status(500).json({ 
      message: "Failed to analyze connection potential",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export { connectionRouter };
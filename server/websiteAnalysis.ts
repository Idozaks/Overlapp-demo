import OpenAI from "openai";
import { log } from "./vite";

export interface WebsiteAnalysisRequest {
  url: string;
  userInterests: string[];
}

export interface WebsiteAnalysisResult {
  websiteName: string;
  url: string;
  overlapScore: number;
  analysisReasoning: string;
  matchingInterests: string[];
  recommendations: string[];
  category?: string;
  description?: string;
}

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Extracts the domain name from a URL
 */
function extractDomain(url: string): string {
  try {
    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch (error) {
    return url; // Return original if parsing fails
  }
}

/**
 * Analyzes a website URL and returns how it overlaps with user interests
 * 
 * @param request The website analysis request containing the URL and user interests
 * @returns A detailed analysis of the website-user interest overlap
 */
export async function generateWebsiteAnalysis(
  request: WebsiteAnalysisRequest
): Promise<WebsiteAnalysisResult> {
  const { url, userInterests } = request;
  
  try {
    log(`Generating website analysis for URL: ${url} with ${userInterests.length} interests`);
    
    // In a full version, we would retrieve real website data via API or web scraping
    // For the MVP, we'll use the domain and make educated guesses for the analysis
    const domain = extractDomain(url);
    
    // Prepare prompt for AI analysis
    const prompt = `
      Analyze the following website domain and how it aligns with the user's interests.
      
      Website URL: ${url}
      Domain: ${domain}
      
      User Interests: ${userInterests.join(', ')}
      
      Task:
      1. Determine what kind of content this website likely has based on its domain name
      2. Assess how well it matches the user's interests, providing a score (0-100)
      3. Identify which specific user interests likely overlap with the website content
      4. Provide recommendations for how the user can benefit from this website
      5. Generate a brief website description (if you can infer it from the domain)
      6. Suggest a category for the website
      
      Return a JSON object with the following structure:
      {
        "websiteName": "Name of the website",
        "url": "${url}",
        "overlapScore": number between 0 and 100,
        "analysisReasoning": "Detailed explanation of the overlap score and analysis",
        "matchingInterests": ["list", "of", "matching", "user", "interests"],
        "recommendations": ["list", "of", "3-5", "recommendations"],
        "category": "Website category",
        "description": "Brief website description"
      }
    `;
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });
    
    const result = response.choices[0]?.message?.content;
    
    if (!result) {
      throw new Error("Failed to generate website analysis: Empty response from OpenAI");
    }
    
    const analysisResult = JSON.parse(result) as WebsiteAnalysisResult;
    
    // Validate and ensure fields exist
    return {
      websiteName: analysisResult.websiteName || domain,
      url: analysisResult.url || url,
      overlapScore: analysisResult.overlapScore || 0,
      analysisReasoning: analysisResult.analysisReasoning || "Analysis could not be generated at this time.",
      matchingInterests: analysisResult.matchingInterests || [],
      recommendations: analysisResult.recommendations || [],
      category: analysisResult.category,
      description: analysisResult.description
    };
  } catch (error) {
    log("Error generating website analysis:", String(error));
    throw new Error(`Failed to generate website analysis: ${error instanceof Error ? error.message : String(error)}`);
  }
}
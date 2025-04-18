import { OpenAI } from "openai";
import { log } from "./vite";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Represents a semantic match between two interests
 */
export interface SemanticMatch {
  interest1: string;
  interest2: string;
  similarityScore: number; // 0-1
  confidence: number; // 0-1
}

/**
 * Generates embeddings for an array of interests using OpenAI's embeddings API
 */
async function generateEmbeddings(interests: string[]): Promise<{ [key: string]: number[] }> {
  try {
    if (interests.length === 0) return {};
    
    // Deduplicate interests
    const uniqueInterests = [...new Set(interests)];
    
    log(`Generating embeddings for ${uniqueInterests.length} interests`);
    
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: uniqueInterests,
      encoding_format: "float",
    });
    
    // Create a map of interest to embedding
    const embeddings: { [key: string]: number[] } = {};
    
    response.data.forEach((item, index) => {
      embeddings[uniqueInterests[index]] = item.embedding;
    });
    
    return embeddings;
  } catch (error) {
    log("Error generating embeddings:", error instanceof Error ? error.message : String(error));
    throw new Error("Failed to generate embeddings for interests");
  }
}

/**
 * Calculates the cosine similarity between two vectors
 */
function calculateCosineSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) {
    throw new Error("Vectors must have the same length");
  }
  
  // Calculate dot product
  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;
  
  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    mag1 += vec1[i] * vec1[i];
    mag2 += vec2[i] * vec2[i];
  }
  
  mag1 = Math.sqrt(mag1);
  mag2 = Math.sqrt(mag2);
  
  if (mag1 === 0 || mag2 === 0) return 0;
  
  return dotProduct / (mag1 * mag2);
}

/**
 * Calculates the confidence score based on embedding quality and other factors
 */
function calculateConfidence(
  interest1: string, 
  interest2: string, 
  similarityScore: number
): number {
  // For now, use a simple heuristic:
  // - Higher similarity scores have higher confidence
  // - Short or very generic interests have lower confidence
  
  const interestLength = Math.min(interest1.length, interest2.length);
  const lengthFactor = Math.min(1, interestLength / 20); // normalize with max at 20 chars
  
  // Generic terms have lower confidence
  const genericTerms = ['hobby', 'interest', 'activity', 'thing', 'stuff'];
  const containsGenericTerm = 
    genericTerms.some(term => interest1.toLowerCase().includes(term)) ||
    genericTerms.some(term => interest2.toLowerCase().includes(term));
  
  const genericFactor = containsGenericTerm ? 0.7 : 1.0;
  
  // Calculate final confidence
  const rawConfidence = similarityScore * lengthFactor * genericFactor;
  
  // Ensure minimum confidence of 0.3 for any match above threshold
  return Math.max(0.3, rawConfidence);
}

/**
 * Calculates semantic similarity between two sets of interests
 * @param interests1 First set of interests
 * @param interests2 Second set of interests
 * @param similarityThreshold Minimum similarity score to consider a match (0-1)
 * @returns Array of semantic matches above the threshold
 */
export async function calculateInterestSimilarity(
  interests1: string[],
  interests2: string[],
  similarityThreshold: number = 0.75
): Promise<SemanticMatch[]> {
  try {
    // Handle empty inputs
    if (interests1.length === 0 || interests2.length === 0) {
      return [];
    }
    
    // Generate embeddings for all interests
    const allInterests = [...new Set([...interests1, ...interests2])];
    const embeddings = await generateEmbeddings(allInterests);
    
    const matches: SemanticMatch[] = [];
    
    // Find exact matches first
    const exactMatches = new Set<string>();
    
    interests1.forEach(interest1 => {
      if (interests2.includes(interest1)) {
        exactMatches.add(interest1);
        matches.push({
          interest1,
          interest2: interest1,
          similarityScore: 1.0,
          confidence: 1.0
        });
      }
    });
    
    // Then find semantic matches, excluding exact matches
    const filteredInterests1 = interests1.filter(i => !exactMatches.has(i));
    const filteredInterests2 = interests2.filter(i => !exactMatches.has(i));
    
    // Calculate similarity for each pair
    for (const interest1 of filteredInterests1) {
      const embedding1 = embeddings[interest1];
      if (!embedding1) continue;
      
      for (const interest2 of filteredInterests2) {
        const embedding2 = embeddings[interest2];
        if (!embedding2) continue;
        
        const similarityScore = calculateCosineSimilarity(embedding1, embedding2);
        
        // Only include matches above threshold
        if (similarityScore >= similarityThreshold) {
          const confidence = calculateConfidence(interest1, interest2, similarityScore);
          
          matches.push({
            interest1,
            interest2,
            similarityScore,
            confidence
          });
        }
      }
    }
    
    // Sort matches by similarity score (descending)
    return matches.sort((a, b) => b.similarityScore - a.similarityScore);
  } catch (error) {
    log("Error calculating interest similarity:", error instanceof Error ? error.message : String(error));
    
    // Fall back to exact matching only
    const exactMatches: SemanticMatch[] = [];
    
    interests1.forEach(interest1 => {
      if (interests2.includes(interest1)) {
        exactMatches.push({
          interest1,
          interest2: interest1,
          similarityScore: 1.0,
          confidence: 1.0
        });
      }
    });
    
    return exactMatches;
  }
}

/**
 * Groups semantically similar interests into clusters
 * @param interests List of all interests to cluster
 * @param similarityThreshold Minimum similarity to be in the same cluster
 * @returns Map of cluster IDs to interests in that cluster
 */
export async function clusterSimilarInterests(
  interests: string[],
  similarityThreshold: number = 0.8
): Promise<Map<number, string[]>> {
  try {
    // Generate embeddings for all interests
    const embeddings = await generateEmbeddings(interests);
    
    // Initialize each interest as its own cluster
    const clusters = new Map<number, string[]>();
    const interestToCluster = new Map<string, number>();
    
    interests.forEach((interest, index) => {
      clusters.set(index, [interest]);
      interestToCluster.set(interest, index);
    });
    
    // Compare all pairs of interests
    for (let i = 0; i < interests.length; i++) {
      const interest1 = interests[i];
      const embedding1 = embeddings[interest1];
      if (!embedding1) continue;
      
      for (let j = i + 1; j < interests.length; j++) {
        const interest2 = interests[j];
        const embedding2 = embeddings[interest2];
        if (!embedding2) continue;
        
        const similarity = calculateCosineSimilarity(embedding1, embedding2);
        
        // If similarity is above threshold, merge clusters
        if (similarity >= similarityThreshold) {
          const cluster1 = interestToCluster.get(interest1)!;
          const cluster2 = interestToCluster.get(interest2)!;
          
          // Skip if already in the same cluster
          if (cluster1 === cluster2) continue;
          
          // Merge cluster2 into cluster1
          const mergedInterests = [
            ...(clusters.get(cluster1) || []),
            ...(clusters.get(cluster2) || [])
          ];
          
          clusters.set(cluster1, mergedInterests);
          clusters.delete(cluster2);
          
          // Update cluster assignments
          for (const interest of clusters.get(cluster1) || []) {
            interestToCluster.set(interest, cluster1);
          }
        }
      }
    }
    
    return clusters;
  } catch (error) {
    log("Error clustering similar interests:", error instanceof Error ? error.message : String(error));
    
    // Fallback: return each interest in its own cluster
    const fallbackClusters = new Map<number, string[]>();
    interests.forEach((interest, index) => {
      fallbackClusters.set(index, [interest]);
    });
    
    return fallbackClusters;
  }
}

/**
 * Enhanced function to find semantic matches between sets of interests
 * that returns both exact and semantic matches with advanced metrics
 */
export async function findSemanticallySimilarInterests(
  currentUserInterests: string[], 
  targetUserInterests: string[]
): Promise<{
  exactMatches: string[];
  semanticMatches: SemanticMatch[];
  overallSimilarity: number;
}> {
  try {
    // First handle empty cases
    if (currentUserInterests.length === 0 || targetUserInterests.length === 0) {
      return {
        exactMatches: [],
        semanticMatches: [],
        overallSimilarity: 0
      };
    }
    
    // Find exact matches
    const exactMatches = currentUserInterests.filter(interest => 
      targetUserInterests.includes(interest)
    );
    
    // Get semantic matches
    const semanticMatches = await calculateInterestSimilarity(
      currentUserInterests, 
      targetUserInterests,
      0.75 // similarity threshold
    );
    
    // Filter out exact matches from semantic matches
    const uniqueSemanticMatches = semanticMatches.filter(match => 
      match.similarityScore < 1.0
    );
    
    // Calculate overall similarity score
    // Base: percentage of interests that match (exact or semantic)
    const totalInterests = new Set([...currentUserInterests, ...targetUserInterests]).size;
    const matchCount = exactMatches.length + uniqueSemanticMatches.length;
    
    // Weight exact matches higher than semantic matches
    const weightedMatchCount = exactMatches.length + 
      uniqueSemanticMatches.reduce((sum, match) => sum + match.similarityScore * 0.8, 0);
    
    const overallSimilarity = totalInterests > 0 
      ? weightedMatchCount / totalInterests 
      : 0;
    
    return {
      exactMatches,
      semanticMatches: uniqueSemanticMatches,
      overallSimilarity: Math.min(1, overallSimilarity)
    };
  } catch (error) {
    log("Error finding semantically similar interests:", error instanceof Error ? error.message : String(error));
    
    // Fall back to exact matching only
    const exactMatches = currentUserInterests.filter(interest => 
      targetUserInterests.includes(interest)
    );
    
    const totalInterests = new Set([...currentUserInterests, ...targetUserInterests]).size;
    const overallSimilarity = totalInterests > 0 
      ? exactMatches.length / totalInterests 
      : 0;
    
    return {
      exactMatches,
      semanticMatches: [],
      overallSimilarity
    };
  }
}
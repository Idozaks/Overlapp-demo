/**
 * Streaming Service for AI Analysis
 * 
 * This service handles the streaming connection to the server for receiving
 * real-time AI thought process data.
 */

type StreamingMessageType = 'analysis' | 'thought' | 'error' | 'end';

export interface StreamingMessage {
  type: StreamingMessageType;
  data?: any;
}

interface StreamingCallbacks {
  onAnalysis?: (analysisData: any) => void;
  onThought?: (thoughtData: string) => void;
  onError?: (error: string) => void;
  onComplete?: () => void;
}

/**
 * Start a streaming connection to the server for AI analysis
 * @param url The streaming endpoint URL
 * @param callbacks Event callbacks for different message types
 * @returns An abort controller that can be used to cancel the stream
 */
export function startAiAnalysisStream(
  url: string,
  callbacks: StreamingCallbacks
): AbortController {
  const controller = new AbortController();
  const { signal } = controller;
  
  // Create the event source
  const eventSource = new EventSource(url);
  
  // Handle different event types
  eventSource.addEventListener('analysis', (event) => {
    try {
      const data = JSON.parse(event.data);
      if (callbacks.onAnalysis) {
        callbacks.onAnalysis(data);
      }
    } catch (error) {
      console.error('Error parsing analysis data:', error);
      if (callbacks.onError) {
        callbacks.onError('Failed to parse analysis data');
      }
    }
  });
  
  eventSource.addEventListener('thought', (event) => {
    try {
      // Thought data is a JSON-stringified string
      const data = JSON.parse(event.data);
      if (callbacks.onThought) {
        callbacks.onThought(data);
      }
    } catch (error) {
      console.error('Error parsing thought data:', error);
      if (callbacks.onError) {
        callbacks.onError('Failed to parse thought data');
      }
    }
  });
  
  eventSource.addEventListener('error', (event) => {
    try {
      const errorData = JSON.parse(event.data);
      if (callbacks.onError) {
        callbacks.onError(errorData);
      }
    } catch (error) {
      console.error('Error parsing error data:', error);
      if (callbacks.onError) {
        callbacks.onError('Stream error occurred');
      }
    }
    
    // Close the connection on error
    eventSource.close();
  });
  
  eventSource.addEventListener('end', () => {
    if (callbacks.onComplete) {
      callbacks.onComplete();
    }
    
    // Close the connection when we're done
    eventSource.close();
  });
  
  // Handle connection errors
  eventSource.onerror = (error) => {
    console.error('EventSource error:', error);
    if (callbacks.onError) {
      callbacks.onError('Connection error');
    }
    
    // Close the connection on error
    eventSource.close();
  };
  
  // Set up abort signal to close the connection when requested
  signal.addEventListener('abort', () => {
    eventSource.close();
  });
  
  return controller;
}

/**
 * Utility to generate a URL with query parameters
 * @param baseUrl The base URL
 * @param params Query parameters
 * @returns The complete URL with query string
 */
export function generateStreamingUrl(baseUrl: string, params: Record<string, string | number | boolean>): string {
  const url = new URL(baseUrl, window.location.origin);
  
  // Add query parameters
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });
  
  return url.toString();
}
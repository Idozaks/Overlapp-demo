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
  const abortController = new AbortController();
  const eventSource = new EventSource(url);
  
  eventSource.onmessage = (event) => {
    try {
      const message: StreamingMessage = JSON.parse(event.data);
      
      switch (message.type) {
        case 'analysis':
          if (callbacks.onAnalysis) {
            callbacks.onAnalysis(message.data);
          }
          break;
        
        case 'thought':
          if (callbacks.onThought) {
            callbacks.onThought(message.data);
          }
          break;
        
        case 'error':
          if (callbacks.onError) {
            callbacks.onError(message.data || 'Unknown error');
          }
          eventSource.close();
          break;
        
        case 'end':
          if (callbacks.onComplete) {
            callbacks.onComplete();
          }
          eventSource.close();
          break;
      }
    } catch (error) {
      console.error('Error parsing streaming message:', error);
      if (callbacks.onError) {
        callbacks.onError('Failed to parse server message');
      }
    }
  };
  
  eventSource.onerror = (error) => {
    console.error('EventSource error:', error);
    if (callbacks.onError) {
      callbacks.onError('Connection error');
    }
    eventSource.close();
  };
  
  // Set up the abort controller to close the connection
  abortController.signal.addEventListener('abort', () => {
    eventSource.close();
  });
  
  return abortController;
}

/**
 * Utility to generate a URL with query parameters
 * @param baseUrl The base URL
 * @param params Query parameters
 * @returns The complete URL with query string
 */
export function generateStreamingUrl(baseUrl: string, params: Record<string, string | number | boolean>): string {
  const url = new URL(baseUrl, window.location.origin);
  
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });
  
  return url.toString();
}
import { io, Socket } from 'socket.io-client';
import { User } from '@shared/schema';

// Define client-to-server events (matching server-side definitions)
interface ClientToServerEvents {
  // Connection events
  join_conversation: (conversationId: number) => void;
  leave_conversation: (conversationId: number) => void;
  set_active_identity: (identityContext: string) => void;
  
  // Message events
  send_message: (data: {
    conversationId: number;
    content: string;
    contentType?: string;
    mediaUrl?: string;
    metadata?: any;
  }) => void;
  
  // Message status events
  mark_as_read: (data: { conversationId: number, messageId?: number }) => void;
  typing_start: (conversationId: number) => void;
  typing_end: (conversationId: number) => void;
  
  // AI Companion events
  ai_conversation_start: (data: { companionId: number }) => void;
  ai_conversation_feedback: (data: { conversationId: number, messageId: number, feedback: 'helpful' | 'not_helpful', details?: string }) => void;
}

// Define server-to-client events (matching server-side definitions)
interface ServerToClientEvents {
  // New message event
  receive_message: (message: any) => void;
  
  // Message status events
  message_status_update: (data: { messageId: number, userId: number, status: string }) => void;
  
  // User activity events
  user_typing_start: (data: { conversationId: number, userId: number, username: string }) => void;
  user_typing_end: (data: { conversationId: number, userId: number }) => void;
  user_online_status: (data: { userId: number, isOnline: boolean, lastSeen?: string }) => void;
  
  // AI Companion events
  ai_message: (message: any) => void;
  ai_thinking: (data: { conversationId: number, isThinking: boolean }) => void;
}

// Create the socket instance
let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

// Create a map of event handlers for easy management
type EventHandlerMap = {
  [K in keyof ServerToClientEvents]?: Set<ServerToClientEvents[K]>;
};
const eventHandlers: EventHandlerMap = {};

/**
 * Initialize the socket connection
 */
export function initSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
  if (socket) return socket;
  
  // Connect to server (using default URL, which will be relative to current host)
  socket = io({
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
    withCredentials: true
  });
  
  // Set up connection event handlers
  socket.on('connect', () => {
    console.log('Socket connected');
  });
  
  socket.on('disconnect', (reason) => {
    console.log(`Socket disconnected: ${reason}`);
  });
  
  // Set up handlers for server events
  socket.on('receive_message', (message) => {
    triggerEventHandlers('receive_message', message);
  });
  
  socket.on('message_status_update', (data) => {
    triggerEventHandlers('message_status_update', data);
  });
  
  socket.on('user_typing_start', (data) => {
    triggerEventHandlers('user_typing_start', data);
  });
  
  socket.on('user_typing_end', (data) => {
    triggerEventHandlers('user_typing_end', data);
  });
  
  socket.on('user_online_status', (data) => {
    triggerEventHandlers('user_online_status', data);
  });
  
  socket.on('ai_message', (message) => {
    triggerEventHandlers('ai_message', message);
  });
  
  socket.on('ai_thinking', (data) => {
    triggerEventHandlers('ai_thinking', data);
  });
  
  return socket;
}

/**
 * Get the socket instance, initializing if necessary
 */
export function getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
  if (!socket) {
    return initSocket();
  }
  return socket;
}

/**
 * Add an event handler
 */
export function addSocketEventHandler<K extends keyof ServerToClientEvents>(
  event: K,
  handler: ServerToClientEvents[K]
): void {
  if (!eventHandlers[event]) {
    eventHandlers[event] = new Set();
  }
  eventHandlers[event]?.add(handler);
}

/**
 * Remove an event handler
 */
export function removeSocketEventHandler<K extends keyof ServerToClientEvents>(
  event: K,
  handler: ServerToClientEvents[K]
): void {
  if (eventHandlers[event]) {
    eventHandlers[event]?.delete(handler);
  }
}

/**
 * Trigger all event handlers for a specific event
 */
function triggerEventHandlers<K extends keyof ServerToClientEvents>(
  event: K,
  ...args: Parameters<ServerToClientEvents[K]>
): void {
  if (eventHandlers[event]) {
    for (const handler of Array.from(eventHandlers[event] || [])) {
      // @ts-ignore - This is a bit of a hack, but it works
      handler(...args);
    }
  }
}

/**
 * Join a conversation
 */
export function joinConversation(conversationId: number): void {
  const socket = getSocket();
  socket.emit('join_conversation', conversationId);
}

/**
 * Leave a conversation
 */
export function leaveConversation(conversationId: number): void {
  const socket = getSocket();
  socket.emit('leave_conversation', conversationId);
}

/**
 * Set active identity context
 */
export function setActiveIdentity(identityContext: string): void {
  const socket = getSocket();
  socket.emit('set_active_identity', identityContext);
}

/**
 * Send a message
 */
export function sendMessage(data: {
  conversationId: number;
  content: string;
  contentType?: string;
  mediaUrl?: string;
  metadata?: any;
}): void {
  const socket = getSocket();
  socket.emit('send_message', data);
}

/**
 * Mark messages as read
 */
export function markAsRead(data: { conversationId: number, messageId?: number }): void {
  const socket = getSocket();
  socket.emit('mark_as_read', data);
}

/**
 * Start typing indicator
 */
export function startTyping(conversationId: number): void {
  const socket = getSocket();
  socket.emit('typing_start', conversationId);
}

/**
 * End typing indicator
 */
export function endTyping(conversationId: number): void {
  const socket = getSocket();
  socket.emit('typing_end', conversationId);
}

/**
 * Start an AI conversation
 */
export function startAiConversation(companionId: number): void {
  const socket = getSocket();
  socket.emit('ai_conversation_start', { companionId });
}

/**
 * Send AI conversation feedback
 */
export function sendAiFeedback(data: {
  conversationId: number;
  messageId: number;
  feedback: 'helpful' | 'not_helpful';
  details?: string;
}): void {
  const socket = getSocket();
  socket.emit('ai_conversation_feedback', data);
}

// Create a React hook for socket events
import { useEffect } from 'react';

export function useSocketEvent<K extends keyof ServerToClientEvents>(
  event: K,
  handler: ServerToClientEvents[K]
): void {
  useEffect(() => {
    const socket = getSocket();
    
    // Add event handler
    addSocketEventHandler(event, handler);
    
    // Clean up on unmount
    return () => {
      removeSocketEventHandler(event, handler);
    };
  }, [event, handler]);
}
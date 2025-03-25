import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { storage } from './storage';
import { log } from './vite';
import { User } from '@shared/schema';

interface UserSocketInfo {
  userId: number;
  socketId: string;
  activeIdentityContext?: string;
}

export interface ClientToServerEvents {
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

export interface ServerToClientEvents {
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

export class SocketManager {
  private io: SocketServer<ClientToServerEvents, ServerToClientEvents>;
  private userSockets = new Map<number, Set<string>>(); // userId -> Set of socketIds
  private socketUsers = new Map<string, UserSocketInfo>(); // socketId -> UserSocketInfo
  private conversationParticipants = new Map<number, Set<string>>(); // conversationId -> Set of socketIds
  private typingUsers = new Map<number, Set<number>>(); // conversationId -> Set of userIds who are typing
  
  constructor(server: HttpServer) {
    this.io = new SocketServer<ClientToServerEvents, ServerToClientEvents>(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });
    
    this.setupSocketHandlers();
    
    // Set up interval to clear typing statuses
    setInterval(() => this.clearStaledTypingStatuses(), 5000);
    
    log('[SOCKET] Socket.io server initialized');
  }
  
  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      log(`[SOCKET] New connection: ${socket.id}`);
      
      // Handle authentication
      const userId = this.getUserIdFromSession(socket);
      
      if (!userId) {
        log(`[SOCKET] Unauthenticated connection: ${socket.id}`);
        socket.disconnect();
        return;
      }
      
      // Set up socket information
      this.registerUserSocket(userId, socket.id);
      
      // Notify others of online status
      this.broadcastUserOnlineStatus(userId, true);
      
      // Handle disconnection
      socket.on('disconnect', () => {
        log(`[SOCKET] Disconnection: ${socket.id}`);
        this.handleDisconnect(socket.id);
      });
      
      // Handle joining conversations
      socket.on('join_conversation', (conversationId) => {
        this.handleJoinConversation(socket.id, conversationId);
      });
      
      // Handle leaving conversations
      socket.on('leave_conversation', (conversationId) => {
        this.handleLeaveConversation(socket.id, conversationId);
      });
      
      // Handle sending messages
      socket.on('send_message', async (data) => {
        await this.handleSendMessage(socket.id, data);
      });
      
      // Handle marking messages as read
      socket.on('mark_as_read', async (data) => {
        await this.handleMarkAsRead(socket.id, data);
      });
      
      // Handle typing indicators
      socket.on('typing_start', (conversationId) => {
        this.handleTypingStart(socket.id, conversationId);
      });
      
      socket.on('typing_end', (conversationId) => {
        this.handleTypingEnd(socket.id, conversationId);
      });
      
      // Handle identity context changes
      socket.on('set_active_identity', (identityContext) => {
        this.handleSetActiveIdentity(socket.id, identityContext);
      });
      
      // Handle AI companion events
      socket.on('ai_conversation_start', async (data) => {
        await this.handleAiConversationStart(socket.id, data.companionId);
      });
      
      socket.on('ai_conversation_feedback', async (data) => {
        await this.handleAiConversationFeedback(socket.id, data);
      });
      
      log(`[SOCKET] User ${userId} connected with socket ${socket.id}`);
    });
  }
  
  private getUserIdFromSession(socket: any): number | null {
    try {
      // Get user from session
      const session = socket.request.session;
      
      if (!session || !session.passport || !session.passport.user) {
        return null;
      }
      
      return session.passport.user;
    } catch (error) {
      log(`[SOCKET] Error getting user from session: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }
  
  private registerUserSocket(userId: number, socketId: string) {
    // Add socket to user's set of sockets
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socketId);
    
    // Add user info to socket map
    this.socketUsers.set(socketId, { userId, socketId });
  }
  
  private handleDisconnect(socketId: string) {
    const userInfo = this.socketUsers.get(socketId);
    
    if (!userInfo) {
      return;
    }
    
    // Remove socket from user's set of sockets
    const userSockets = this.userSockets.get(userInfo.userId);
    
    if (userSockets) {
      userSockets.delete(socketId);
      
      // If user has no more sockets, they're offline
      if (userSockets.size === 0) {
        this.userSockets.delete(userInfo.userId);
        this.broadcastUserOnlineStatus(userInfo.userId, false);
      }
    }
    
    // Remove socket from conversations
    for (const [conversationId, participants] of this.conversationParticipants.entries()) {
      if (participants.has(socketId)) {
        participants.delete(socketId);
        
        // If conversation has no more participants, remove it
        if (participants.size === 0) {
          this.conversationParticipants.delete(conversationId);
          
          // Clear typing statuses for this conversation
          this.typingUsers.delete(conversationId);
        }
      }
    }
    
    // Remove socket from socket-user map
    this.socketUsers.delete(socketId);
  }
  
  private handleJoinConversation(socketId: string, conversationId: number) {
    const userInfo = this.socketUsers.get(socketId);
    
    if (!userInfo) {
      return;
    }
    
    // Add socket to conversation participants
    if (!this.conversationParticipants.has(conversationId)) {
      this.conversationParticipants.set(conversationId, new Set());
    }
    
    this.conversationParticipants.get(conversationId)!.add(socketId);
    
    log(`[SOCKET] User ${userInfo.userId} joined conversation ${conversationId}`);
  }
  
  private handleLeaveConversation(socketId: string, conversationId: number) {
    const userInfo = this.socketUsers.get(socketId);
    
    if (!userInfo) {
      return;
    }
    
    // Remove socket from conversation participants
    const participants = this.conversationParticipants.get(conversationId);
    
    if (participants) {
      participants.delete(socketId);
      
      // If conversation has no more participants, remove it
      if (participants.size === 0) {
        this.conversationParticipants.delete(conversationId);
      }
    }
    
    // Remove user from typing users for this conversation
    const typingUsers = this.typingUsers.get(conversationId);
    
    if (typingUsers) {
      typingUsers.delete(userInfo.userId);
      
      // Notify others that user stopped typing
      this.broadcastTypingEnd(conversationId, userInfo.userId);
    }
    
    log(`[SOCKET] User ${userInfo.userId} left conversation ${conversationId}`);
  }
  
  private async handleSendMessage(socketId: string, data: {
    conversationId: number;
    content: string;
    contentType?: string;
    mediaUrl?: string;
    metadata?: any;
  }) {
    const userInfo = this.socketUsers.get(socketId);
    
    if (!userInfo) {
      return;
    }
    
    try {
      // Add identity context to metadata if available
      const metadata = {
        ...(data.metadata || {}),
        identityContext: userInfo.activeIdentityContext
      };
      
      // Save message to database
      const message = await storage.sendMessage({
        conversationId: data.conversationId,
        senderId: userInfo.userId,
        content: data.content,
        contentType: data.contentType || 'text',
        mediaUrl: data.mediaUrl,
        metadata
      });
      
      // Get sender info
      const sender = await storage.getUser(userInfo.userId);
      
      if (!sender) {
        throw new Error(`User ${userInfo.userId} not found`);
      }
      
      // Broadcast message to all participants (except sender)
      this.broadcastMessage(data.conversationId, userInfo.userId, {
        ...message,
        sender
      });
      
      // Reset typing status for sender
      this.handleTypingEnd(socketId, data.conversationId);
      
      log(`[SOCKET] User ${userInfo.userId} sent message to conversation ${data.conversationId}`);
    } catch (error) {
      log(`[SOCKET] Error sending message: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  private async handleMarkAsRead(socketId: string, data: { conversationId: number, messageId?: number }) {
    const userInfo = this.socketUsers.get(socketId);
    
    if (!userInfo) {
      return;
    }
    
    try {
      // Update message status in database
      await storage.markMessagesAsRead(data.conversationId, userInfo.userId, data.messageId);
      
      // Get all messages that were marked as read
      const lastReadId = data.messageId;
      let messageIds: number[] = [];
      
      if (lastReadId) {
        // If a specific message ID was provided, get all message IDs up to that one
        const messages = await storage.getConversationMessages(data.conversationId, 1000);
        messageIds = messages
          .filter(m => m.id <= lastReadId)
          .map(m => m.id);
      } else {
        // Otherwise, get the latest message ID
        const messages = await storage.getConversationMessages(data.conversationId, 1);
        messageIds = messages.map(m => m.id);
      }
      
      // Broadcast status updates for all messages
      for (const messageId of messageIds) {
        this.broadcastMessageStatusUpdate(data.conversationId, {
          messageId,
          userId: userInfo.userId,
          status: 'read'
        });
      }
      
      log(`[SOCKET] User ${userInfo.userId} marked messages as read in conversation ${data.conversationId}`);
    } catch (error) {
      log(`[SOCKET] Error marking messages as read: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  private handleTypingStart(socketId: string, conversationId: number) {
    const userInfo = this.socketUsers.get(socketId);
    
    if (!userInfo) {
      return;
    }
    
    // Add user to typing users for this conversation
    if (!this.typingUsers.has(conversationId)) {
      this.typingUsers.set(conversationId, new Set());
    }
    
    this.typingUsers.get(conversationId)!.add(userInfo.userId);
    
    // Broadcast typing start to all participants except sender
    this.broadcastTypingStart(conversationId, userInfo.userId);
  }
  
  private handleTypingEnd(socketId: string, conversationId: number) {
    const userInfo = this.socketUsers.get(socketId);
    
    if (!userInfo) {
      return;
    }
    
    // Remove user from typing users for this conversation
    const typingUsers = this.typingUsers.get(conversationId);
    
    if (typingUsers) {
      typingUsers.delete(userInfo.userId);
    }
    
    // Broadcast typing end to all participants
    this.broadcastTypingEnd(conversationId, userInfo.userId);
  }
  
  private handleSetActiveIdentity(socketId: string, identityContext: string) {
    const userInfo = this.socketUsers.get(socketId);
    
    if (!userInfo) {
      return;
    }
    
    // Update user's active identity context
    this.socketUsers.set(socketId, {
      ...userInfo,
      activeIdentityContext: identityContext
    });
    
    log(`[SOCKET] User ${userInfo.userId} set active identity context to ${identityContext}`);
  }
  
  private async handleAiConversationStart(socketId: string, companionId: number) {
    const userInfo = this.socketUsers.get(socketId);
    
    if (!userInfo) {
      return;
    }
    
    try {
      // Get the AI companion
      const companion = await storage.getAiCompanion(companionId);
      
      if (!companion) {
        throw new Error(`AI Companion ${companionId} not found`);
      }
      
      // Create a new conversation
      const conversation = await storage.createConversation({
        name: `Chat with ${companion.name}`,
        type: 'ai_companion',
        createdBy: userInfo.userId,
        metadata: {
          aiPersonality: companion.personality,
          activeIdentityContext: userInfo.activeIdentityContext
        }
      });
      
      // Add the user as a participant
      await storage.addConversationParticipant({
        conversationId: conversation.id,
        userId: userInfo.userId,
        role: 'admin',
        settings: {
          notifications: true,
          activeIdentityContext: userInfo.activeIdentityContext
        }
      });
      
      // Add the AI as a participant
      const aiUser = await this.getOrCreateAiUser();
      
      await storage.addConversationParticipant({
        conversationId: conversation.id,
        userId: aiUser.id,
        role: 'ai',
        settings: {
          notifications: false
        }
      });
      
      // Create the AI conversation context
      const user = await storage.getUser(userInfo.userId);
      const userIdentitySnapshot = this.extractIdentitySnapshot(user);
      
      await storage.saveAiConversationContext({
        conversationId: conversation.id,
        summary: `Conversation started with ${companion.name}`,
        keyPoints: [],
        userIdentitySnapshot
      });
      
      // Make the user join the conversation
      this.handleJoinConversation(socketId, conversation.id);
      
      // Send the initial AI message
      const welcomeMessage = await storage.sendMessage({
        conversationId: conversation.id,
        senderId: aiUser.id,
        content: `Hello! I'm ${companion.name}. ${companion.description || "How can I help you today?"}`,
        contentType: 'text',
        metadata: {
          isAiGenerated: true,
          aiGenerationParams: {
            model: companion.settings?.model || 'gpt-4o',
            temperature: companion.settings?.temperature || 0.7
          }
        }
      });
      
      // Get sender info
      const sender = await storage.getUser(aiUser.id);
      
      // Broadcast message to the user
      this.broadcastAiMessage(conversation.id, {
        ...welcomeMessage,
        sender
      });
      
      log(`[SOCKET] User ${userInfo.userId} started AI conversation ${conversation.id} with companion ${companionId}`);
      
      return conversation;
    } catch (error) {
      log(`[SOCKET] Error starting AI conversation: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }
  
  private async handleAiConversationFeedback(socketId: string, data: {
    conversationId: number;
    messageId: number;
    feedback: 'helpful' | 'not_helpful';
    details?: string;
  }) {
    const userInfo = this.socketUsers.get(socketId);
    
    if (!userInfo) {
      return;
    }
    
    try {
      // Get the message
      const conversationMessages = await storage.getConversationMessages(data.conversationId);
      const message = conversationMessages.find(m => m.id === data.messageId);
      
      if (!message) {
        throw new Error(`Message ${data.messageId} not found in conversation ${data.conversationId}`);
      }
      
      // Ensure the message is an AI message
      if (!message.metadata?.isAiGenerated) {
        throw new Error(`Message ${data.messageId} is not an AI-generated message`);
      }
      
      // Update the message metadata with feedback
      const updatedMetadata = {
        ...message.metadata,
        feedback: {
          type: data.feedback,
          details: data.details,
          timestamp: new Date().toISOString(),
          userId: userInfo.userId
        }
      };
      
      // Update the message in the database (not implemented yet)
      // Would need to add a method to update message metadata
      
      log(`[SOCKET] User ${userInfo.userId} provided feedback on AI message ${data.messageId} in conversation ${data.conversationId}: ${data.feedback}`);
    } catch (error) {
      log(`[SOCKET] Error handling AI conversation feedback: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  private broadcastMessage(conversationId: number, senderId: number, message: any) {
    const participants = this.conversationParticipants.get(conversationId);
    
    if (!participants) {
      return;
    }
    
    // Emit to all participants except sender
    for (const socketId of participants) {
      const userInfo = this.socketUsers.get(socketId);
      
      if (userInfo && userInfo.userId !== senderId) {
        this.io.to(socketId).emit('receive_message', message);
      }
    }
  }
  
  private broadcastAiMessage(conversationId: number, message: any) {
    const participants = this.conversationParticipants.get(conversationId);
    
    if (!participants) {
      return;
    }
    
    // Emit to all participants
    for (const socketId of participants) {
      this.io.to(socketId).emit('ai_message', message);
    }
  }
  
  private broadcastMessageStatusUpdate(conversationId: number, data: { messageId: number, userId: number, status: string }) {
    const participants = this.conversationParticipants.get(conversationId);
    
    if (!participants) {
      return;
    }
    
    // Emit to all participants
    for (const socketId of participants) {
      this.io.to(socketId).emit('message_status_update', data);
    }
  }
  
  private async broadcastTypingStart(conversationId: number, userId: number) {
    const participants = this.conversationParticipants.get(conversationId);
    
    if (!participants) {
      return;
    }
    
    // Get user info
    const user = await storage.getUser(userId);
    
    if (!user) {
      return;
    }
    
    // Emit to all participants except the typing user
    for (const socketId of participants) {
      const userInfo = this.socketUsers.get(socketId);
      
      if (userInfo && userInfo.userId !== userId) {
        this.io.to(socketId).emit('user_typing_start', {
          conversationId,
          userId,
          username: user.username
        });
      }
    }
  }
  
  private broadcastTypingEnd(conversationId: number, userId: number) {
    const participants = this.conversationParticipants.get(conversationId);
    
    if (!participants) {
      return;
    }
    
    // Emit to all participants except the typing user
    for (const socketId of participants) {
      const userInfo = this.socketUsers.get(socketId);
      
      if (userInfo && userInfo.userId !== userId) {
        this.io.to(socketId).emit('user_typing_end', {
          conversationId,
          userId
        });
      }
    }
  }
  
  private broadcastUserOnlineStatus(userId: number, isOnline: boolean) {
    // Emit to all connected sockets except the user's own sockets
    for (const [socketId, userInfo] of this.socketUsers.entries()) {
      if (userInfo.userId !== userId) {
        this.io.to(socketId).emit('user_online_status', {
          userId,
          isOnline,
          lastSeen: isOnline ? undefined : new Date().toISOString()
        });
      }
    }
  }
  
  private clearStaledTypingStatuses() {
    // Nothing to do for now, typing statuses are cleared when users stop typing or leave conversations
  }
  
  private async getOrCreateAiUser(): Promise<User> {
    try {
      // Try to get the AI user by username
      const aiUser = await storage.getUserByUsername('ai_assistant');
      
      if (aiUser) {
        return aiUser;
      }
      
      // If the AI user doesn't exist, create it
      const newAiUser = await storage.createUser({
        username: 'ai_assistant',
        password: `ai_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
        displayName: 'AI Assistant',
        avatar: '/ai_avatar.png',
        bio: 'AI assistant for chat conversations',
        isAdmin: false,
        preferences: {
          interests: [],
          retailPreferences: []
        }
      });
      
      return newAiUser;
    } catch (error) {
      log(`[SOCKET] Error getting or creating AI user: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
  
  private extractIdentitySnapshot(user?: User): Record<string, any> {
    if (!user) {
      return {};
    }
    
    // Extract relevant identity fields
    return {
      displayName: user.displayName,
      gender: user.gender,
      ageRange: user.ageRange,
      countryOfOrigin: user.countryOfOrigin,
      languagesSpoken: user.languagesSpoken,
      culturalBackground: user.culturalBackground,
      education: user.education,
      professionalField: user.professionalField,
      communityAffiliations: user.communityAffiliations,
      eventPreferences: user.eventPreferences,
      collaborationStyle: user.collaborationStyle,
      personalValues: user.personalValues,
      digitalIdentity: user.digitalIdentity,
      physicalActivityLevel: user.physicalActivityLevel,
      culturalExperiences: user.culturalExperiences,
      learningStyle: user.learningStyle,
      identityPreferences: user.identityPreferences
    };
  }
}

export function setupSocketServer(server: HttpServer) {
  return new SocketManager(server);
}
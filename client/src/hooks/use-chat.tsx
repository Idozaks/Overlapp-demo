import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getSocket, 
  joinConversation, 
  leaveConversation, 
  sendMessage, 
  markAsRead,
  startTyping,
  endTyping,
  setActiveIdentity,
  useSocketEvent
} from '@/lib/socket';
import { apiRequest } from '@/lib/queryClient';

// Message interface
export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  contentType: string;
  mediaUrl?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  metadata?: any;
  sender?: {
    id: number;
    username: string;
    displayName: string | null;
    avatar: string | null;
  };
  status?: 'sent' | 'delivered' | 'read';
}

// Conversation interface
export interface Conversation {
  id: number;
  name: string | null;
  type: 'direct' | 'group' | 'ai_companion';
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    iconUrl?: string;
    activeIdentityContext?: string;
    aiPersonality?: string;
    customSettings?: Record<string, any>;
  };
  lastMessage?: Message | null;
  unreadCount: number;
}

// Participant interface
export interface Participant {
  id: number;
  conversationId: number;
  userId: number;
  role: 'admin' | 'member' | 'ai';
  joinedAt: string;
  lastSeenAt: string | null;
  lastReadMessageId: number | null;
  settings?: {
    notifications: boolean;
    muteUntil?: string;
    activeIdentityContext?: string;
  };
  user: {
    id: number;
    username: string;
    displayName: string | null;
    avatar: string | null;
  };
}

// AI Companion interface
export interface AICompanion {
  id: number;
  name: string;
  description: string | null;
  avatarUrl: string | null;
  createdBy: number;
  personality: string;
  systemPrompt: string;
  isPublic: boolean;
  createdAt: string;
  settings?: {
    model: string;
    temperature: number;
    maxResponseTokens: number;
  };
}

// Typing indicator state
export interface TypingIndicator {
  userId: number;
  username: string;
  timestamp: number;
}

// Context interface
interface ChatContextType {
  conversations: Conversation[];
  currentConversationId: number | null;
  messages: Message[];
  participants: Participant[];
  typingIndicators: Record<number, TypingIndicator>;
  aiCompanions: AICompanion[];
  loadingConversations: boolean;
  loadingMessages: boolean;
  loadingParticipants: boolean;
  loadingAICompanions: boolean;
  activeIdentityContext: string | null;
  setCurrentConversationId: (id: number | null) => void;
  setActiveIdentityContext: (context: string | null) => void;
  createConversation: (data: { name?: string, userIds: number[], type: 'direct' | 'group' }) => Promise<Conversation>;
  sendMessage: (data: { content: string, contentType?: string, mediaUrl?: string, metadata?: any }) => Promise<void>;
  markMessagesAsRead: () => Promise<void>;
  startTyping: () => void;
  endTyping: () => void;
  loadMoreMessages: () => Promise<void>;
  startAIConversation: (companionId: number) => Promise<Conversation>;
  sendAIFeedback: (messageId: number, feedback: 'helpful' | 'not_helpful', details?: string) => Promise<void>;
}

// Create context
const ChatContext = createContext<ChatContextType | null>(null);

// Chat provider component
export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [activeIdentityContext, setActiveIdentityContextState] = useState<string | null>(null);
  const [typingIndicators, setTypingIndicators] = useState<Record<number, TypingIndicator>>({});
  
  // Set active identity context on socket
  const setActiveIdentityContext = useCallback((context: string | null) => {
    setActiveIdentityContextState(context);
    if (context) {
      setActiveIdentity(context);
    }
  }, []);
  
  // Fetch conversations
  const { 
    data: conversationsData, 
    isLoading: loadingConversations 
  } = useQuery({
    queryKey: ['/api/conversations'],
    enabled: !!user,
    staleTime: 30000 // 30 seconds
  });
  
  // Fetch messages for current conversation
  const { 
    data: messagesData, 
    isLoading: loadingMessages,
    fetchNextPage,
    hasNextPage
  } = useQuery({
    queryKey: ['/api/conversations', currentConversationId, 'messages'],
    enabled: !!currentConversationId && !!user,
    staleTime: 0 // Always fetch fresh messages
  });
  
  // Fetch participants for current conversation
  const { 
    data: participantsData, 
    isLoading: loadingParticipants 
  } = useQuery({
    queryKey: ['/api/conversations', currentConversationId, 'participants'],
    enabled: !!currentConversationId && !!user,
    staleTime: 30000 // 30 seconds
  });
  
  // Fetch AI companions
  const { 
    data: aiCompanionsData, 
    isLoading: loadingAICompanions 
  } = useQuery({
    queryKey: ['/api/ai/companions'],
    enabled: !!user,
    staleTime: 3600000 // 1 hour
  });
  
  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: async (data: { name?: string, userIds: number[], type: 'direct' | 'group' }): Promise<Conversation> => {
      const response = await apiRequest('/api/conversations', {
        method: 'POST',
        body: data
      });
      
      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      setCurrentConversationId(data.id);
      toast({
        title: 'Conversation created',
        description: 'You can now start chatting',
        variant: 'default'
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to create conversation',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      });
    }
  });
  
  // Send message wrapper function
  const sendMessageFn = useCallback(async (data: { 
    content: string, 
    contentType?: string, 
    mediaUrl?: string, 
    metadata?: any 
  }) => {
    if (!currentConversationId) {
      throw new Error('No conversation selected');
    }
    
    // End typing indicator
    endTyping(currentConversationId);
    
    // Send message via socket
    sendMessage({
      conversationId: currentConversationId,
      content: data.content,
      contentType: data.contentType || 'text',
      mediaUrl: data.mediaUrl,
      metadata: {
        ...data.metadata,
        activeIdentityContext
      }
    });
  }, [currentConversationId, activeIdentityContext]);
  
  // Mark messages as read wrapper function
  const markMessagesAsReadFn = useCallback(async () => {
    if (!currentConversationId) {
      return;
    }
    
    // Mark messages as read via socket
    markAsRead({ conversationId: currentConversationId });
    
    // Update the unread count in the conversations list
    const conversations = conversationsData?.conversations || [];
    const updatedConversations = conversations.map(conv => {
      if (conv.id === currentConversationId) {
        return { ...conv, unreadCount: 0 };
      }
      return conv;
    });
    
    queryClient.setQueryData(['/api/conversations'], { conversations: updatedConversations });
  }, [currentConversationId, conversationsData, queryClient]);
  
  // Typing indicator functions
  const startTypingFn = useCallback(() => {
    if (currentConversationId) {
      startTyping(currentConversationId);
    }
  }, [currentConversationId]);
  
  const endTypingFn = useCallback(() => {
    if (currentConversationId) {
      endTyping(currentConversationId);
    }
  }, [currentConversationId]);
  
  // Load more messages function
  const loadMoreMessages = useCallback(async () => {
    if (hasNextPage) {
      await fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage]);
  
  // Start AI conversation mutation
  const startAIConversationMutation = useMutation({
    mutationFn: async (companionId: number): Promise<Conversation> => {
      const response = await apiRequest('/api/ai/conversations', {
        method: 'POST',
        body: { companionId }
      });
      
      if (!response.ok) {
        throw new Error('Failed to start AI conversation');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      setCurrentConversationId(data.id);
    },
    onError: (error) => {
      toast({
        title: 'Failed to start AI conversation',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      });
    }
  });
  
  // Send AI feedback mutation
  const sendAIFeedbackMutation = useMutation({
    mutationFn: async (data: { 
      messageId: number, 
      feedback: 'helpful' | 'not_helpful', 
      details?: string 
    }): Promise<void> => {
      if (!currentConversationId) {
        throw new Error('No conversation selected');
      }
      
      const response = await apiRequest(`/api/ai/feedback`, {
        method: 'POST',
        body: {
          conversationId: currentConversationId,
          messageId: data.messageId,
          feedback: data.feedback,
          details: data.details
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to send feedback');
      }
    },
    onSuccess: () => {
      toast({
        title: 'Feedback sent',
        description: 'Thank you for your feedback',
        variant: 'default'
      });
    }
  });
  
  // Socket event handlers
  useSocketEvent('receive_message', (message) => {
    if (message.conversationId === currentConversationId) {
      // Add message to the current conversation
      const currentMessages = messagesData?.pages?.flatMap(page => page.messages) || [];
      queryClient.setQueryData(
        ['/api/conversations', currentConversationId, 'messages'], 
        { pages: [{ messages: [...currentMessages, message] }], pageParams: [] }
      );
      
      // Mark as read if this is the current conversation
      markMessagesAsReadFn();
    }
    
    // Update last message in conversations list
    const conversations = conversationsData?.conversations || [];
    const updatedConversations = conversations.map(conv => {
      if (conv.id === message.conversationId) {
        return { 
          ...conv, 
          lastMessage: message,
          unreadCount: currentConversationId === message.conversationId 
            ? 0  // If this is the current conversation, mark as read
            : conv.unreadCount + 1
        };
      }
      return conv;
    });
    
    queryClient.setQueryData(['/api/conversations'], { conversations: updatedConversations });
    
    // Show notification if message is not from current user and not in current conversation
    if (message.senderId !== user?.id && message.conversationId !== currentConversationId) {
      toast({
        title: `New message from ${message.sender?.displayName || message.sender?.username}`,
        description: message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''),
        variant: 'default'
      });
    }
  });
  
  useSocketEvent('ai_message', (message) => {
    if (message.conversationId === currentConversationId) {
      // Add message to the current conversation
      const currentMessages = messagesData?.pages?.flatMap(page => page.messages) || [];
      queryClient.setQueryData(
        ['/api/conversations', currentConversationId, 'messages'], 
        { pages: [{ messages: [...currentMessages, message] }], pageParams: [] }
      );
    }
    
    // Update last message in conversations list
    const conversations = conversationsData?.conversations || [];
    const updatedConversations = conversations.map(conv => {
      if (conv.id === message.conversationId) {
        return { 
          ...conv, 
          lastMessage: message
        };
      }
      return conv;
    });
    
    queryClient.setQueryData(['/api/conversations'], { conversations: updatedConversations });
  });
  
  useSocketEvent('message_status_update', (data) => {
    // Update message status in the messages list
    if (currentConversationId) {
      const currentMessages = messagesData?.pages?.flatMap(page => page.messages) || [];
      const updatedMessages = currentMessages.map(msg => {
        if (msg.id === data.messageId) {
          return { ...msg, status: data.status };
        }
        return msg;
      });
      
      queryClient.setQueryData(
        ['/api/conversations', currentConversationId, 'messages'], 
        { pages: [{ messages: updatedMessages }], pageParams: [] }
      );
    }
  });
  
  useSocketEvent('user_typing_start', (data) => {
    setTypingIndicators(prev => ({
      ...prev,
      [data.userId]: {
        userId: data.userId,
        username: data.username,
        timestamp: Date.now()
      }
    }));
  });
  
  useSocketEvent('user_typing_end', (data) => {
    setTypingIndicators(prev => {
      const newState = { ...prev };
      delete newState[data.userId];
      return newState;
    });
  });
  
  // Clean up typing indicators after some time
  useEffect(() => {
    const interval = setInterval(() => {
      setTypingIndicators(prev => {
        const now = Date.now();
        const newState = { ...prev };
        
        Object.keys(newState).forEach(userId => {
          const typingInfo = newState[Number(userId)];
          if (now - typingInfo.timestamp > 5000) { // 5 seconds
            delete newState[Number(userId)];
          }
        });
        
        return newState;
      });
    }, 1000); // Check every second
    
    return () => clearInterval(interval);
  }, []);
  
  // Join/leave conversations when currentConversationId changes
  useEffect(() => {
    if (currentConversationId) {
      joinConversation(currentConversationId);
      markMessagesAsReadFn();
      
      // Leave conversation when component unmounts or conversation changes
      return () => {
        leaveConversation(currentConversationId);
      };
    }
  }, [currentConversationId, markMessagesAsReadFn]);
  
  // Extract data from queries
  const conversations = conversationsData?.conversations || [];
  const messages = messagesData?.pages?.flatMap(page => page.messages) || [];
  const participants = participantsData?.participants || [];
  const aiCompanions = aiCompanionsData?.companions || [];
  
  // Context value
  const contextValue: ChatContextType = {
    conversations,
    currentConversationId,
    messages,
    participants,
    typingIndicators,
    aiCompanions,
    loadingConversations,
    loadingMessages,
    loadingParticipants,
    loadingAICompanions,
    activeIdentityContext,
    setCurrentConversationId,
    setActiveIdentityContext,
    createConversation: createConversationMutation.mutateAsync,
    sendMessage: sendMessageFn,
    markMessagesAsRead: markMessagesAsReadFn,
    startTyping: startTypingFn,
    endTyping: endTypingFn,
    loadMoreMessages,
    startAIConversation: startAIConversationMutation.mutateAsync,
    sendAIFeedback: (messageId, feedback, details) => 
      sendAIFeedbackMutation.mutateAsync({ messageId, feedback, details })
  };
  
  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
}

// Custom hook to use the chat context
export function useChat() {
  const context = useContext(ChatContext);
  
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  
  return context;
}
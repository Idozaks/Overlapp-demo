import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { Message, useChat } from '@/hooks/use-chat';
import { useAuth } from '@/hooks/use-auth';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ArrowDownIcon, Loader2Icon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatConversationProps {
  conversationId: number;
  className?: string;
}

export function ChatConversation({ conversationId, className }: ChatConversationProps) {
  const { user } = useAuth();
  const { 
    messages, 
    participants,
    typingIndicators,
    loadingMessages,
    sendMessage,
    markMessagesAsRead,
    startTyping,
    endTyping,
    sendAIFeedback,
    loadMoreMessages
  } = useChat();
  
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  // Check if conversation is with an AI
  const isAiConversation = participants.some(p => p.role === 'ai');
  
  // Check if user can send messages in this conversation
  const canSendMessages = participants.some(p => p.userId === user?.id);
  
  // Filter AI messages and get AI user ID
  const aiParticipant = participants.find(p => p.role === 'ai');
  const aiUserId = aiParticipant?.userId;
  
  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (conversationId) {
      markMessagesAsRead();
    }
  }, [conversationId, markMessagesAsRead]);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messageContainerRef.current && autoScroll) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages, autoScroll]);
  
  // Handle scroll to detect if user has scrolled up
  const handleScroll = () => {
    if (messageContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messageContainerRef.current;
      const atBottom = scrollHeight - scrollTop - clientHeight < 50;
      
      setAutoScroll(atBottom);
      setShowScrollButton(!atBottom);
      
      // Load more messages when user scrolls to top
      if (scrollTop === 0) {
        loadMoreMessages();
      }
    }
  };
  
  // Scroll to bottom
  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
      setAutoScroll(true);
      setShowScrollButton(false);
    }
  };
  
  // Handle sending a message
  const handleSendMessage = (content: string, contentType?: string, mediaUrl?: string) => {
    sendMessage({ content, contentType, mediaUrl });
    scrollToBottom();
  };
  
  // Get typing users for this conversation
  const typingUserIds = Object.keys(typingIndicators)
    .map(Number)
    .filter(userId => userId !== user?.id);
  
  // Get user details for typing indicator
  const typingUsers = typingUserIds.map(userId => {
    const participant = participants.find(p => p.userId === userId);
    return participant?.user?.displayName || participant?.user?.username || 'Someone';
  });
  
  // Format typing indicator text
  const getTypingText = () => {
    if (typingUsers.length === 0) return '';
    if (typingUsers.length === 1) return `${typingUsers[0]} is typing...`;
    if (typingUsers.length === 2) return `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
    return `Multiple people are typing...`;
  };
  
  // Handle AI feedback
  const handleAiFeedback = (messageId: number, feedback: 'helpful' | 'not_helpful') => {
    sendAIFeedback(messageId, feedback);
  };
  
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Messages container */}
      <div 
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto p-4"
        onScroll={handleScroll}
      >
        {loadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <Loader2Icon className="animate-spin h-6 w-6 text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <p className="mb-2">No messages yet</p>
            <p className="text-sm">Send a message to start the conversation</p>
          </div>
        ) : (
          <>
            {/* Render messages */}
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isCurrentUser={message.senderId === user?.id}
                isAi={message.senderId === aiUserId}
                onFeedback={isAiConversation ? handleAiFeedback : undefined}
              />
            ))}
            
            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <div className="flex items-center text-xs text-muted-foreground mb-2">
                <div className="flex space-x-1 mr-2">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '200ms' }} />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '400ms' }} />
                </div>
                <span>{getTypingText()}</span>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Scroll to bottom button */}
      {showScrollButton && (
        <Button
          variant="outline"
          size="icon"
          className="absolute bottom-20 right-6 rounded-full shadow-md"
          onClick={scrollToBottom}
        >
          <ArrowDownIcon className="h-4 w-4" />
        </Button>
      )}
      
      <Separator />
      
      {/* Chat input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onTypingStart={startTyping}
        onTypingEnd={endTyping}
        disabled={!canSendMessages}
        placeholder={
          isAiConversation 
            ? "Ask me anything..."
            : "Type a message..."
        }
      />
    </div>
  );
}
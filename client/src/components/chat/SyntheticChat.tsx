import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, SendIcon, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'synthetic';
  timestamp: Date;
}

interface SyntheticChatProps {
  userId: number;
  userName: string;
  userAvatar?: string;
  initialMessage?: string;
}

export function SyntheticChat({ userId, userName, userAvatar, initialMessage }: SyntheticChatProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Add initial welcome message if provided
    if (initialMessage) {
      const welcomeMessage: Message = {
        id: `synthetic-${Date.now()}`,
        content: initialMessage,
        sender: 'synthetic',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [initialMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You need to be logged in to send messages.",
        variant: "destructive"
      });
      return;
    }

    // Add user message to state
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: input,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      // Prepare conversation history for the API
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));
      
      console.log("Sending message to synthetic chat API:", {
        userId,
        message: input,
        conversationHistory
      });
      
      // Send message to API with conversation history
      const response = await axios.post(`/api/synthetic-chat/${userId}`, {
        message: input,
        conversationHistory
      });
      
      console.log("Synthetic chat API response:", response.data);
      
      // Add synthetic user response
      const syntheticMessage: Message = {
        id: `synthetic-${Date.now()}`,
        content: response.data.message,
        sender: 'synthetic',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, syntheticMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Format timestamp
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('default', {
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex items-start gap-2 max-w-[85%]",
              message.sender === 'user' ? "ml-auto flex-row-reverse" : ""
            )}
          >
            {message.sender === 'synthetic' ? (
              <Avatar className="h-8 w-8 mt-1">
                {userAvatar ? (
                  <AvatarImage src={userAvatar} alt={userName} />
                ) : (
                  <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                )}
              </Avatar>
            ) : (
              <Avatar className="h-8 w-8 mt-1">
                {user?.avatar ? (
                  <AvatarImage src={user.avatar} alt={user.displayName || user.username} />
                ) : (
                  <AvatarFallback>{(user?.displayName || user?.username || 'U').charAt(0)}</AvatarFallback>
                )}
              </Avatar>
            )}
            
            <div className={cn(
              "rounded-lg px-3 py-2 text-sm",
              message.sender === 'user' 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted"
            )}>
              {message.content.split("\n").map((text, i) => (
                <React.Fragment key={i}>
                  {text}
                  {i < message.content.split("\n").length - 1 && <br />}
                </React.Fragment>
              ))}
              
              <div className={cn(
                "text-xs mt-1",
                message.sender === 'user' 
                  ? "text-primary-foreground/70" 
                  : "text-muted-foreground"
              )}>
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-start gap-2 max-w-[85%]">
            <Avatar className="h-8 w-8 mt-1">
              {userAvatar ? (
                <AvatarImage src={userAvatar} alt={userName} />
              ) : (
                <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
              )}
            </Avatar>
            
            <div className="flex items-center space-x-2 bg-muted rounded-lg px-4 py-3">
              <div className="h-2 w-2 rounded-full bg-muted-foreground/30 animate-bounce [animation-delay:-0.3s]"></div>
              <div className="h-2 w-2 rounded-full bg-muted-foreground/30 animate-bounce [animation-delay:-0.15s]"></div>
              <div className="h-2 w-2 rounded-full bg-muted-foreground/30 animate-bounce"></div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input form */}
      <div className="border-t p-3 bg-card">
        <div className="flex items-end gap-2">
          <Textarea
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[60px] resize-none"
            disabled={isLoading}
          />
          <Button 
            size="icon" 
            onClick={sendMessage} 
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SendIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
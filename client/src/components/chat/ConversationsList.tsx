import React from 'react';
import { useChat, Conversation } from '@/hooks/use-chat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusIcon, SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ConversationsListProps {
  onNewConversation: () => void;
  className?: string;
}

export function ConversationsList({ onNewConversation, className }: ConversationsListProps) {
  const { 
    conversations, 
    currentConversationId, 
    setCurrentConversationId,
    loadingConversations
  } = useChat();
  
  const [searchTerm, setSearchTerm] = React.useState('');
  
  // Filter conversations by search term
  const filteredConversations = conversations.filter(conv => {
    const name = conv.name?.toLowerCase() || '';
    return name.includes(searchTerm.toLowerCase());
  });
  
  // Sort conversations by date (newest first)
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
  
  // Format the time for a conversation
  const formatTime = (dateStr: string) => {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  };
  
  // Get the conversation name or default
  const getConversationName = (conversation: Conversation) => {
    if (conversation.name) return conversation.name;
    
    if (conversation.type === 'ai_companion') {
      return 'AI Assistant';
    }
    
    return 'New Conversation';
  };
  
  // Get the conversation icon
  const getConversationIcon = (conversation: Conversation) => {
    // For AI companions, show a special icon
    if (conversation.type === 'ai_companion') {
      return 'AI';
    }
    
    // For named conversations, use the first letter
    if (conversation.name) {
      return conversation.name[0].toUpperCase();
    }
    
    // Default
    return '#';
  };
  
  // Get the last message preview
  const getLastMessagePreview = (conversation: Conversation) => {
    if (!conversation.lastMessage) {
      return 'No messages yet';
    }
    
    const content = conversation.lastMessage.content;
    if (content.length > 30) {
      return content.substring(0, 30) + '...';
    }
    
    return content;
  };
  
  return (
    <div className={cn("flex flex-col h-full border-r", className)}>
      <div className="p-3 border-b">
        <Button 
          className="w-full justify-start gap-2"
          onClick={onNewConversation}
        >
          <PlusIcon className="w-4 h-4" />
          New Conversation
        </Button>
      </div>
      
      <div className="p-3 border-b">
        <div className="relative">
          <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations"
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        {loadingConversations ? (
          <div className="flex items-center justify-center h-20 text-muted-foreground">
            Loading conversations...
          </div>
        ) : sortedConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center p-4 text-muted-foreground">
            <p className="mb-2">No conversations found</p>
            {searchTerm ? (
              <p className="text-sm">Try a different search term</p>
            ) : (
              <p className="text-sm">Start a new conversation to get started</p>
            )}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {sortedConversations.map((conversation) => (
              <Button
                key={conversation.id}
                variant={currentConversationId === conversation.id ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-2 px-2 py-6 relative",
                  currentConversationId === conversation.id && "text-primary-foreground"
                )}
                onClick={() => setCurrentConversationId(conversation.id)}
              >
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarImage 
                    src={conversation.metadata?.iconUrl || undefined} 
                    alt={getConversationName(conversation)} 
                  />
                  <AvatarFallback className={
                    conversation.type === 'ai_companion' 
                      ? "bg-purple-100 text-purple-700" 
                      : undefined
                  }>
                    {getConversationIcon(conversation)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex flex-col overflow-hidden text-left">
                  <div className="flex items-center">
                    <span className="font-medium truncate">
                      {getConversationName(conversation)}
                    </span>
                    {conversation.type === 'ai_companion' && (
                      <Badge variant="outline" className="ml-2 bg-purple-100 text-purple-800 text-xs py-0">
                        AI
                      </Badge>
                    )}
                  </div>
                  
                  <div className="text-xs text-muted-foreground truncate">
                    {getLastMessagePreview(conversation)}
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatTime(conversation.updatedAt)}
                  </div>
                </div>
                
                {conversation.unreadCount > 0 && (
                  <Badge 
                    className="absolute top-2 right-2 h-5 w-5 p-0 flex items-center justify-center"
                  >
                    {conversation.unreadCount}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
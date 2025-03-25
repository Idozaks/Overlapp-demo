import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Message } from '@/hooks/use-chat';
import { formatDistanceToNow } from 'date-fns';
import { CheckIcon, CheckCheck } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
  isAi: boolean;
  onFeedback?: (messageId: number, feedback: 'helpful' | 'not_helpful', details?: string) => void;
}

export function ChatMessage({ message, isCurrentUser, isAi, onFeedback }: ChatMessageProps) {
  // Format the timestamp
  const formattedTime = formatDistanceToNow(
    new Date(message.createdAt), 
    { addSuffix: true }
  );
  
  // Get sender name
  const senderName = message.sender?.displayName || message.sender?.username || 'Unknown';
  
  // Get avatar URL or initial
  const avatarUrl = message.sender?.avatar || null;
  const avatarInitial = senderName ? senderName[0].toUpperCase() : '?';
  
  // Get message status
  const messageStatus = message.status || 'sent';
  
  return (
    <div className={cn(
      'flex w-full mb-4 gap-2',
      isCurrentUser ? 'flex-row-reverse' : 'flex-row'
    )}>
      <div className="flex-shrink-0">
        <Avatar className={cn(
          'w-8 h-8',
          isAi ? 'border-2 border-purple-500' : ''
        )}>
          <AvatarImage src={avatarUrl || undefined} alt={senderName} />
          <AvatarFallback className={cn(
            isAi ? 'bg-purple-100 text-purple-700' : '',
            isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
          )}>
            {avatarInitial}
          </AvatarFallback>
        </Avatar>
      </div>
      
      <div className={cn(
        'flex flex-col max-w-[75%]',
        isCurrentUser ? 'items-end' : 'items-start'
      )}>
        {/* Message header with sender name and time */}
        <div className={cn(
          'flex items-center gap-2 text-xs text-muted-foreground mb-1',
          isCurrentUser ? 'flex-row-reverse' : 'flex-row'
        )}>
          <span className="font-medium">
            {isCurrentUser ? 'You' : senderName}
          </span>
          <span>{formattedTime}</span>
        </div>
        
        {/* Message content */}
        <div className={cn(
          'rounded-lg px-3 py-2 text-sm',
          isCurrentUser 
            ? 'bg-primary text-primary-foreground rounded-tr-none' 
            : isAi 
              ? 'bg-purple-100 text-purple-900 rounded-tl-none'
              : 'bg-muted rounded-tl-none'
        )}>
          {message.isDeleted ? (
            <span className="italic text-muted-foreground">This message was deleted</span>
          ) : (
            message.contentType === 'text' ? (
              <p>{message.content}</p>
            ) : message.contentType === 'image' ? (
              <div>
                <img 
                  src={message.mediaUrl} 
                  alt="Image" 
                  className="max-w-full rounded-md" 
                />
                {message.content && <p className="mt-2">{message.content}</p>}
              </div>
            ) : (
              <p>{message.content}</p>
            )
          )}
        </div>
        
        {/* Message status (only for current user) */}
        {isCurrentUser && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            {messageStatus === 'sent' && (
              <>
                <CheckIcon className="w-3 h-3" />
                <span>Sent</span>
              </>
            )}
            {messageStatus === 'delivered' && (
              <>
                <CheckCheck className="w-3 h-3" />
                <span>Delivered</span>
              </>
            )}
            {messageStatus === 'read' && (
              <>
                <CheckCheck className="w-3 h-3 text-blue-500" />
                <span className="text-blue-500">Read</span>
              </>
            )}
          </div>
        )}
        
        {/* AI message feedback */}
        {isAi && onFeedback && !message.metadata?.feedback && (
          <div className="flex items-center gap-2 mt-1">
            <button 
              className="text-xs text-muted-foreground hover:text-green-500 transition-colors"
              aria-label="Mark message as helpful"
              onClick={() => onFeedback(message.id, 'helpful')}
            >
              👍 Helpful
            </button>
            <button 
              className="text-xs text-muted-foreground hover:text-red-500 transition-colors"
              aria-label="Mark message as not helpful"
              onClick={() => onFeedback(message.id, 'not_helpful')}
            >
              👎 Not helpful
            </button>
          </div>
        )}
        
        {/* Show feedback if already given */}
        {isAi && message.metadata?.feedback && (
          <div className="text-xs text-muted-foreground mt-1">
            {message.metadata.feedback.type === 'helpful' ? (
              <span className="text-green-500">👍 Marked as helpful</span>
            ) : (
              <span className="text-red-500">👎 Marked as not helpful</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PaperclipIcon, SendIcon, SmileIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (content: string, contentType?: string, mediaUrl?: string) => void;
  onTypingStart: () => void;
  onTypingEnd: () => void;
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export function ChatInput({
  onSendMessage,
  onTypingStart,
  onTypingEnd,
  isLoading = false,
  placeholder = 'Type a message...',
  disabled = false
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Handle typing indicator logic
  useEffect(() => {
    let typingTimeout: NodeJS.Timeout;
    
    if (message && !isTyping) {
      setIsTyping(true);
      onTypingStart();
    }
    
    if (isTyping) {
      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        setIsTyping(false);
        onTypingEnd();
      }, 2000); // 2 seconds of inactivity will trigger typing end
    }
    
    return () => {
      clearTimeout(typingTimeout);
    };
  }, [message, isTyping, onTypingStart, onTypingEnd]);
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);
  
  const handleSendMessage = () => {
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      setIsTyping(false);
      onTypingEnd();
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send message on Enter without Shift
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // File upload handler - will be implemented in future
  const handleFileUpload = () => {
    // This would typically open a file picker and handle the upload
    // For now, just show an alert
    alert('File upload feature coming soon!');
  };
  
  return (
    <div className="flex flex-col p-3 border-t bg-background">
      <div className="flex items-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full flex-shrink-0"
          onClick={handleFileUpload}
          disabled={isLoading || disabled}
        >
          <PaperclipIcon className="h-5 w-5" />
          <span className="sr-only">Attach file</span>
        </Button>
        
        <div className="relative flex-grow">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading || disabled}
            className={cn(
              "resize-none min-h-[40px] max-h-[200px] pr-10 py-3",
              "border rounded-full"
            )}
            rows={1}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute bottom-1 right-1 rounded-full"
            disabled={isLoading || disabled || !message.trim()}
            onClick={handleSendMessage}
          >
            <SendIcon className={cn(
              "h-5 w-5 transition-colors",
              message.trim() ? "text-primary" : "text-muted-foreground"
            )} />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
        
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full flex-shrink-0"
          disabled={isLoading || disabled}
        >
          <SmileIcon className="h-5 w-5" />
          <span className="sr-only">Add emoji</span>
        </Button>
      </div>
      
      {disabled && (
        <div className="text-xs text-muted-foreground text-center mt-2">
          You cannot send messages in this conversation.
        </div>
      )}
    </div>
  );
}
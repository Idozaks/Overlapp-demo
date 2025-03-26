import React, { useState } from 'react';
import { ChatProvider, useChat } from '@/hooks/use-chat';
import { ConversationsList } from '@/components/chat/ConversationsList';
import { ChatConversation } from '@/components/chat/ChatConversation';
import { useAuth } from '@/hooks/use-auth';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeftIcon, PlusIcon, UsersIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

function NewConversationDialog({ 
  open, 
  onOpenChange 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void 
}) {
  const { createConversation, startAIConversation, aiCompanions } = useChat();
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversationType, setConversationType] = useState<'direct' | 'group' | 'ai'>('direct');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [groupName, setGroupName] = useState('');
  const [selectedAiCompanion, setSelectedAiCompanion] = useState<number | null>(null);

  // Handle AI demo conversation creation
  const handleAiDemo = async () => {
    try {
      setConversationType('ai');
      
      // Request to create a demo AI companion if one doesn't exist
      const response = await fetch('/api/ai/companions/demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to create demo AI companion');
      }
      
      const data = await response.json();
      setSelectedAiCompanion(data.companion.id);
      
      toast({
        title: "AI Companion Selected",
        description: `Selected ${data.companion.name}`,
      });
    } catch (error) {
      console.error('Error creating AI demo:', error);
      toast({
        title: "Error",
        description: "Failed to create AI companion. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateConversation = async () => {
    if (conversationType === 'ai' && selectedAiCompanion) {
      await startAIConversation(selectedAiCompanion);
      onOpenChange(false);
      return;
    }

    if (selectedUsers.length === 0) return;

    await createConversation({
      name: conversationType === 'group' ? groupName : undefined,
      userIds: selectedUsers,
      type: conversationType === 'group' ? 'group' : 'direct'
    });
    
    onOpenChange(false);
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>New Conversation</DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label>Conversation Type</Label>
          <Select
            value={conversationType}
            onValueChange={(val) => setConversationType(val as 'direct' | 'group' | 'ai')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select conversation type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="direct">Direct Message</SelectItem>
              <SelectItem value="group">Group Chat</SelectItem>
              <SelectItem value="ai">AI Companion</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {conversationType === 'group' && (
          <div className="space-y-2">
            <Label>Group Name</Label>
            <Input 
              placeholder="Enter group name" 
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>
        )}
        
        {conversationType === 'ai' ? (
          <div className="space-y-2">
            <Label>Select AI Companion</Label>
            <Select
              value={selectedAiCompanion?.toString() || ''}
              onValueChange={(val) => setSelectedAiCompanion(Number(val))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an AI companion" />
              </SelectTrigger>
              <SelectContent>
                {aiCompanions.map((companion) => (
                  <SelectItem key={companion.id} value={companion.id.toString()}>
                    {companion.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="space-y-2">
            <Label>Select Users</Label>
            <div className="border rounded-md p-2 min-h-[100px]">
              <p className="text-center text-muted-foreground text-sm">
                User selection will be implemented with a search functionality
              </p>
              {/* Mock user selection for now */}
              <div className="flex flex-wrap gap-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/users');
                      const data = await response.json();
                      if (data.users && data.users.length > 0) {
                        // Find a user other than the current user
                        const currentUser = user?.id;
                        const otherUsers = data.users.filter((u: any) => u.id !== currentUser);
                        if (otherUsers.length > 0) {
                          const demoUser = otherUsers[0];
                          setSelectedUsers([demoUser.id]);
                          toast({
                            title: "Demo user selected",
                            description: `Selected ${demoUser.displayName || demoUser.username}`,
                          });
                        } else {
                          // If no other users, create AI demo
                          handleAiDemo();
                        }
                      } else {
                        // If no users, create AI demo
                        handleAiDemo();
                      }
                    } catch (error) {
                      console.error("Error fetching users:", error);
                      toast({
                        title: "Error",
                        description: "Failed to fetch users. Using AI companion instead.",
                        variant: "destructive",
                      });
                      handleAiDemo();
                    }
                  }}
                >
                  <UsersIcon className="h-4 w-4 mr-2" />
                  Select Demo User
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={handleCreateConversation}
          disabled={
            (conversationType === 'ai' && !selectedAiCompanion) ||
            (conversationType !== 'ai' && selectedUsers.length === 0) ||
            (conversationType === 'group' && !groupName)
          }
        >
          Create Conversation
        </Button>
      </div>
    </DialogContent>
  );
}

function ChatPage() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { currentConversationId } = useChat();
  const [newConversationOpen, setNewConversationOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(!isMobile);
  
  // If not authenticated, show a message
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Please Sign In</h1>
          <p className="text-muted-foreground">
            You need to be logged in to use the chat feature.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Conversations sidebar */}
      <div className={cn(
        "w-80 flex-shrink-0 transition-all",
        isMobile && !showSidebar && "hidden",
        isMobile && showSidebar && "fixed inset-0 z-50 bg-background w-full sm:w-80"
      )}>
        <ConversationsList
          onNewConversation={() => setNewConversationOpen(true)}
        />
      </div>
      
      {/* Chat area */}
      <div className={cn(
        "flex-1 relative",
        isMobile && showSidebar && "hidden"
      )}>
        {currentConversationId ? (
          <>
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 left-3 z-10"
                onClick={() => setShowSidebar(true)}
              >
                <ArrowLeftIcon className="h-4 w-4" />
              </Button>
            )}
            <ChatConversation 
              conversationId={currentConversationId} 
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <h2 className="text-2xl font-bold mb-4">Welcome to Overlapp Chat</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Select an existing conversation from the sidebar or start a new one to begin chatting.
            </p>
            <Button onClick={() => setNewConversationOpen(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Start a New Conversation
            </Button>
          </div>
        )}
      </div>
      
      {/* New conversation dialog */}
      <Dialog open={newConversationOpen} onOpenChange={setNewConversationOpen}>
        <NewConversationDialog 
          open={newConversationOpen} 
          onOpenChange={setNewConversationOpen} 
        />
      </Dialog>
    </div>
  );
}

export default function ChatPageWithProvider() {
  return (
    <ChatProvider>
      <ChatPage />
    </ChatProvider>
  );
}
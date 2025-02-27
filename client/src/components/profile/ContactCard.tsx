import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, QrCode, Link as LinkIcon } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ContactCardWithLinks } from "@shared/schema";

interface ContactCardProps {
  userId: number;
}

export default function ContactCard({ userId }: ContactCardProps) {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [newLink, setNewLink] = useState({ platform: "", url: "" });

  const { data: cardData, isLoading } = useQuery<{ card: ContactCardWithLinks }>({
    queryKey: [`/api/users/${userId}/contact-card`],
    retry: false
  });

  const createCardMutation = useMutation({
    mutationFn: async (data: { customMessage: string; jobTitle: string }) => {
      const response = await apiRequest("POST", "/api/contact-cards", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/contact-card`] });
      setIsCreating(false);
      toast({
        title: "Success",
        description: "Contact card created successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create contact card",
        variant: "destructive"
      });
    }
  });

  const addLinkMutation = useMutation({
    mutationFn: async ({ cardId, platform, url }: { cardId: number; platform: string; url: string }) => {
      const response = await apiRequest("POST", `/api/contact-cards/${cardId}/links`, { platform, url });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/contact-card`] });
      setNewLink({ platform: "", url: "" });
      toast({
        title: "Success",
        description: "Link added successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add link",
        variant: "destructive"
      });
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!cardData?.card && !isCreating) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">No contact card found</p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Contact Card
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isCreating) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Create Contact Card</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            createCardMutation.mutate({
              customMessage: formData.get("customMessage") as string,
              jobTitle: formData.get("jobTitle") as string
            });
          }}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input id="jobTitle" name="jobTitle" required />
              </div>
              <div>
                <Label htmlFor="customMessage">Custom Message</Label>
                <Input id="customMessage" name="customMessage" required />
              </div>
              <Button type="submit" disabled={createCardMutation.isPending}>
                {createCardMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Create Card
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Card</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Job Title</h3>
            <p>{cardData.card.jobTitle}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Custom Message</h3>
            <p>{cardData.card.customMessage}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">QR Code</h3>
            <div className="flex items-center gap-2">
              <QrCode className="w-8 h-8" />
              <code className="text-sm">{cardData.card.qrCode}</code>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Links</h3>
            <div className="space-y-4">
              {cardData.card.links?.map((link) => (
                <div key={link.id} className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  <span className="font-medium">{link.platform}:</span>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {link.url}
                  </a>
                </div>
              ))}

              <form onSubmit={(e) => {
                e.preventDefault();
                if (!cardData.card.id) return;
                addLinkMutation.mutate({
                  cardId: cardData.card.id,
                  platform: newLink.platform,
                  url: newLink.url
                });
              }}>
                <div className="flex gap-2">
                  <Input
                    placeholder="Platform (e.g. LinkedIn)"
                    value={newLink.platform}
                    onChange={(e) => setNewLink(prev => ({ ...prev, platform: e.target.value }))}
                  />
                  <Input
                    placeholder="URL"
                    value={newLink.url}
                    onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                  />
                  <Button type="submit" disabled={addLinkMutation.isPending || !newLink.platform || !newLink.url}>
                    Add Link
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

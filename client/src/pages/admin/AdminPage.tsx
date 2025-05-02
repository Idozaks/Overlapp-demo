import React, { useState, useEffect } from 'react';
import { useLocation, useRouter } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCcw, Search, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Define synthetic user types
interface SyntheticUser {
  id: number;
  username: string;
  displayName: string;
  location: string;
  interests: string[];
  overlapCount: number;
}

// Generate mock synthetic users
const generateSyntheticUsers = (count = 20): SyntheticUser[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    username: `user${i + 1}`,
    displayName: `Synthetic User ${i + 1}`,
    location: ['Tel Aviv', 'Jerusalem', 'Haifa', 'Eilat', 'Beer Sheva'][Math.floor(Math.random() * 5)],
    interests: Array.from(
      { length: Math.floor(Math.random() * 5) + 1 },
      () => ['Technology', 'Art', 'Music', 'Sports', 'Food', 'Travel', 'Reading', 'Gaming'][Math.floor(Math.random() * 8)]
    ),
    overlapCount: Math.floor(Math.random() * 15)
  }));
};

export default function AdminPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [users, setUsers] = useState<SyntheticUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Check for debug mode in URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const debug = params.get('debug');
    setIsDebugMode(debug === 'true');
    
    if (debug !== 'true') {
      toast({
        title: "Access Denied",
        description: "Admin section requires debug mode",
        variant: "destructive"
      });
      setLocation('/');
    } else {
      // Generate initial user data
      setUsers(generateSyntheticUsers());
    }
  }, [setLocation, toast]);

  // Filtered users based on search term
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.interests.some(interest => interest.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle regenerate synthetic dataset
  const handleRegenerateUsers = () => {
    setIsGenerating(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setUsers(generateSyntheticUsers(Math.floor(Math.random() * 10) + 15));
      setIsGenerating(false);
      
      toast({
        title: "Dataset Regenerated",
        description: "New synthetic users have been created",
      });
    }, 1500);
  };

  if (!isDebugMode) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
              <CardDescription>
                Manage synthetic users and debug features
              </CardDescription>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="debug-mode" 
                checked={isDebugMode}
                onCheckedChange={setIsDebugMode}
              />
              <Label htmlFor="debug-mode">Debug Mode</Label>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Button 
              variant="default" 
              onClick={handleRegenerateUsers}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Regenerate Dataset
                </>
              )}
            </Button>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableCaption>
                Synthetic users for testing and development
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Interests</TableHead>
                  <TableHead className="text-right">Overlap Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.displayName}</div>
                        <div className="text-sm text-muted-foreground">@{user.username}</div>
                      </div>
                    </TableCell>
                    <TableCell>{user.location}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.interests.map((interest, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge 
                        variant={user.overlapCount > 10 ? "default" : user.overlapCount > 5 ? "secondary" : "outline"}
                        className="text-xs"
                      >
                        {user.overlapCount}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                      No users found matching the search criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
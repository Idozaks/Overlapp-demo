import React from 'react';
import { useDemo, InteractionType } from '@/hooks/use-demo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, UserPlus, RefreshCw, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SyntheticActivityFeedProps {
  maxItems?: number;
  className?: string;
}

// Helper function to format time
const formatTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}m ago`;
  } else {
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  }
};

// Helper to get user data by ID (would be expanded with real data in production)
const getUserById = (userId: number) => {
  return {
    id: userId,
    name: `User ${userId}`,
    avatar: `/avatar-placeholder-${(userId % 5) + 1}.jpg`
  };
};

// Component to render a single activity
const ActivityItem: React.FC<{ activity: InteractionType }> = ({ activity }) => {
  const sourceUser = getUserById(activity.sourceUserId);
  const targetUser = getUserById(activity.targetUserId);
  
  // Determine activity icon and color
  const getActivityDetails = () => {
    switch (activity.type) {
      case 'follow':
        return {
          icon: <UserPlus className="w-4 h-4" />,
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
          text: `${sourceUser.name} followed ${targetUser.name}`
        };
      case 'like':
        return {
          icon: <Heart className="w-4 h-4" />,
          color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
          text: `${sourceUser.name} liked ${targetUser.name}'s post`
        };
      case 'comment':
        return {
          icon: <MessageCircle className="w-4 h-4" />,
          color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
          text: `${sourceUser.name} commented on ${targetUser.name}'s post`
        };
      case 'overlap_detected':
        return {
          icon: <RefreshCw className="w-4 h-4" />,
          color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
          text: `Overlap detected between ${sourceUser.name} and ${targetUser.name}`
        };
      case 'message':
        return {
          icon: <MessageSquare className="w-4 h-4" />,
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
          text: `${sourceUser.name} sent a message to ${targetUser.name}`
        };
      default:
        return {
          icon: <RefreshCw className="w-4 h-4" />,
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
          text: `Activity between ${sourceUser.name} and ${targetUser.name}`
        };
    }
  };
  
  const { icon, color, text } = getActivityDetails();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      className="mb-2"
    >
      <div className="flex items-start p-3 bg-card border rounded-lg shadow-sm">
        <Badge variant="outline" className={`${color} mr-3 flex items-center`}>
          {icon}
        </Badge>
        <div className="flex-1">
          <p className="text-sm">{text}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatTime(activity.timestamp)}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export const SyntheticActivityFeed: React.FC<SyntheticActivityFeedProps> = ({
  maxItems = 5,
  className = ''
}) => {
  const { recentActivities, isDemoMode } = useDemo();
  
  // Only show activities in demo mode and if there are any
  if (!isDemoMode || recentActivities.length === 0) {
    return null;
  }
  
  return (
    <Card className={`shadow-md ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <RefreshCw className="w-5 h-5 mr-2 text-primary" />
          Live Activity Feed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatePresence>
          {recentActivities.slice(0, maxItems).map((activity, index) => (
            <ActivityItem
              key={`${activity.type}-${activity.sourceUserId}-${activity.targetUserId}-${index}`}
              activity={activity}
            />
          ))}
        </AnimatePresence>
        
        {recentActivities.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-4">
            No recent activities to display
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default SyntheticActivityFeed;
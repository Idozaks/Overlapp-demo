import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Globe, Calendar } from 'lucide-react';

interface EntityContent {
  id: number;
  entityId: number;
  contentType: string;
  content: string;
  createdAt: string;
}

interface Entity {
  id: number;
  name: string;
  category: string;
  description: string;
  type: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  content?: EntityContent[];
}

interface EntityCardProps {
  entity: Entity;
  onClick: () => void;
}

export default function EntityCard({ entity, onClick }: EntityCardProps) {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Truncate description
  const truncateDescription = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col"
      onClick={onClick}
    >
      <div className="bg-muted h-40 flex items-center justify-center">
        {entity.type === 'physical' ? (
          <MapPin className="h-10 w-10 text-muted-foreground opacity-50" />
        ) : (
          <Globe className="h-10 w-10 text-muted-foreground opacity-50" />
        )}
      </div>
      
      <CardContent className="p-4 flex-grow">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-semibold text-lg truncate mr-2">{entity.name}</h3>
          {entity.type === 'physical' ? (
            <MapPin size={16} className="text-muted-foreground flex-shrink-0" />
          ) : (
            <Globe size={16} className="text-muted-foreground flex-shrink-0" />
          )}
        </div>
        
        <div className="mb-3">
          <Badge variant="secondary" className="mb-2">
            {entity.category}
          </Badge>
        </div>
        
        <p className="text-muted-foreground text-sm mb-2">
          {truncateDescription(entity.description)}
        </p>
      </CardContent>
      
      <CardFooter className="px-4 py-2 border-t bg-muted/30 flex justify-between items-center">
        <div className="flex items-center text-xs text-muted-foreground">
          <Calendar size={12} className="mr-1" />
          <span>{formatDate(entity.createdAt)}</span>
        </div>
        
        {entity.content && (
          <Badge variant="outline" className="text-xs">
            {entity.content.length} content items
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
}
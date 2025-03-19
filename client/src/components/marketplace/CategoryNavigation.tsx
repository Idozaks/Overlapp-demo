import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tag, Layers, Globe, MapPin, Store } from 'lucide-react';

interface CategoryNavigationProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const getCategoryIcon = (category: string) => {
  const categoryLower = category.toLowerCase();
  
  if (categoryLower.includes('retail') || categoryLower.includes('store')) {
    return <Store size={16} />;
  } else if (categoryLower.includes('digital') || categoryLower.includes('online')) {
    return <Globe size={16} />;
  } else if (categoryLower.includes('location') || categoryLower.includes('place')) {
    return <MapPin size={16} />;
  }
  
  return <Tag size={16} />;
};

export default function CategoryNavigation({ 
  categories, 
  selectedCategory, 
  onSelectCategory 
}: CategoryNavigationProps) {
  return (
    <div className="space-y-1">
      <Button
        variant={selectedCategory === 'all' ? 'default' : 'ghost'}
        className={cn(
          'w-full justify-start',
          selectedCategory === 'all' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
        )}
        onClick={() => onSelectCategory('all')}
      >
        <Layers className="mr-2 h-4 w-4" />
        All Categories
      </Button>
      
      {categories.map((category) => (
        <Button
          key={category}
          variant={selectedCategory === category ? 'default' : 'ghost'}
          className={cn(
            'w-full justify-start',
            selectedCategory === category ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
          )}
          onClick={() => onSelectCategory(category)}
        >
          {getCategoryIcon(category)}
          <span className="ml-2 truncate">{category}</span>
        </Button>
      ))}
      
      {categories.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-2">
          No categories available
        </p>
      )}
    </div>
  );
}
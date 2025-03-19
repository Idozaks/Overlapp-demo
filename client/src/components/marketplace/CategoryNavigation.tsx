import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CategoryNavigationProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function CategoryNavigation({ 
  categories, 
  selectedCategory, 
  onSelectCategory 
}: CategoryNavigationProps) {
  return (
    <ScrollArea className="h-[300px] pr-3">
      <div className="space-y-1">
        <Button
          variant={selectedCategory === 'all' ? 'secondary' : 'ghost'}
          className="w-full justify-start font-normal"
          onClick={() => onSelectCategory('all')}
        >
          All Categories
        </Button>

        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'secondary' : 'ghost'}
            className="w-full justify-start font-normal"
            onClick={() => onSelectCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
}
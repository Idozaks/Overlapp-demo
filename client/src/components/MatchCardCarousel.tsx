import React, { useEffect, useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards } from 'swiper/modules';
import MatchCard, { MatchProfile } from './MatchCard/MatchCard';
import useCelebration from '@/hooks/useCelebration';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-cards';

interface MatchCardCarouselProps {
  matches: MatchProfile[];
  onMatchSelected?: (match: MatchProfile) => void;
}

const MatchCardCarousel: React.FC<MatchCardCarouselProps> = ({ 
  matches,
  onMatchSelected
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const { triggerFromElement } = useCelebration();
  
  // Show confetti when viewing the best match (the first one in the list)
  useEffect(() => {
    if (activeIndex === 0 && carouselRef.current) {
      const timer = setTimeout(() => {
        triggerFromElement(carouselRef.current!, {
          particleCount: 80,
          spread: 70
        });
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [activeIndex, triggerFromElement]);
  
  const handleSlideChange = (swiper: any) => {
    setActiveIndex(swiper.activeIndex);
    if (onMatchSelected && matches[swiper.activeIndex]) {
      onMatchSelected(matches[swiper.activeIndex]);
    }
  };

  if (!matches.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No matches found
      </div>
    );
  }

  return (
    <div ref={carouselRef} className="w-full max-w-[320px] mx-auto h-[550px]">
      <Swiper
        effect="cards"
        grabCursor={true}
        modules={[EffectCards]}
        onSlideChange={handleSlideChange}
        className="h-full w-full"
        cardsEffect={{
          perSlideOffset: 8,
          perSlideRotate: 2,
          slideShadows: false
        }}
      >
        {matches.map((match) => (
          <SwiperSlide key={match.id} className="h-full rounded-lg overflow-hidden">
            <MatchCard profile={match} isActive={true} />
          </SwiperSlide>
        ))}
      </Swiper>
      
      {/* Pagination indicator */}
      <div className="flex justify-center mt-4 gap-1">
        {matches.map((_, index) => (
          <div 
            key={index}
            className={`h-2 rounded-full transition-all ${
              index === activeIndex 
                ? 'w-6 bg-gradient-to-r from-[#4D7FE8] to-[#40E0D0]' 
                : 'w-2 bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default MatchCardCarousel;
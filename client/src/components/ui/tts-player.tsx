import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

interface TTSPlayerProps {
  text: string;
  label?: string;
  voices?: string[];
  className?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export function TTSPlayer({
  text,
  label = "Text to Speech",
  voices = [],
  className,
  onPlay,
  onPause,
  onComplete,
  onError
}: TTSPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Effect to generate speech when text changes
  useEffect(() => {
    if (!text) return;
    
    const generateSpeech = async () => {
      setIsLoading(true);
      try {
        // Make API call to generate speech
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            text,
            voice: selectedVoice || undefined
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to generate speech');
        }
        
        const data = await response.json();
        setAudioUrl(data.audioUrl);
        
        // Create audio element
        if (audioRef.current) {
          audioRef.current.src = data.audioUrl;
          audioRef.current.load();
        } else {
          const audio = new Audio(data.audioUrl);
          audioRef.current = audio;
          
          // Set up event listeners
          audio.addEventListener('timeupdate', updateProgress);
          audio.addEventListener('loadedmetadata', () => {
            setDuration(audio.duration);
            setIsLoading(false);
          });
          audio.addEventListener('ended', handleEnd);
          audio.addEventListener('error', handleError);
        }
      } catch (error) {
        setIsLoading(false);
        if (onError) onError(error instanceof Error ? error : new Error(String(error)));
        console.error('Error generating speech:', error);
      }
    };
    
    generateSpeech();
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('timeupdate', updateProgress);
        audioRef.current.removeEventListener('ended', handleEnd);
        audioRef.current.removeEventListener('error', handleError);
      }
    };
  }, [text, selectedVoice]);
  
  // Update progress bar
  const updateProgress = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };
  
  // Handle end of audio
  const handleEnd = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (onComplete) onComplete();
  };
  
  // Handle audio error
  const handleError = (e: Event) => {
    setIsPlaying(false);
    setIsLoading(false);
    console.error('Audio playback error:', e);
    if (onError) onError(new Error('Audio playback error'));
  };
  
  // Toggle play/pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (onPause) onPause();
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          if (onPlay) onPlay();
        })
        .catch(error => {
          console.error('Error playing audio:', error);
          if (onError) onError(error);
        });
    }
  };
  
  // Seek to position
  const seek = (value: number[]) => {
    if (!audioRef.current) return;
    
    const newTime = value[0];
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  // Toggle mute
  const toggleMute = () => {
    if (!audioRef.current) return;
    
    const newMuteState = !isMuted;
    audioRef.current.muted = newMuteState;
    setIsMuted(newMuteState);
  };
  
  // Set volume
  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return;
    
    const newVolume = value[0];
    audioRef.current.volume = newVolume / 100;
    setVolume(newVolume);
    
    if (newVolume === 0) {
      setIsMuted(true);
      audioRef.current.muted = true;
    } else if (isMuted) {
      setIsMuted(false);
      audioRef.current.muted = false;
    }
  };
  
  // Format time as mm:ss
  const formatTime = (time: number): string => {
    if (isNaN(time)) return '00:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Skip forward 10 seconds
  const skipForward = () => {
    if (!audioRef.current) return;
    
    const newTime = Math.min(audioRef.current.duration, audioRef.current.currentTime + 10);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  // Skip backward 10 seconds
  const skipBackward = () => {
    if (!audioRef.current) return;
    
    const newTime = Math.max(0, audioRef.current.currentTime - 10);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  return (
    <div className={cn("rounded-lg border bg-card p-4 text-card-foreground shadow-sm", className)}>
      <div className="mb-3">
        <h3 className="text-sm font-medium mb-1">{label}</h3>
        <p className="text-xs text-muted-foreground truncate">{text.substring(0, 100)}...</p>
      </div>
      
      <div className="space-y-4">
        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-12 text-right">{formatTime(currentTime)}</span>
          <Slider 
            value={[currentTime]} 
            max={duration || 100}
            step={0.1}
            onValueChange={seek}
            disabled={!audioUrl || isLoading}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground w-12">{formatTime(duration)}</span>
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              disabled={!audioUrl || isLoading}
              onClick={skipBackward}
              className="h-8 w-8 p-0"
            >
              <SkipBack className="h-4 w-4" />
              <span className="sr-only">Skip backward</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              disabled={!audioUrl || isLoading}
              onClick={togglePlay}
              className="h-8 w-8 p-0"
            >
              {isLoading ? (
                <span className="h-4 w-4 animate-pulse">...</span>
              ) : isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              <span className="sr-only">{isPlaying ? 'Pause' : 'Play'}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              disabled={!audioUrl || isLoading}
              onClick={skipForward}
              className="h-8 w-8 p-0"
            >
              <SkipForward className="h-4 w-4" />
              <span className="sr-only">Skip forward</span>
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={!audioUrl || isLoading}
              onClick={toggleMute}
              className="h-8 w-8 p-0"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
              <span className="sr-only">{isMuted ? 'Unmute' : 'Mute'}</span>
            </Button>
            
            <Slider
              value={[volume]}
              min={0}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              disabled={!audioUrl || isLoading}
              className="w-20"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
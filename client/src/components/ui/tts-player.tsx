import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Headphones, FastForward, Rewind } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

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

// Voice options with display names
const VOICE_OPTIONS = [
  { id: "nova", name: "Nova", description: "Warm female voice" },
  { id: "alloy", name: "Alloy", description: "Neutral voice" },
  { id: "echo", name: "Echo", description: "Male voice" },
  { id: "fable", name: "Fable", description: "British female voice" },
  { id: "onyx", name: "Onyx", description: "Deep male voice" },
  { id: "shimmer", name: "Shimmer", description: "Expressive female voice" },
];

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
  const [selectedVoice, setSelectedVoice] = useState<string>("nova");
  const [expanded, setExpanded] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  
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
            voice: selectedVoice || "nova"
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
  
  // Update playback rate when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);
  
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
  
  // Change voice
  const handleVoiceChange = (voice: string) => {
    setSelectedVoice(voice);
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
  
  // Set playback rate
  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };
  
  // Calculate progress percentage
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  return (
    <div className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm transition-all", 
      expanded ? "p-5" : "p-3",
      className
    )}>
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Headphones className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-medium">{label}</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="text-xs"
        >
          {expanded ? "Simple View" : "Advanced View"}
        </Button>
      </div>
      
      {/* Waveform-style Progress */}
      <div className="mb-4 relative h-12 bg-muted/30 rounded-md overflow-hidden">
        <div 
          className="absolute left-0 top-0 h-full bg-primary/15 transition-all"
          style={{ width: `${progressPercentage}%` }}
        />
        
        {/* Generate a fake waveform pattern */}
        <div className="absolute inset-0 flex items-center justify-between px-2">
          {Array.from({ length: 40 }).map((_, i) => {
            // Random height for each bar in the waveform
            const height = 25 + Math.random() * 50;
            const isCurrent = (i / 40) * 100 < progressPercentage;
            
            return (
              <div 
                key={i}
                className={`w-1 rounded-full transition-all ${
                  isPlaying ? "animate-pulse" : ""
                } ${
                  isCurrent ? "bg-primary" : "bg-muted"
                }`}
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>
        
        {/* Current position marker */}
        <div 
          className="absolute top-0 h-full w-0.5 bg-primary-foreground transition-all"
          style={{ left: `${progressPercentage}%` }}
        />
      </div>
      
      <div className="space-y-4">
        {/* Time display and progress */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>-{formatTime(duration - currentTime)}</span>
        </div>
        
        {/* Slider for precise seeking */}
        <Slider
          value={[currentTime]} 
          max={duration || 100}
          step={0.1}
          onValueChange={seek}
          disabled={!audioUrl || isLoading}
        />
        
        {/* Main Controls */}
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
              variant={isPlaying ? "secondary" : "default"}
              size="sm"
              disabled={!audioUrl || isLoading}
              onClick={togglePlay}
              className="h-10 w-10 rounded-full p-0"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-primary" />
              ) : isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
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
      
      {/* Expanded view with voice selection and playback speed */}
      {expanded && (
        <div className="mt-6 pt-4 border-t space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Voice selector */}
            <div>
              <label className="text-xs font-medium mb-2 block">Voice</label>
              <Select
                value={selectedVoice}
                onValueChange={handleVoiceChange}
                disabled={isLoading || isPlaying}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  {VOICE_OPTIONS.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id} className="flex justify-between">
                      <div className="flex flex-col">
                        <span>{voice.name}</span>
                        <span className="text-xs text-muted-foreground">{voice.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Playback speed */}
            <div>
              <label className="text-xs font-medium mb-2 block">Playback Speed</label>
              <div className="flex gap-1">
                {[0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                  <Button
                    key={rate}
                    variant={playbackRate === rate ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => changePlaybackRate(rate)}
                    disabled={!audioUrl || isLoading}
                    className="flex-1 text-xs"
                  >
                    {rate}x
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Current voice display */}
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="bg-primary/5">
              {VOICE_OPTIONS.find(v => v.id === selectedVoice)?.name || "Nova"}
            </Badge>
            {playbackRate !== 1.0 && (
              <Badge variant="outline" className="bg-secondary/5">
                {playbackRate}x Speed
              </Badge>
            )}
          </div>
          
          {/* Text preview */}
          <div className="mt-2">
            <p className="text-xs text-muted-foreground line-clamp-2 italic">
              "{text.substring(0, 150)}..."
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
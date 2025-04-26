import { useState, useEffect, useRef } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  Loader2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { generateSpeech, TTSPlayerState } from "@/lib/tts-service";
import { cn } from "@/lib/utils";

interface TTSPlayerProps {
  text: string;
  className?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onError?: (error: Error) => void;
}

export function TTSPlayer({ text, className, onPlay, onPause, onError }: TTSPlayerProps) {
  const [playerState, setPlayerState] = useState<TTSPlayerState>({
    isPlaying: false,
    progress: 0,
    duration: 0,
    currentAudioUrl: null,
    text
  });
  const [volume, setVolume] = useState(80);
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize audio if not present
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume / 100;
    }
  }, []);
  
  // Update when text changes
  useEffect(() => {
    if (text !== playerState.text) {
      setPlayerState(prev => ({ ...prev, text }));
      handleStop();
    }
  }, [text]);
  
  // Set up audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setPlayerState(prev => ({ ...prev, isPlaying: false, progress: 0 }));
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };

    const handleLoadedMetadata = () => {
      if (audio) {
        setPlayerState(prev => ({ ...prev, duration: audio.duration }));
      }
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Handle play/pause
  const togglePlayback = async () => {
    try {
      if (!playerState.currentAudioUrl) {
        await handlePlay();
      } else if (playerState.isPlaying) {
        handlePause();
      } else {
        if (audioRef.current) {
          audioRef.current.play();
          setPlayerState(prev => ({ ...prev, isPlaying: true }));
          startProgressTracking();
          onPlay?.();
        }
      }
    } catch (error) {
      console.error("Playback error:", error);
      onError?.(error as Error);
    }
  };

  // Start playing with TTS
  const handlePlay = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      const audioUrl = await generateSpeech(text);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.volume = volume / 100;
        await audioRef.current.play();
        
        setPlayerState(prev => ({
          ...prev,
          isPlaying: true,
          currentAudioUrl: audioUrl,
        }));
        
        startProgressTracking();
        onPlay?.();
      }
    } catch (error) {
      console.error("Failed to generate or play speech:", error);
      onError?.(error as Error);
    } finally {
      setLoading(false);
    }
  };

  // Pause audio
  const handlePause = () => {
    if (audioRef.current && playerState.isPlaying) {
      audioRef.current.pause();
      setPlayerState(prev => ({ ...prev, isPlaying: false }));
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      onPause?.();
    }
  };

  // Stop audio completely
  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlayerState(prev => ({ 
        ...prev, 
        isPlaying: false, 
        progress: 0 
      }));
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      onPause?.();
    }
  };

  // Skip forward 10 seconds
  const handleSkipForward = () => {
    if (audioRef.current) {
      const newTime = Math.min(audioRef.current.currentTime + 10, audioRef.current.duration);
      audioRef.current.currentTime = newTime;
      setPlayerState(prev => ({ ...prev, progress: newTime }));
    }
  };

  // Skip backward 10 seconds
  const handleSkipBackward = () => {
    if (audioRef.current) {
      const newTime = Math.max(audioRef.current.currentTime - 10, 0);
      audioRef.current.currentTime = newTime;
      setPlayerState(prev => ({ ...prev, progress: newTime }));
    }
  };

  // Update progress state
  const startProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    progressIntervalRef.current = setInterval(() => {
      if (audioRef.current) {
        setPlayerState(prev => ({ 
          ...prev, 
          progress: audioRef.current?.currentTime || 0 
        }));
      }
    }, 100);
  };

  // Handle slider change
  const handleProgressChange = (value: number[]) => {
    if (audioRef.current && playerState.duration > 0) {
      const newPosition = value[0];
      audioRef.current.currentTime = (newPosition / 100) * playerState.duration;
      setPlayerState(prev => ({ ...prev, progress: audioRef.current?.currentTime || 0 }));
    }
  };

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
    
    if (newVolume === 0) {
      setMuted(true);
    } else if (muted) {
      setMuted(false);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (audioRef.current) {
      if (muted) {
        audioRef.current.volume = volume / 100;
      } else {
        audioRef.current.volume = 0;
      }
      setMuted(!muted);
    }
  };

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Calculate progress percentage
  const progressPercentage = playerState.duration 
    ? (playerState.progress / playerState.duration) * 100 
    : 0;

  return (
    <Card className={cn("w-full overflow-hidden", className)}>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          {/* Timeline */}
          <div className="space-y-2">
            <Slider
              value={[progressPercentage]}
              min={0}
              max={100}
              step={0.1}
              onValueChange={handleProgressChange}
              disabled={!playerState.currentAudioUrl || loading}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(playerState.progress)}</span>
              <span>{formatTime(playerState.duration || 0)}</span>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleSkipBackward}
                disabled={!playerState.currentAudioUrl || loading}
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="default" 
                size="icon" 
                onClick={togglePlayback}
                disabled={loading}
                className="h-10 w-10 rounded-full"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : playerState.isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleSkipForward}
                disabled={!playerState.currentAudioUrl || loading}
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Volume control */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
              >
                {muted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              
              <Slider
                value={[muted ? 0 : volume]}
                min={0}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
                className="w-24"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
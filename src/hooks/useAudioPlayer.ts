import { useState, useRef, useCallback, useEffect } from 'react';
import { PlayerState } from '@/types/audiobook';

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    playbackSpeed: 1,
    isMuted: false,
    sleepTimer: null,
  });

  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Setup audio element event listeners
  const setupAudioListeners = useCallback((audio: HTMLAudioElement) => {
    audio.ontimeupdate = () => {
      setPlayerState(prev => ({ ...prev, currentTime: audio.currentTime }));
    };

    audio.onloadedmetadata = () => {
      setPlayerState(prev => ({ 
        ...prev, 
        duration: audio.duration,
        currentTime: audio.currentTime 
      }));
    };

    audio.onended = () => {
      setPlayerState(prev => ({ ...prev, isPlaying: false }));
    };

    audio.onplay = () => {
      setPlayerState(prev => ({ ...prev, isPlaying: true }));
    };

    audio.onpause = () => {
      setPlayerState(prev => ({ ...prev, isPlaying: false }));
    };

    audio.onerror = (e) => {
      console.error('Audio error:', e);
      setPlayerState(prev => ({ ...prev, isPlaying: false }));
    };
  }, []);

  // Initialize audio element
  const initAudio = useCallback((audioElement: HTMLAudioElement) => {
    audioRef.current = audioElement;
    setupAudioListeners(audioElement);
  }, [setupAudioListeners]);

  const loadAudio = useCallback((url: string, startTime: number = 0) => {
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.currentTime = startTime;
      audioRef.current.playbackRate = playerState.playbackSpeed;
      audioRef.current.load();
    }
  }, [playerState.playbackSpeed]);

  const play = useCallback(async () => {
    if (audioRef.current) {
      try {
        await audioRef.current.play();
      } catch (error) {
        console.error('Failed to play:', error);
      }
    }
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const togglePlay = useCallback(async () => {
    if (playerState.isPlaying) {
      pause();
    } else {
      await play();
    }
  }, [playerState.isPlaying, play, pause]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setPlayerState(prev => ({ ...prev, currentTime: time }));
    }
  }, []);

  const skipForward = useCallback((seconds: number = 15) => {
    if (audioRef.current) {
      const newTime = Math.min(audioRef.current.currentTime + seconds, audioRef.current.duration || 0);
      audioRef.current.currentTime = newTime;
    }
  }, []);

  const skipBackward = useCallback((seconds: number = 15) => {
    if (audioRef.current) {
      const newTime = Math.max(audioRef.current.currentTime - seconds, 0);
      audioRef.current.currentTime = newTime;
    }
  }, []);

  const setPlaybackSpeed = useCallback((speed: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
    setPlayerState(prev => ({ ...prev, playbackSpeed: speed }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    setPlayerState(prev => ({ ...prev, volume, isMuted: volume === 0 }));
  }, []);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
    }
    setPlayerState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  }, []);

  const setSleepTimer = useCallback((minutes: number | null) => {
    if (sleepTimerRef.current) {
      clearInterval(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }

    if (minutes !== null) {
      setPlayerState(prev => ({ ...prev, sleepTimer: minutes }));
      
      sleepTimerRef.current = setInterval(() => {
        setPlayerState(prev => {
          if (prev.sleepTimer === null || prev.sleepTimer <= 0) {
            if (sleepTimerRef.current) {
              clearInterval(sleepTimerRef.current);
              sleepTimerRef.current = null;
            }
            pause();
            return { ...prev, sleepTimer: null };
          }
          return { ...prev, sleepTimer: prev.sleepTimer - 1 };
        });
      }, 60000);
    } else {
      setPlayerState(prev => ({ ...prev, sleepTimer: null }));
    }
  }, [pause]);

  const getCurrentTime = useCallback(() => {
    return audioRef.current?.currentTime || 0;
  }, []);

  useEffect(() => {
    return () => {
      if (sleepTimerRef.current) {
        clearInterval(sleepTimerRef.current);
      }
    };
  }, []);

  return {
    audioRef,
    playerState,
    setPlayerState,
    initAudio,
    loadAudio,
    play,
    pause,
    togglePlay,
    seek,
    skipForward,
    skipBackward,
    setPlaybackSpeed,
    setVolume,
    toggleMute,
    setSleepTimer,
    getCurrentTime,
  };
}

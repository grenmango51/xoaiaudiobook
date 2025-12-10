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

  const play = useCallback(() => {
    audioRef.current?.play();
    setPlayerState(prev => ({ ...prev, isPlaying: true }));
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setPlayerState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const togglePlay = useCallback(() => {
    if (playerState.isPlaying) {
      pause();
    } else {
      play();
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
      const newTime = Math.min(audioRef.current.currentTime + seconds, audioRef.current.duration);
      audioRef.current.currentTime = newTime;
      setPlayerState(prev => ({ ...prev, currentTime: newTime }));
    }
  }, []);

  const skipBackward = useCallback((seconds: number = 15) => {
    if (audioRef.current) {
      const newTime = Math.max(audioRef.current.currentTime - seconds, 0);
      audioRef.current.currentTime = newTime;
      setPlayerState(prev => ({ ...prev, currentTime: newTime }));
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
      }, 60000); // Update every minute
    } else {
      setPlayerState(prev => ({ ...prev, sleepTimer: null }));
    }
  }, [pause]);

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
  };
}

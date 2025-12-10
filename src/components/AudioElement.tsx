import { useEffect, useRef } from 'react';

interface AudioElementProps {
  onInit: (audio: HTMLAudioElement) => void;
}

export function AudioElement({ onInit }: AudioElementProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      onInit(audioRef.current);
    }
  }, [onInit]);

  return (
    <audio
      ref={audioRef}
      preload="metadata"
      className="hidden"
    />
  );
}

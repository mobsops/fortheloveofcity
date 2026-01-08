import { useState, useEffect, useRef, useCallback } from 'react';

export const useAudio = () => {
  const [isMuted, setIsMuted] = useState(() => {
    const stored = localStorage.getItem('audio_muted');
    return stored === 'true';
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element with a dark ambient doomsday track
    const audio = new Audio('https://cdn.pixabay.com/audio/2022/10/25/audio_ab11038099.mp3');
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
      localStorage.setItem('audio_muted', String(isMuted));
    }
  }, [isMuted]);

  const play = useCallback(() => {
    if (audioRef.current && !isPlaying) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.log('Audio play failed:', err);
      });
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  return {
    isMuted,
    isPlaying,
    play,
    toggleMute
  };
};

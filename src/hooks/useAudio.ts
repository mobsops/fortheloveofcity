import { useState, useRef, useCallback, useEffect } from 'react';

export const useAudio = () => {
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('audio_muted') === 'true';
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync mute state with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
    localStorage.setItem('audio_muted', String(isMuted));
  }, [isMuted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const play = useCallback(() => {
    if (isPlaying || audioRef.current) return;

    try {
      // Create audio element with the MP3 file
      const audio = new Audio('/audio/ambient-music.mp3');
      audio.loop = true;
      audio.volume = 0.5;
      audio.muted = isMuted;
      audioRef.current = audio;
      
      audio.play().then(() => {
        setIsPlaying(true);
        console.log('Ambient music started');
      }).catch(e => {
        console.error('Audio playback error:', e);
      });
    } catch (e) {
      console.error('Audio error:', e);
    }
  }, [isPlaying, isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  return { isMuted, isPlaying, isLoading: false, play, toggleMute };
};

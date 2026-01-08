import { useState, useRef, useCallback, useEffect } from 'react';

const MUSIC_STORAGE_KEY = 'doomsday_music_cache';

export const useAudio = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync mute state with audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
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

  const play = useCallback(async () => {
    if (isPlaying || isLoading) return;

    // Check cache first
    const cached = localStorage.getItem(MUSIC_STORAGE_KEY);
    if (cached) {
      try {
        const audioUrl = `data:audio/mpeg;base64,${cached}`;
        const audio = new Audio(audioUrl);
        audio.loop = true;
        audio.volume = 0.4;
        audioRef.current = audio;
        await audio.play();
        setIsPlaying(true);
        console.log('Playing cached music');
        return;
      } catch (e) {
        console.error('Failed to play cached audio:', e);
        localStorage.removeItem(MUSIC_STORAGE_KEY);
      }
    }

    // Generate new music
    setIsLoading(true);
    try {
      console.log('Generating doomsday music...');
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-music`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            prompt: 'Dark cinematic orchestral music, ominous doomsday atmosphere, epic drums, deep bass, apocalyptic tension, heroic undertones like Avengers theme but darker, loopable ambient',
            duration: 30,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to generate music: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.audioContent) {
        // Cache it
        localStorage.setItem(MUSIC_STORAGE_KEY, data.audioContent);
        
        const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
        const audio = new Audio(audioUrl);
        audio.loop = true;
        audio.volume = 0.4;
        audioRef.current = audio;
        await audio.play();
        setIsPlaying(true);
        console.log('Music generated and playing');
      }
    } catch (e) {
      console.error('Audio error:', e);
      // Fallback to drone
      playDroneFallback();
    } finally {
      setIsLoading(false);
    }
  }, [isPlaying, isLoading]);

  const playDroneFallback = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const gain = ctx.createGain();
      gain.gain.value = 0.12;
      gain.connect(ctx.destination);

      [55, 82.5, 110].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = i === 0 ? 'sawtooth' : 'sine';
        osc.frequency.value = freq;
        const oscGain = ctx.createGain();
        oscGain.gain.value = 0.2 / (i + 1);
        osc.connect(oscGain);
        oscGain.connect(gain);
        osc.start();
      });

      setIsPlaying(true);
    } catch (e) {
      console.error('Fallback audio error:', e);
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(m => !m);
  }, []);

  return { isMuted, isPlaying, isLoading, play, toggleMute };
};

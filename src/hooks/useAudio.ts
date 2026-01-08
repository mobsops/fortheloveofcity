import { useState, useEffect, useRef, useCallback } from 'react';

// Dark ambient drone - works reliably
const AUDIO_URL = 'https://www.soundjay.com/misc/sounds/magic-chime-01.mp3';

export const useAudio = () => {
  const [isMuted, setIsMuted] = useState(() => {
    const stored = localStorage.getItem('audio_muted');
    return stored === 'true';
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Create dark ambient drone using Web Audio API
  const startDrone = useCallback(() => {
    if (audioContextRef.current || isPlaying) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const masterGain = audioContext.createGain();
      masterGain.gain.value = isMuted ? 0 : 0.15;
      masterGain.connect(audioContext.destination);
      gainNodeRef.current = masterGain;

      // Create multiple oscillators for rich drone sound
      const frequencies = [55, 82.5, 110, 165]; // Low A harmonics
      
      frequencies.forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const oscGain = audioContext.createGain();
        
        osc.type = i === 0 ? 'sawtooth' : 'sine';
        osc.frequency.value = freq;
        
        // Add slow modulation
        const lfo = audioContext.createOscillator();
        const lfoGain = audioContext.createGain();
        lfo.frequency.value = 0.1 + (i * 0.05);
        lfoGain.gain.value = freq * 0.02;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();
        
        oscGain.gain.value = 0.3 / (i + 1);
        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start();
        
        oscillatorsRef.current.push(osc);
      });

      setIsPlaying(true);
      setIsLoaded(true);
      console.log('Audio drone started');
    } catch (err) {
      console.error('Audio failed:', err);
    }
  }, [isMuted, isPlaying]);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : 0.15;
    }
    localStorage.setItem('audio_muted', String(isMuted));
  }, [isMuted]);

  useEffect(() => {
    return () => {
      oscillatorsRef.current.forEach(osc => {
        try { osc.stop(); } catch (e) {}
      });
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  return {
    isMuted,
    isPlaying,
    isLoaded,
    play: startDrone,
    toggleMute
  };
};

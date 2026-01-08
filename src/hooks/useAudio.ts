import { useState, useRef, useCallback, useEffect } from 'react';

export const useAudio = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Sync mute state with gain
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : 0.12;
    }
  }, [isMuted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  const play = useCallback(() => {
    if (isPlaying || audioContextRef.current) return;

    try {
      const ctx = new AudioContext();
      audioContextRef.current = ctx;

      const gain = ctx.createGain();
      gain.gain.value = 0.12;
      gain.connect(ctx.destination);
      gainNodeRef.current = gain;

      // Create dark ambient drone
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
      console.error('Audio error:', e);
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    setIsMuted(m => !m);
  }, []);

  return { isMuted, isPlaying, play, toggleMute };
};

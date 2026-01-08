import { useState, useRef, useCallback, useEffect } from 'react';

export const useAudio = () => {
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('audio_muted') === 'true';
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);

  // Sync mute state with gain
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(
        isMuted ? 0 : 0.15,
        audioContextRef.current?.currentTime || 0
      );
    }
    localStorage.setItem('audio_muted', String(isMuted));
  }, [isMuted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      oscillatorsRef.current.forEach(osc => {
        try { osc.stop(); } catch (e) {}
      });
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

      const masterGain = ctx.createGain();
      masterGain.gain.value = isMuted ? 0 : 0.15;
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      // Create light ethereal ambient - C major chord with soft textures
      const drones = [
        { freq: 261.63, type: 'sine' as OscillatorType, gain: 0.15 },     // C4
        { freq: 329.63, type: 'sine' as OscillatorType, gain: 0.12 },     // E4
        { freq: 392.00, type: 'sine' as OscillatorType, gain: 0.10 },     // G4
        { freq: 523.25, type: 'triangle' as OscillatorType, gain: 0.06 }, // C5
        { freq: 783.99, type: 'sine' as OscillatorType, gain: 0.03 },     // G5 shimmer
      ];

      drones.forEach(({ freq, type, gain }) => {
        const osc = ctx.createOscillator();
        osc.type = type;
        osc.frequency.value = freq;

        // Gentle slow modulation for dreamy feel
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.value = 0.2 + Math.random() * 0.3;
        lfoGain.gain.value = freq * 0.008;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();

        const oscGain = ctx.createGain();
        oscGain.gain.value = gain;
        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start();

        oscillatorsRef.current.push(osc);
      });

      // Add soft white noise shimmer
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;
      
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.value = 4000;
      
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.008;
      
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(masterGain);
      noise.start();

      setIsPlaying(true);
      console.log('Light ambient started');
    } catch (e) {
      console.error('Audio error:', e);
    }
  }, [isPlaying, isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  return { isMuted, isPlaying, isLoading: false, play, toggleMute };
};

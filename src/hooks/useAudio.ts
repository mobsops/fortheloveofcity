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

      // Create dark cinematic drone with multiple layers
      const drones = [
        { freq: 55, type: 'sawtooth' as OscillatorType, gain: 0.3 },    // Deep bass
        { freq: 82.5, type: 'sine' as OscillatorType, gain: 0.2 },     // Low harmonic
        { freq: 110, type: 'sine' as OscillatorType, gain: 0.15 },     // Octave
        { freq: 165, type: 'triangle' as OscillatorType, gain: 0.1 },  // Fifth
        { freq: 220, type: 'sine' as OscillatorType, gain: 0.05 },     // High octave
      ];

      drones.forEach(({ freq, type, gain }) => {
        const osc = ctx.createOscillator();
        osc.type = type;
        osc.frequency.value = freq;

        // Add slow LFO for movement
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.value = 0.05 + Math.random() * 0.1;
        lfoGain.gain.value = freq * 0.015;
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

      // Add filtered noise for atmosphere
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
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.value = 200;
      
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.02;
      
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(masterGain);
      noise.start();

      setIsPlaying(true);
      console.log('Doomsday ambient started');
    } catch (e) {
      console.error('Audio error:', e);
    }
  }, [isPlaying, isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  return { isMuted, isPlaying, isLoading: false, play, toggleMute };
};

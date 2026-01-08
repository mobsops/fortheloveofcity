import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DECRYPTION_POINTS, EXTRACTION_POINTS } from '@/data/levels';

interface GameSession {
  id: string;
  username: string;
  device_id: string;
  current_level: number;
  current_phase: 'decryption' | 'extraction';
  completed_levels: number[];
  decrypted_levels: number[];
  total_points: number;
  created_at: string;
  updated_at: string;
}

// Generate a unique device ID and store it
const getDeviceId = (): string => {
  try {
    const key = 'temporal_device_id';
    let deviceId = localStorage.getItem(key);
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem(key, deviceId);
    }
    return deviceId;
  } catch {
    // Fallback for environments without localStorage
    return 'fallback-device-id';
  }
};

export const useGameSession = () => {
  const [session, setSession] = useState<GameSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkExistingSession = useCallback(async (username: string): Promise<GameSession | null> => {
    const deviceId = getDeviceId();
    
    const { data, error } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('username', username.toLowerCase())
      .eq('device_id', deviceId)
      .maybeSingle();

    if (error) {
      console.error('Error checking session:', error);
      return null;
    }

    return data as GameSession | null;
  }, []);

  const createSession = useCallback(async (username: string): Promise<GameSession | null> => {
    const deviceId = getDeviceId();
    
    const { data, error } = await supabase
      .from('game_sessions')
      .insert({
        username: username.toLowerCase(),
        device_id: deviceId,
        current_level: 1,
        current_phase: 'decryption',
        completed_levels: [],
        decrypted_levels: [],
        total_points: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating session:', error);
      return null;
    }

    setSession(data as GameSession);
    return data as GameSession;
  }, []);

  const saveDecryption = useCallback(async (levelId: number): Promise<boolean> => {
    if (!session) return false;

    const newDecryptedLevels = session.decrypted_levels.includes(levelId)
      ? session.decrypted_levels
      : [...session.decrypted_levels, levelId];
    
    const newPoints = 
      newDecryptedLevels.length * DECRYPTION_POINTS + 
      session.completed_levels.length * EXTRACTION_POINTS;

    const { error } = await supabase
      .from('game_sessions')
      .update({
        decrypted_levels: newDecryptedLevels,
        total_points: newPoints,
        current_level: levelId,
        current_phase: 'extraction'
      })
      .eq('id', session.id);

    if (error) {
      console.error('Error saving decryption:', error);
      return false;
    }

    setSession(prev => prev ? {
      ...prev,
      decrypted_levels: newDecryptedLevels,
      total_points: newPoints,
      current_level: levelId,
      current_phase: 'extraction'
    } : null);

    return true;
  }, [session]);

  const saveExtraction = useCallback(async (levelId: number): Promise<boolean> => {
    if (!session) return false;

    const newCompletedLevels = session.completed_levels.includes(levelId)
      ? session.completed_levels
      : [...session.completed_levels, levelId];
    
    const newPoints = 
      session.decrypted_levels.length * DECRYPTION_POINTS + 
      newCompletedLevels.length * EXTRACTION_POINTS;

    const { error } = await supabase
      .from('game_sessions')
      .update({
        completed_levels: newCompletedLevels,
        total_points: newPoints,
        current_phase: 'decryption'
      })
      .eq('id', session.id);

    if (error) {
      console.error('Error saving extraction:', error);
      return false;
    }

    setSession(prev => prev ? {
      ...prev,
      completed_levels: newCompletedLevels,
      total_points: newPoints,
      current_phase: 'decryption'
    } : null);

    return true;
  }, [session]);

  const updateSession = useCallback(async (
    level: number, 
    phase: 'decryption' | 'extraction', 
    completedLevels: number[]
  ): Promise<void> => {
    if (!session) return;

    const { error } = await supabase
      .from('game_sessions')
      .update({
        current_level: level,
        current_phase: phase,
        completed_levels: completedLevels
      })
      .eq('id', session.id);

    if (error) {
      console.error('Error updating session:', error);
      return;
    }

    setSession(prev => prev ? {
      ...prev,
      current_level: level,
      current_phase: phase,
      completed_levels: completedLevels
    } : null);
  }, [session]);

  const loadSession = useCallback(async (username: string): Promise<{ isReturning: boolean; session: GameSession | null }> => {
    setIsLoading(true);
    
    const existingSession = await checkExistingSession(username);
    
    if (existingSession) {
      setSession(existingSession);
      setIsLoading(false);
      return { isReturning: true, session: existingSession };
    }

    const newSession = await createSession(username);
    setIsLoading(false);
    return { isReturning: false, session: newSession };
  }, [checkExistingSession, createSession]);

  const resetSession = useCallback(async (): Promise<void> => {
    if (!session) return;

    await supabase
      .from('game_sessions')
      .update({
        current_level: 1,
        current_phase: 'decryption',
        completed_levels: [],
        decrypted_levels: [],
        total_points: 0
      })
      .eq('id', session.id);

    setSession(null);
  }, [session]);

  return {
    session,
    setSession,
    isLoading,
    loadSession,
    updateSession,
    saveDecryption,
    saveExtraction,
    resetSession
  };
};

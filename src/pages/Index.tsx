import { useState, useEffect, useCallback } from 'react';
import { ScanlineOverlay } from '@/components/ScanlineOverlay';
import { AudioControl } from '@/components/AudioControl';
import { UsernameScreen } from '@/components/screens/UsernameScreen';
import { PhotoUploadScreen } from '@/components/screens/PhotoUploadScreen';
import { ProcessingScreen } from '@/components/screens/ProcessingScreen';
import { VideoRevealScreen } from '@/components/screens/VideoRevealScreen';
import { GameScreen } from '@/components/screens/GameScreen';
import { CompletionScreen } from '@/components/screens/CompletionScreen';
import { WelcomeBackScreen } from '@/components/screens/WelcomeBackScreen';
import { useGameSession } from '@/hooks/useGameSession';
import { useAudio } from '@/hooks/useAudio';

type GameState = 
  | 'username'
  | 'welcome-back'
  | 'photo-upload'
  | 'processing'
  | 'video-reveal'
  | 'game'
  | 'complete';

const Index = () => {
  const [gameState, setGameState] = useState<GameState>('username');
  const [username, setUsername] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [transformedImages, setTransformedImages] = useState<string[]>([]);
  const { session, loadSession, resetSession, setSession } = useGameSession();
  const { isMuted, play: playAudio, toggleMute } = useAudio();

  // Start audio on first user interaction
  const handleFirstInteraction = useCallback(() => {
    playAudio();
  }, [playAudio]);

  const handleUsernameSubmit = async (name: string) => {
    handleFirstInteraction();
    setUsername(name);
    
    // Check for existing session
    const { isReturning, session: loadedSession } = await loadSession(name);
    
    if (isReturning && loadedSession) {
      // Any returning user with a session - show welcome back
      setGameState('welcome-back');
    } else {
      // New user - start fresh
      setGameState('photo-upload');
    }
  };

  const handleResumeSession = () => {
    // Go directly to game with saved progress
    setGameState('game');
  };

  const handleRestartSession = async () => {
    await resetSession();
    setGameState('photo-upload');
  };

  const handlePhotoSubmit = (uploadedPhotos: File[]) => {
    setPhotos(uploadedPhotos);
    setGameState('processing');
  };

  const handleProcessingComplete = (images: string[]) => {
    setTransformedImages(images);
    setGameState('video-reveal');
  };

  const handleConfirmMission = () => {
    setGameState('game');
  };

  const handleGameComplete = () => {
    setGameState('complete');
  };

  const handleRestart = async () => {
    setUsername('');
    setPhotos([]);
    setTransformedImages([]);
    await resetSession();
    setGameState('username');
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <ScanlineOverlay />
      <AudioControl isMuted={isMuted} onToggle={toggleMute} />
      
      <main className="relative z-10">
        {gameState === 'username' && (
          <UsernameScreen onSubmit={handleUsernameSubmit} />
        )}
        
        {gameState === 'welcome-back' && session && (
          <WelcomeBackScreen
            username={username}
            currentLevel={session.current_level}
            currentPhase={session.current_phase as 'decryption' | 'extraction'}
            onResume={handleResumeSession}
            onRestart={handleRestartSession}
          />
        )}
        
        {gameState === 'photo-upload' && (
          <PhotoUploadScreen 
            username={username} 
            onSubmit={handlePhotoSubmit} 
          />
        )}
        
        {gameState === 'processing' && (
          <ProcessingScreen 
            photos={photos} 
            onComplete={handleProcessingComplete} 
          />
        )}
        
        {gameState === 'video-reveal' && (
          <VideoRevealScreen 
            transformedImages={transformedImages}
            onConfirm={handleConfirmMission} 
          />
        )}
        
        {gameState === 'game' && (
          <GameScreen 
            username={username} 
            onComplete={handleGameComplete}
            initialLevel={session?.current_level || 1}
            initialPhase={(session?.current_phase as 'decryption' | 'extraction') || 'decryption'}
            initialCompletedLevels={session?.completed_levels || []}
          />
        )}
        
        {gameState === 'complete' && (
          <CompletionScreen 
            username={username} 
            onRestart={handleRestart} 
          />
        )}
      </main>
    </div>
  );
};

export default Index;

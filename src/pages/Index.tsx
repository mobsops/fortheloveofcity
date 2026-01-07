import { useState } from 'react';
import { ScanlineOverlay } from '@/components/ScanlineOverlay';
import { UsernameScreen } from '@/components/screens/UsernameScreen';
import { PhotoUploadScreen } from '@/components/screens/PhotoUploadScreen';
import { ProcessingScreen } from '@/components/screens/ProcessingScreen';
import { VideoRevealScreen } from '@/components/screens/VideoRevealScreen';
import { GameScreen } from '@/components/screens/GameScreen';
import { CompletionScreen } from '@/components/screens/CompletionScreen';

type GameState = 
  | 'username'
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

  const handleUsernameSubmit = (name: string) => {
    setUsername(name);
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

  const handleRestart = () => {
    setUsername('');
    setPhotos([]);
    setTransformedImages([]);
    setGameState('username');
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <ScanlineOverlay />
      
      <main className="relative z-10">
        {gameState === 'username' && (
          <UsernameScreen onSubmit={handleUsernameSubmit} />
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

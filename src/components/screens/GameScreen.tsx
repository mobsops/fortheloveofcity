import { useState, useEffect } from 'react';
import { DecryptionScreen } from './DecryptionScreen';
import { ExtractionScreen } from './ExtractionScreen';
import { TimelineDashboard, NodeProgress } from '@/components/game/TimelineDashboard';
import { Level, LEVELS } from '@/data/levels';

type GameView = 'dashboard' | 'decryption' | 'extraction';

interface GameScreenProps {
  username: string;
  onComplete: () => void;
  decryptedLevels?: number[];
  completedLevels?: number[];
  onSaveDecryption?: (levelId: number) => Promise<boolean>;
  onSaveExtraction?: (levelId: number) => Promise<boolean>;
}

export const GameScreen = ({ 
  username, 
  onComplete,
  decryptedLevels = [],
  completedLevels = [],
  onSaveDecryption,
  onSaveExtraction
}: GameScreenProps) => {
  const [view, setView] = useState<GameView>('dashboard');
  const [activeLevel, setActiveLevel] = useState<Level | null>(null);
  const [nodeProgress, setNodeProgress] = useState<Record<number, NodeProgress>>({});

  // Initialize progress from session data
  useEffect(() => {
    const progress: Record<number, NodeProgress> = {};
    
    LEVELS.forEach(level => {
      progress[level.id] = {
        decrypted: decryptedLevels.includes(level.id),
        extracted: completedLevels.includes(level.id)
      };
    });
    
    setNodeProgress(progress);
  }, [decryptedLevels, completedLevels]);

  const handleSelectNode = (level: Level) => {
    setActiveLevel(level);
    const progress = nodeProgress[level.id];
    
    // If already decrypted, go straight to extraction
    if (progress?.decrypted && !progress?.extracted) {
      setView('extraction');
    } else if (!progress?.decrypted) {
      setView('decryption');
    }
  };

  const handleDecrypted = async () => {
    if (!activeLevel) return;
    
    // Save to database first
    if (onSaveDecryption) {
      const saved = await onSaveDecryption(activeLevel.id);
      if (!saved) {
        console.error('Failed to save decryption progress');
      }
    }
    
    setNodeProgress(prev => ({
      ...prev,
      [activeLevel.id]: {
        ...prev[activeLevel.id],
        decrypted: true,
        extracted: prev[activeLevel.id]?.extracted || false
      }
    }));
    
    setView('extraction');
  };

  const handleExtracted = async () => {
    if (!activeLevel) return;
    
    // Save to database first
    if (onSaveExtraction) {
      const saved = await onSaveExtraction(activeLevel.id);
      if (!saved) {
        console.error('Failed to save extraction progress');
      }
    }
    
    setNodeProgress(prev => ({
      ...prev,
      [activeLevel.id]: {
        ...prev[activeLevel.id],
        decrypted: true,
        extracted: true
      }
    }));
    
    // Return to dashboard after extraction
    setView('dashboard');
    setActiveLevel(null);
  };

  const handleBackToDashboard = () => {
    setView('dashboard');
    setActiveLevel(null);
  };

  const handleSkipExtraction = () => {
    // Allow user to go back to dashboard without extracting
    setView('dashboard');
    setActiveLevel(null);
  };

  if (view === 'decryption' && activeLevel) {
    return (
      <DecryptionScreen
        level={activeLevel}
        nodeProgress={nodeProgress}
        onDecrypted={handleDecrypted}
        onBack={handleBackToDashboard}
        username={username}
      />
    );
  }

  if (view === 'extraction' && activeLevel) {
    return (
      <ExtractionScreen
        level={activeLevel}
        nodeProgress={nodeProgress}
        onExtracted={handleExtracted}
        onSkip={handleSkipExtraction}
        onBack={handleBackToDashboard}
        username={username}
      />
    );
  }

  return (
    <TimelineDashboard
      username={username}
      nodeProgress={nodeProgress}
      onSelectNode={handleSelectNode}
      onComplete={onComplete}
    />
  );
};

import { useState, useEffect } from 'react';
import { DecryptionScreen } from './DecryptionScreen';
import { ExtractionScreen } from './ExtractionScreen';
import { TimelineDashboard, NodeProgress } from '@/components/game/TimelineDashboard';
import { Level, LEVELS } from '@/data/levels';
import { useGameSession } from '@/hooks/useGameSession';

type GameView = 'dashboard' | 'decryption' | 'extraction';

interface GameScreenProps {
  username: string;
  onComplete: () => void;
  initialNodeProgress?: Record<number, NodeProgress>;
}

export const GameScreen = ({ 
  username, 
  onComplete,
  initialNodeProgress = {}
}: GameScreenProps) => {
  const [view, setView] = useState<GameView>('dashboard');
  const [activeLevel, setActiveLevel] = useState<Level | null>(null);
  const [nodeProgress, setNodeProgress] = useState<Record<number, NodeProgress>>(initialNodeProgress);
  const { updateSession } = useGameSession();

  // Save progress when it changes
  useEffect(() => {
    // Convert nodeProgress to the format expected by the session
    const completedLevels = Object.entries(nodeProgress)
      .filter(([_, p]) => p.extracted)
      .map(([id, _]) => parseInt(id));
    
    const currentLevel = activeLevel?.id || 1;
    const currentPhase = view === 'extraction' ? 'extraction' : 'decryption';
    
    updateSession(currentLevel, currentPhase, completedLevels);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeProgress, view, activeLevel]);

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

  const handleDecrypted = () => {
    if (!activeLevel) return;
    
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

  const handleExtracted = () => {
    if (!activeLevel) return;
    
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

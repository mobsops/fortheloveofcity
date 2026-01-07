import { useState, useEffect } from 'react';
import { DecryptionScreen } from './DecryptionScreen';
import { ExtractionScreen } from './ExtractionScreen';
import { useGameSession } from '@/hooks/useGameSession';

interface Level {
  id: number;
  name: string;
  hint: string;
  riddle: string;
  answer: string;
  answerAliases: string[];
  verificationKeywords: string[];
}

// Moscow-based levels with specific locations
const LEVELS: Level[] = [
  { 
    id: 1, 
    name: "THE ORIGIN POINT",
    hint: "Find where the city's heart beats strongest—where red walls touch the sky.",
    riddle: "I stand where tsars once ruled, my walls painted in blood's own hue. Stars of ruby crown my towers. Find me where history began anew.",
    answer: "Red Square",
    answerAliases: ["kremlin", "krasnaya ploshchad", "красная площадь"],
    verificationKeywords: ["kremlin", "cathedral", "wall"]
  },
  { 
    id: 2, 
    name: "THE FORGOTTEN ARCHIVE",
    hint: "Seek the keeper of written memories, where Lenin's name lives on in books.",
    riddle: "Columns of knowledge rise high, named for a revolutionary's cry. Millions of stories rest in my halls, where silence speaks through ancient walls.",
    answer: "Lenin Library",
    answerAliases: ["russian state library", "leninka", "библиотека ленина"],
    verificationKeywords: ["library", "columns", "entrance"]
  },
  { 
    id: 3, 
    name: "THE CROSSROADS",
    hint: "Where millions pass beneath the earth, art adorns the traveler's path.",
    riddle: "I am a palace underground, where chandeliers illuminate the bound. Art meets function in my design, the most beautiful transit you'll find.",
    answer: "Komsomolskaya Metro",
    answerAliases: ["komsomolskaya", "metro station", "метро комсомольская"],
    verificationKeywords: ["metro", "chandelier", "station"]
  },
  { 
    id: 4, 
    name: "THE MEMORIAL",
    hint: "Honor those who fell defending the motherland—victory eternal in stone.",
    riddle: "I pierce the sky at one hundred and forty-one, honoring battles lost and won. Mother Motherland stands near, where victory echoes year after year.",
    answer: "Victory Park",
    answerAliases: ["park pobedy", "poklonnaya hill", "парк победы"],
    verificationKeywords: ["obelisk", "memorial", "monument"]
  },
  { 
    id: 5, 
    name: "THE SANCTUARY",
    hint: "Where souls find peace in painted light—rebuilt from memory and faith.",
    riddle: "Destroyed then risen from the ground, my golden domes are heaven-bound. The tallest Orthodox in the land, rebuilt by many faithful hands.",
    answer: "Christ the Savior Cathedral",
    answerAliases: ["cathedral of christ", "храм христа спасителя"],
    verificationKeywords: ["cathedral", "dome", "gold"]
  },
  { 
    id: 6, 
    name: "THE WATCHTOWER",
    hint: "Elevation reveals perspective—climb where broadcasts touch the stars.",
    riddle: "Needle of steel I reach for space, the tallest view of Moscow's face. Four hundred meters to the sky, where radio waves and tourists fly.",
    answer: "Ostankino Tower",
    answerAliases: ["tv tower", "останкинская башня", "television tower"],
    verificationKeywords: ["tower", "observation", "tall"]
  },
  { 
    id: 7, 
    name: "THE NEXUS",
    hint: "Return to where theater meets elegance—where culture dances through time.",
    riddle: "Apollo rides above my stage, witness to drama through every age. Ballet and opera fill my halls, where the muse of art forever calls.",
    answer: "Bolshoi Theatre",
    answerAliases: ["bolshoi", "большой театр", "big theatre"],
    verificationKeywords: ["theatre", "columns", "apollo"]
  },
];

interface GameScreenProps {
  username: string;
  onComplete: () => void;
  initialLevel?: number;
  initialPhase?: 'decryption' | 'extraction';
  initialCompletedLevels?: number[];
}

export const GameScreen = ({ 
  username, 
  onComplete,
  initialLevel = 1,
  initialPhase = 'decryption',
  initialCompletedLevels = []
}: GameScreenProps) => {
  const [currentLevel, setCurrentLevel] = useState(initialLevel);
  const [phase, setPhase] = useState<'decryption' | 'extraction'>(initialPhase);
  const [completedLevels, setCompletedLevels] = useState<number[]>(initialCompletedLevels);
  const { updateSession } = useGameSession();

  const level = LEVELS[currentLevel - 1];

  // Save progress when state changes
  useEffect(() => {
    updateSession(currentLevel, phase, completedLevels);
  }, [currentLevel, phase, completedLevels]);

  const handleDecrypted = () => {
    setPhase('extraction');
  };

  const handleExtracted = () => {
    const newCompleted = [...completedLevels, currentLevel];
    setCompletedLevels(newCompleted);
    
    if (currentLevel < 7) {
      setCurrentLevel(prev => prev + 1);
      setPhase('decryption');
    } else {
      onComplete();
    }
  };

  if (phase === 'decryption') {
    return (
      <DecryptionScreen
        level={level}
        currentLevel={currentLevel}
        totalLevels={7}
        completedLevels={completedLevels}
        onDecrypted={handleDecrypted}
        username={username}
      />
    );
  }

  return (
    <ExtractionScreen
      level={level}
      currentLevel={currentLevel}
      totalLevels={7}
      completedLevels={completedLevels}
      onExtracted={handleExtracted}
      username={username}
    />
  );
};

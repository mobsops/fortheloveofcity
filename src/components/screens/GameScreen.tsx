import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Camera, Check, Lock, Unlock, Navigation, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlitchText } from '@/components/GlitchText';

interface Level {
  id: number;
  name: string;
  hint: string;
  riddle: string;
}

const LEVELS: Level[] = [
  { 
    id: 1, 
    name: "THE ORIGIN POINT",
    hint: "Find where the city first breathed life—where stone meets sky in ancient greeting.",
    riddle: "I stand where founders once stood, watching generations pass. Find me at dawn's first light."
  },
  { 
    id: 2, 
    name: "THE FORGOTTEN ARCHIVE",
    hint: "Seek the keeper of written memories, where silence speaks volumes.",
    riddle: "Shelves of knowledge tower high, yet the answers lie in the oldest wing."
  },
  { 
    id: 3, 
    name: "THE CROSSROADS",
    hint: "Where four paths meet and decisions are made, the timeline fractures most.",
    riddle: "I am the heart of movement, where strangers cross without meeting eyes."
  },
  { 
    id: 4, 
    name: "THE MEMORIAL",
    hint: "Honor those who shaped tomorrow—their sacrifice echoes through time.",
    riddle: "In bronze and stone I remember, what flesh and blood could not forget."
  },
  { 
    id: 5, 
    name: "THE SANCTUARY",
    hint: "Where souls find peace and architecture touches heaven.",
    riddle: "Light filters through colored glass, painting stories on cold stone floors."
  },
  { 
    id: 6, 
    name: "THE WATCHTOWER",
    hint: "Elevation reveals perspective—climb to see what others miss.",
    riddle: "From my height, the city spreads like a map of human dreams."
  },
  { 
    id: 7, 
    name: "THE NEXUS",
    hint: "Return to where it began, but with eyes that now see beyond.",
    riddle: "Full circle brings new meaning. The end is always a beginning."
  },
];

interface GameScreenProps {
  username: string;
  onComplete: () => void;
}

export const GameScreen = ({ username, onComplete }: GameScreenProps) => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [locationVerified, setLocationVerified] = useState(false);
  const [selfieUploaded, setSelfieUploaded] = useState(false);
  const [isVerifyingLocation, setIsVerifyingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const level = LEVELS[currentLevel - 1];
  const isLevelComplete = locationVerified && selfieUploaded;

  const verifyLocation = () => {
    setIsVerifyingLocation(true);
    setLocationError(null);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you'd verify coordinates against expected location
          console.log('Location:', position.coords);
          setLocationVerified(true);
          setIsVerifyingLocation(false);
        },
        (error) => {
          setLocationError('Location access denied. Please enable location services.');
          setIsVerifyingLocation(false);
        }
      );
    } else {
      setLocationError('Geolocation not supported');
      setIsVerifyingLocation(false);
    }
  };

  const handleSelfieUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelfieUploaded(true);
    }
  };

  const completeLevel = () => {
    setCompletedLevels(prev => [...prev, currentLevel]);
    
    if (currentLevel < 7) {
      setCurrentLevel(prev => prev + 1);
      setLocationVerified(false);
      setSelfieUploaded(false);
    } else {
      onComplete();
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-xs text-muted-foreground tracking-widest mb-1">
          TRAVELER: {username.toUpperCase()} | MISSION IN PROGRESS
        </div>
        <GlitchText as="h1" className="text-xl md:text-2xl glow-text-cyan">
          TEMPORAL TREASURE HUNT
        </GlitchText>
      </div>

      {/* Level Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center gap-1 md:gap-2">
          {LEVELS.map((l) => (
            <div 
              key={l.id}
              className={cn(
                "flex-1 h-2 rounded-full transition-all duration-500",
                completedLevels.includes(l.id) 
                  ? "bg-accent glow-border-cyan" 
                  : l.id === currentLevel 
                    ? "bg-secondary animate-pulse"
                    : "bg-muted"
              )}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>LEVEL 1</span>
          <span>LEVEL 7</span>
        </div>
      </div>

      {/* Current Level */}
      <div className="flex-1 flex flex-col">
        <div className="terminal-box p-6 flex-1">
          {/* Level Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-primary/20">
            <div>
              <div className="text-xs text-secondary tracking-widest mb-1">
                LEVEL {currentLevel} OF 7
              </div>
              <h2 className="font-display text-xl glow-text-amber">
                {level.name}
              </h2>
            </div>
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center border-2",
              isLevelComplete 
                ? "border-accent bg-accent/20" 
                : "border-secondary bg-secondary/10"
            )}>
              {isLevelComplete ? (
                <Check className="w-6 h-6 text-accent" />
              ) : (
                <span className="font-display text-lg text-secondary">{currentLevel}</span>
              )}
            </div>
          </div>

          {/* Riddle */}
          <div className="mb-6">
            <div className="text-xs text-muted-foreground tracking-wider mb-2">
              THE RIDDLE:
            </div>
            <p className="text-foreground italic text-lg leading-relaxed">
              "{level.riddle}"
            </p>
          </div>

          {/* Hint */}
          <div className="bg-muted/50 rounded p-4 mb-8 border border-primary/10">
            <div className="text-xs text-primary tracking-wider mb-1">
              TEMPORAL HINT:
            </div>
            <p className="text-muted-foreground text-sm">
              {level.hint}
            </p>
          </div>

          {/* Verification Tasks */}
          <div className="space-y-4">
            {/* Location Check */}
            <div className={cn(
              "p-4 rounded border transition-all duration-300",
              locationVerified 
                ? "border-accent/50 bg-accent/5" 
                : "border-primary/30 bg-card"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {locationVerified ? (
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                      <Check className="w-5 h-5 text-accent" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                  )}
                  <div>
                    <div className="font-medium">Location Verification</div>
                    <div className="text-xs text-muted-foreground">
                      {locationVerified ? 'Position confirmed' : 'Verify you are at the correct location'}
                    </div>
                  </div>
                </div>
                {!locationVerified && (
                  <Button 
                    variant="terminal" 
                    size="sm"
                    onClick={verifyLocation}
                    disabled={isVerifyingLocation}
                  >
                    {isVerifyingLocation ? (
                      <Navigation className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Navigation className="w-4 h-4 mr-2" />
                        VERIFY
                      </>
                    )}
                  </Button>
                )}
              </div>
              {locationError && (
                <div className="mt-3 flex items-center gap-2 text-destructive text-xs">
                  <AlertCircle className="w-4 h-4" />
                  {locationError}
                </div>
              )}
            </div>

            {/* Selfie Upload */}
            <div className={cn(
              "p-4 rounded border transition-all duration-300",
              selfieUploaded 
                ? "border-accent/50 bg-accent/5" 
                : "border-primary/30 bg-card"
            )}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={handleSelfieUpload}
                className="hidden"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selfieUploaded ? (
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                      <Check className="w-5 h-5 text-accent" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Camera className="w-5 h-5 text-primary" />
                    </div>
                  )}
                  <div>
                    <div className="font-medium">Temporal Selfie</div>
                    <div className="text-xs text-muted-foreground">
                      {selfieUploaded ? 'Image captured' : 'Take a selfie to seal the timeline'}
                    </div>
                  </div>
                </div>
                {!selfieUploaded && (
                  <Button 
                    variant="terminal" 
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    CAPTURE
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Complete Level Button */}
          {isLevelComplete && (
            <div className="mt-8 animate-fade-in-up">
              <Button 
                variant="terminal" 
                size="lg"
                onClick={completeLevel}
                className="w-full animate-pulse-glow"
              >
                {currentLevel === 7 ? (
                  <>
                    <Unlock className="w-5 h-5 mr-2" />
                    COMPLETE MISSION
                  </>
                ) : (
                  <>
                    <Unlock className="w-5 h-5 mr-2" />
                    PROCEED TO LEVEL {currentLevel + 1}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

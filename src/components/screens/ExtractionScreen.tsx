import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Check, MapPin, QrCode, Image, AlertCircle, Unlock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlitchText } from '@/components/GlitchText';

interface Level {
  id: number;
  name: string;
  hint: string;
  riddle: string;
  answer: string;
  verificationKeywords: string[]; // Keywords to look for in landmark photo
}

interface ExtractionScreenProps {
  level: Level;
  currentLevel: number;
  totalLevels: number;
  completedLevels: number[];
  onExtracted: () => void;
  username: string;
}

type VerificationMethod = 'landmark' | 'selfie';

export const ExtractionScreen = ({ 
  level, 
  currentLevel, 
  totalLevels, 
  completedLevels,
  onExtracted,
  username 
}: ExtractionScreenProps) => {
  const [landmarkPhoto, setLandmarkPhoto] = useState<string | null>(null);
  const [selfiePhoto, setSelfiePhoto] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'failed'>('pending');
  const landmarkInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  const isComplete = landmarkPhoto && selfiePhoto && verificationStatus === 'verified';

  const handleLandmarkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setLandmarkPhoto(reader.result as string);
        // Auto-verify after landmark photo (simulated verification)
        // In production, this could use AI to verify the landmark
        setTimeout(() => {
          setVerificationStatus('verified');
        }, 1500);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelfieUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelfiePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleComplete = () => {
    if (isComplete) {
      onExtracted();
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-6">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="text-xs text-muted-foreground tracking-widest mb-1">
          TRAVELER: {username.toUpperCase()} | LEVEL {currentLevel}/{totalLevels}
        </div>
        <GlitchText as="h1" className="text-xl md:text-2xl glow-text-amber">
          EXTRACTION PHASE
        </GlitchText>
      </div>

      {/* Level Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center gap-1 md:gap-2">
          {Array.from({ length: totalLevels }, (_, i) => i + 1).map((l) => (
            <div 
              key={l}
              className={cn(
                "flex-1 h-2 rounded-full transition-all duration-500",
                completedLevels.includes(l) 
                  ? "bg-accent glow-border-cyan" 
                  : l === currentLevel 
                    ? "bg-secondary animate-pulse"
                    : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      {/* Location Info */}
      <div className="terminal-box p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center border-2 border-accent">
            <MapPin className="w-5 h-5 text-accent" />
          </div>
          <div>
            <div className="text-xs text-accent tracking-widest mb-1">
              DECRYPTED LOCATION
            </div>
            <h2 className="font-display text-lg text-foreground">
              {level.answer.toUpperCase()}
            </h2>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Proceed to the decrypted location and capture proof of your presence to extract the temporal data.
        </p>
      </div>

      {/* Verification Tasks */}
      <div className="flex-1 space-y-4">
        {/* Landmark Photo Verification */}
        <div className={cn(
          "terminal-box p-4 transition-all duration-300",
          landmarkPhoto && verificationStatus === 'verified'
            ? "border-accent/50" 
            : "border-primary/30"
        )}>
          <input
            ref={landmarkInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleLandmarkUpload}
            className="hidden"
          />
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                landmarkPhoto && verificationStatus === 'verified'
                  ? "bg-accent/20" 
                  : "bg-primary/20"
              )}>
                {landmarkPhoto && verificationStatus === 'verified' ? (
                  <Check className="w-5 h-5 text-accent" />
                ) : (
                  <Image className="w-5 h-5 text-primary" />
                )}
              </div>
              <div>
                <div className="font-medium">Landmark Photo</div>
                <div className="text-xs text-muted-foreground">
                  {verificationStatus === 'verified' 
                    ? 'Location verified' 
                    : 'Photo of the landmark or recognizable feature'
                  }
                </div>
              </div>
            </div>
          </div>

          {landmarkPhoto ? (
            <div className="relative">
              <img 
                src={landmarkPhoto} 
                alt="Landmark" 
                className="w-full h-40 object-cover rounded border border-primary/20"
              />
              {verificationStatus === 'pending' && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded">
                  <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                    <span className="text-xs text-primary">VERIFYING LOCATION...</span>
                  </div>
                </div>
              )}
              {verificationStatus === 'verified' && (
                <div className="absolute top-2 right-2 bg-accent/90 text-accent-foreground px-2 py-1 rounded text-xs flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  VERIFIED
                </div>
              )}
            </div>
          ) : (
            <Button 
              variant="terminal" 
              onClick={() => landmarkInputRef.current?.click()}
              className="w-full"
            >
              <Camera className="w-4 h-4 mr-2" />
              CAPTURE LANDMARK
            </Button>
          )}

          <div className="mt-3 bg-muted/50 rounded p-2">
            <div className="text-xs text-primary mb-1">VERIFICATION METHOD:</div>
            <p className="text-xs text-muted-foreground">
              Photo must show a recognizable landmark or feature of {level.answer}. 
              This replaces GPS verification for accuracy in Moscow.
            </p>
          </div>
        </div>

        {/* Selfie Verification */}
        <div className={cn(
          "terminal-box p-4 transition-all duration-300",
          selfiePhoto 
            ? "border-accent/50" 
            : "border-primary/30"
        )}>
          <input
            ref={selfieInputRef}
            type="file"
            accept="image/*"
            capture="user"
            onChange={handleSelfieUpload}
            className="hidden"
          />
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                selfiePhoto ? "bg-accent/20" : "bg-primary/20"
              )}>
                {selfiePhoto ? (
                  <Check className="w-5 h-5 text-accent" />
                ) : (
                  <Camera className="w-5 h-5 text-primary" />
                )}
              </div>
              <div>
                <div className="font-medium">Temporal Selfie</div>
                <div className="text-xs text-muted-foreground">
                  {selfiePhoto ? 'Selfie captured' : 'Take a selfie at the location'}
                </div>
              </div>
            </div>
          </div>

          {selfiePhoto ? (
            <img 
              src={selfiePhoto} 
              alt="Selfie" 
              className="w-full h-40 object-cover rounded border border-accent/50"
            />
          ) : (
            <Button 
              variant="terminal" 
              onClick={() => selfieInputRef.current?.click()}
              className="w-full"
              disabled={verificationStatus !== 'verified'}
            >
              <Camera className="w-4 h-4 mr-2" />
              CAPTURE SELFIE
            </Button>
          )}
        </div>
      </div>

      {/* Complete Button */}
      {isComplete && (
        <div className="mt-4 animate-fade-in-up">
          <Button 
            variant="terminal" 
            size="lg"
            onClick={handleComplete}
            className="w-full animate-pulse-glow"
          >
            <Unlock className="w-5 h-5 mr-2" />
            {currentLevel === totalLevels ? 'COMPLETE MISSION' : `PROCEED TO LEVEL ${currentLevel + 1}`}
          </Button>
        </div>
      )}

      {/* Status */}
      {!isComplete && (
        <div className="text-center text-xs text-muted-foreground/60 mt-4 font-mono">
          <div className="flex items-center justify-center gap-2">
            <AlertCircle className="w-3 h-3" />
            <span>
              {!landmarkPhoto 
                ? 'AWAITING LANDMARK PHOTO' 
                : verificationStatus === 'pending'
                  ? 'VERIFYING LOCATION...'
                  : !selfiePhoto
                    ? 'AWAITING TEMPORAL SELFIE'
                    : 'READY TO PROCEED'
              }
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

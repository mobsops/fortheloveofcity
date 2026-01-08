import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Check, MapPin, Image, AlertCircle, Unlock, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlitchText } from '@/components/GlitchText';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Level {
  id: number;
  name: string;
  hint: string;
  riddle: string;
  answer: string;
  verificationKeywords: string[];
}

interface ExtractionScreenProps {
  level: Level;
  currentLevel: number;
  totalLevels: number;
  completedLevels: number[];
  onExtracted: () => void;
  username: string;
}

const LOADING_MESSAGES = [
  "> INITIALIZING UPLINK TO MOSCOW GRID...",
  "> ENCRYPTING BIOMETRIC DATA...",
  "> SENDING EVIDENCE TO OPERATOR (mobthomas)...",
  "> ACTIVATING NANO EYE (GEMINI MODEL)...",
  "> ANALYZING ARCHITECTURE...",
];

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
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'verified' | 'failed'>('idle');
  const [aiComment, setAiComment] = useState<string>('');
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  const [displayedLogs, setDisplayedLogs] = useState<string[]>([]);
  const [shake, setShake] = useState(false);
  const landmarkInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  const isComplete = landmarkPhoto && selfiePhoto && verificationStatus === 'verified';

  // Animated loading logs
  useEffect(() => {
    if (verificationStatus !== 'verifying') {
      setDisplayedLogs([]);
      setCurrentLogIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentLogIndex((prev) => {
        if (prev < LOADING_MESSAGES.length) {
          setDisplayedLogs((logs) => [...logs, LOADING_MESSAGES[prev]]);
          return prev + 1;
        }
        return prev;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [verificationStatus]);

  const handleLandmarkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const photoBase64 = reader.result as string;
      setLandmarkPhoto(photoBase64);
      setVerificationStatus('verifying');
      setAiComment('');
      setDisplayedLogs([]);
      setCurrentLogIndex(0);

      try {
        const { data, error } = await supabase.functions.invoke('verify-location', {
          body: { 
            photoBase64, 
            targetLandmark: level.answer 
          }
        });

        if (error) {
          console.error('Verification error:', error);
          throw error;
        }

        const { isMatch, comment } = data;
        setAiComment(comment || '');

        if (isMatch) {
          setVerificationStatus('verified');
          toast.success('Location verified!');
        } else {
          setVerificationStatus('failed');
          setShake(true);
          setTimeout(() => setShake(false), 500);
          toast.error('Verification failed');
        }
      } catch (error) {
        console.error('Error calling verify-location:', error);
        setVerificationStatus('failed');
        setAiComment('Connection to Moscow Grid lost. Try again.');
        toast.error('Verification failed - please retry');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRetry = () => {
    setLandmarkPhoto(null);
    setVerificationStatus('idle');
    setAiComment('');
    landmarkInputRef.current?.click();
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
    <div className={cn(
      "min-h-screen flex flex-col p-4 md:p-6 transition-transform",
      shake && "animate-shake"
    )}>
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
          verificationStatus === 'verified'
            ? "border-accent/50" 
            : verificationStatus === 'failed'
              ? "border-destructive/50"
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
                verificationStatus === 'verified'
                  ? "bg-accent/20" 
                  : verificationStatus === 'failed'
                    ? "bg-destructive/20"
                    : "bg-primary/20"
              )}>
                {verificationStatus === 'verified' ? (
                  <Check className="w-5 h-5 text-accent" />
                ) : verificationStatus === 'failed' ? (
                  <AlertCircle className="w-5 h-5 text-destructive" />
                ) : (
                  <Image className="w-5 h-5 text-primary" />
                )}
              </div>
              <div>
                <div className="font-medium">Landmark Photo</div>
                <div className="text-xs text-muted-foreground">
                  {verificationStatus === 'verified' 
                    ? 'Location verified' 
                    : verificationStatus === 'failed'
                      ? 'Verification failed - retry'
                      : 'Photo of the landmark for AI verification'
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Loading Terminal Logs */}
          {verificationStatus === 'verifying' && (
            <div className="bg-background/90 rounded border border-primary/30 p-3 mb-3 font-mono text-xs">
              {displayedLogs.map((log, idx) => (
                <div key={idx} className="text-primary animate-fade-in">
                  {log}
                </div>
              ))}
              {currentLogIndex < LOADING_MESSAGES.length && (
                <div className="text-primary animate-blink">_</div>
              )}
            </div>
          )}

          {/* AI Comment Display */}
          {aiComment && verificationStatus !== 'verifying' && (
            <div className={cn(
              "rounded border p-3 mb-3 font-mono text-sm",
              verificationStatus === 'verified'
                ? "bg-accent/10 border-accent/30 text-accent"
                : "bg-destructive/10 border-destructive/30 text-destructive"
            )}>
              <div className="text-xs opacity-70 mb-1">CHRONOS DAEMON:</div>
              "{aiComment}"
            </div>
          )}

          {landmarkPhoto ? (
            <div className="relative">
              <img 
                src={landmarkPhoto} 
                alt="Landmark" 
                className={cn(
                  "w-full h-40 object-cover rounded border",
                  verificationStatus === 'verified'
                    ? "border-accent/50"
                    : verificationStatus === 'failed'
                      ? "border-destructive/50"
                      : "border-primary/20"
                )}
              />
              {verificationStatus === 'verifying' && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded">
                  <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                    <span className="text-xs text-primary">NANO EYE ACTIVE...</span>
                  </div>
                </div>
              )}
              {verificationStatus === 'verified' && (
                <div className="absolute top-2 right-2 bg-accent/90 text-accent-foreground px-2 py-1 rounded text-xs flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  VERIFIED
                </div>
              )}
              {verificationStatus === 'failed' && (
                <div className="absolute top-2 right-2 bg-destructive/90 text-destructive-foreground px-2 py-1 rounded text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  FAILED
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

          {/* Retry Button */}
          {verificationStatus === 'failed' && (
            <Button 
              variant="terminal" 
              onClick={handleRetry}
              className="w-full mt-3"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              RETRY CAPTURE
            </Button>
          )}

          <div className="mt-3 bg-muted/50 rounded p-2">
            <div className="text-xs text-primary mb-1">VERIFICATION METHOD:</div>
            <p className="text-xs text-muted-foreground">
              Photo analyzed by Nano Eye AI to verify landmark presence. 
              Clear, recognizable shots of {level.answer} required.
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
            className="w-full animate-pulse-glow bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <Unlock className="w-5 h-5 mr-2" />
            LEVEL COMPLETE
          </Button>
        </div>
      )}

      {/* Status */}
      {!isComplete && (
        <div className="text-center text-xs text-muted-foreground/60 mt-4 font-mono">
          <div className="flex items-center justify-center gap-2">
            <AlertCircle className="w-3 h-3" />
            <span>
              {verificationStatus === 'idle' && !landmarkPhoto
                ? 'AWAITING LANDMARK PHOTO' 
                : verificationStatus === 'verifying'
                  ? 'NANO EYE ANALYZING...'
                  : verificationStatus === 'failed'
                    ? 'VERIFICATION FAILED - RETRY'
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

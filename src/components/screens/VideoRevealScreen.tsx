import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, AlertTriangle } from 'lucide-react';
import { GlitchText } from '@/components/GlitchText';

interface VideoRevealScreenProps {
  onConfirm: () => void;
}

export const VideoRevealScreen = ({ onConfirm }: VideoRevealScreenProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasWatched, setHasWatched] = useState(false);

  const handlePlay = () => {
    setIsPlaying(true);
    // Simulate video completion after 5 seconds
    setTimeout(() => {
      setIsPlaying(false);
      setHasWatched(true);
    }, 5000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-destructive text-xs tracking-widest mb-4">
            <AlertTriangle className="w-4 h-4" />
            <span>CRITICAL TEMPORAL ALERT</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <GlitchText as="h2" className="text-2xl md:text-4xl glow-text-red mb-4">
            THIS IS WHAT YOU NEED TO STOP
          </GlitchText>
        </div>

        {/* Video Player */}
        <div className="terminal-box p-2 mb-8 glow-border-amber">
          <div className="aspect-video bg-background rounded relative overflow-hidden">
            {!isPlaying && !hasWatched && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-background to-card">
                <div className="text-6xl mb-4 animate-pulse">📼</div>
                <Button variant="terminal" size="lg" onClick={handlePlay}>
                  <Play className="w-5 h-5 mr-2" />
                  PLAY RECONSTRUCTION
                </Button>
                <div className="text-xs text-muted-foreground mt-4">
                  TEMPORAL FOOTAGE: RECONSTRUCTED
                </div>
              </div>
            )}
            
            {isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-destructive/20 to-background">
                <div className="text-center">
                  <div className="font-display text-4xl text-destructive glow-text-red animate-glitch mb-4">
                    ⚡ BURNT REALITY ⚡
                  </div>
                  <div className="text-sm text-muted-foreground animate-pulse">
                    PLAYING TEMPORAL RECONSTRUCTION...
                  </div>
                  <div className="mt-4 w-64 h-1 bg-muted rounded overflow-hidden mx-auto">
                    <div className="h-full bg-destructive animate-pulse" style={{
                      animation: 'loading 5s linear forwards'
                    }} />
                  </div>
                </div>
                <style>{`
                  @keyframes loading {
                    from { width: 0%; }
                    to { width: 100%; }
                  }
                `}</style>
              </div>
            )}
            
            {hasWatched && !isPlaying && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-background to-card">
                <div className="text-accent text-6xl mb-4">✓</div>
                <div className="text-lg font-display glow-text-green">
                  RECONSTRUCTION VIEWED
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  YOU HAVE SEEN THE FUTURE
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Confirmation */}
        {hasWatched && (
          <div className="animate-fade-in-up">
            <div className="terminal-box p-6 text-center">
              <div className="text-sm text-foreground mb-6">
                <div className="mb-4">
                  The future depends on your actions in the present.
                </div>
                <div className="text-muted-foreground text-xs">
                  To prevent this reality, you must complete <span className="text-primary">7 temporal missions</span> across
                  the city—each one sealing a fracture in the timeline.
                </div>
              </div>

              <div className="border-t border-primary/20 pt-6">
                <div className="text-xs text-secondary mb-4 tracking-widest">
                  ARE YOU READY TO BEGIN THE HUNT?
                </div>
                <Button 
                  variant="terminal" 
                  size="xl"
                  onClick={onConfirm}
                  className="animate-pulse-glow"
                >
                  ACCEPT MISSION
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

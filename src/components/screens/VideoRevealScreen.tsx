import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GlitchText } from '@/components/GlitchText';
import { AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';

interface VideoRevealScreenProps {
  transformedImages: string[];
  onConfirm: () => void;
}

export const VideoRevealScreen = ({ transformedImages, onConfirm }: VideoRevealScreenProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handlePrev = () => {
    setCurrentImageIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentImageIndex(prev => Math.min(transformedImages.length - 1, prev + 1));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        {/* Warning Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 text-destructive mb-4">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
            <span className="text-xs tracking-widest font-mono">
              TEMPORAL BREACH DETECTED
            </span>
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          
          <GlitchText className="text-2xl md:text-3xl font-display glow-text-red">
            THIS IS WHAT YOU NEED TO STOP
          </GlitchText>
        </div>

        {/* Image Display Area */}
        <div className="terminal-box p-2 mb-6">
          <div className="aspect-video bg-black rounded relative overflow-hidden">
            {transformedImages.length > 0 ? (
              <>
                <img 
                  src={transformedImages[currentImageIndex]}
                  alt={`Apocalyptic vision ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Scanline overlay on image */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent animate-scan pointer-events-none" />
                
                {/* Glitch effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-destructive/10 to-transparent mix-blend-overlay pointer-events-none" />
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-destructive mb-4">
                    <AlertTriangle className="w-16 h-16 mx-auto animate-pulse" />
                  </div>
                  <div className="font-mono text-sm text-muted-foreground">
                    NO TEMPORAL DATA AVAILABLE
                  </div>
                </div>
              </div>
            )}

            {/* Image counter */}
            {transformedImages.length > 0 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 px-3 py-1 rounded font-mono text-xs">
                VISION {currentImageIndex + 1} / {transformedImages.length}
              </div>
            )}
            
            {/* Recording indicator */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
              <span className="text-xs font-mono text-destructive">
                TEMPORAL FEED
              </span>
            </div>

            {/* Timestamp */}
            <div className="absolute top-4 right-4 text-xs font-mono text-muted-foreground">
              YEAR: 2157
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        {transformedImages.length > 1 && (
          <div className="flex justify-center gap-4 mb-6">
            <Button
              variant="terminal"
              size="sm"
              onClick={handlePrev}
              disabled={currentImageIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              PREV
            </Button>
            <Button
              variant="terminal"
              size="sm"
              onClick={handleNext}
              disabled={currentImageIndex >= transformedImages.length - 1}
            >
              NEXT
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Message */}
        <div className="text-center mb-6">
          <p className="text-muted-foreground text-sm max-w-lg mx-auto font-mono leading-relaxed">
            This is the future of your reality. Streets torn apart. Buildings in flames.
            Humanity running for survival. 
            <span className="text-destructive font-bold"> You must prevent this timeline.</span>
          </p>
        </div>

        {/* Confirmation */}
        <div className="text-center">
          <div className="mb-4 text-sm text-muted-foreground font-mono">
            MISSION BRIEFING COMPLETE
          </div>
          <Button
            variant="danger"
            size="lg"
            onClick={onConfirm}
            className="animate-pulse-glow"
          >
            <AlertTriangle className="w-5 h-5 mr-2" />
            ACCEPT MISSION - SAVE THIS TIMELINE
          </Button>
        </div>

        {/* Timeline indicator */}
        {transformedImages.length > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            {transformedImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentImageIndex 
                    ? 'bg-destructive w-4' 
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

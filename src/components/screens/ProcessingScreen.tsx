import { useState, useEffect } from 'react';
import { TerminalText } from '@/components/TerminalText';

interface ProcessingScreenProps {
  onComplete: () => void;
}

const PROCESSING_MESSAGES = [
  { text: "INITIALIZING TEMPORAL SCANNERS...", delay: 2000 },
  { text: "ANALYZING ARCHITECTURAL SIGNATURES...", delay: 2500 },
  { text: "RETRIEVING DATA FROM TIME CAPSULE...", delay: 3000 },
  { text: "CONNECTING TO FUTURE NEXUS...", delay: 2500 },
  { text: "ANALYZING TEMPORAL FINGERPRINTS...", delay: 3000 },
  { text: "CROSS-REFERENCING HISTORICAL DATABASE...", delay: 2500 },
  { text: "⚠ CONNECTION UNSTABLE...", delay: 2000, warning: true },
  { text: "RECALIBRATING TEMPORAL BRIDGE...", delay: 3000 },
  { text: "CONNECTION FAILED. RETRYING...", delay: 2500, error: true },
  { text: "THIS MAY TAKE 2-3 MINUTES...", delay: 3000, error: true },
  { text: "STABILIZING QUANTUM LINK...", delay: 4000 },
  { text: "RECONSTRUCTING TIMELINE...", delay: 3000 },
  { text: "VIDEO RECONSTRUCTION COMPLETE.", delay: 1500, success: true },
];

export const ProcessingScreen = ({ onComplete }: ProcessingScreenProps) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedMessages, setDisplayedMessages] = useState<typeof PROCESSING_MESSAGES>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentMessageIndex < PROCESSING_MESSAGES.length) {
      const message = PROCESSING_MESSAGES[currentMessageIndex];
      
      // Add message to displayed list
      setDisplayedMessages(prev => [...prev, message]);
      
      // Update progress
      setProgress(((currentMessageIndex + 1) / PROCESSING_MESSAGES.length) * 100);
      
      // Schedule next message
      const timer = setTimeout(() => {
        setCurrentMessageIndex(prev => prev + 1);
      }, message.delay);

      return () => clearTimeout(timer);
    } else {
      // All messages complete, wait a moment then proceed
      const timer = setTimeout(onComplete, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentMessageIndex, onComplete]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="font-display text-2xl md:text-3xl glow-text-amber mb-2 animate-flicker">
            TEMPORAL RECONSTRUCTION
          </h2>
          <div className="text-xs text-muted-foreground tracking-widest">
            DO NOT INTERRUPT PROCESS
          </div>
        </div>

        {/* Terminal Output */}
        <div className="terminal-box p-6 mb-6 h-80 overflow-y-auto">
          <div className="space-y-2 font-mono text-sm">
            {displayedMessages.map((msg, index) => (
              <div 
                key={index}
                className={`animate-fade-in-up ${
                  msg.error ? 'text-destructive glow-text-red' : 
                  msg.warning ? 'text-secondary glow-text-amber' :
                  msg.success ? 'text-accent glow-text-green' :
                  'text-foreground'
                }`}
              >
                <span className="text-muted-foreground mr-2">{'>'}</span>
                <TerminalText text={msg.text} delay={20} showCursor={false} />
              </div>
            ))}
            
            {currentMessageIndex < PROCESSING_MESSAGES.length && (
              <div className="text-primary">
                <span className="animate-blink">▌</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>RECONSTRUCTION PROGRESS</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-muted rounded overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 animate-pulse-glow"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Data Stream Effect */}
        <div className="h-20 relative overflow-hidden rounded border border-primary/20">
          <div className="absolute inset-0 animate-data-stream opacity-50" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-xs text-primary/60 font-mono tracking-widest">
              TEMPORAL DATA STREAM ACTIVE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

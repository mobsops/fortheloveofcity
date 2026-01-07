import { useState, useEffect, useCallback } from 'react';
import { TerminalText } from '@/components/TerminalText';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProcessingScreenProps {
  photos: File[];
  onComplete: (transformedImages: string[]) => void;
}

interface ProcessingMessage {
  text: string;
  delay: number;
  warning?: boolean;
  error?: boolean;
  success?: boolean;
}

const PROCESSING_MESSAGES: ProcessingMessage[] = [
  { text: "INITIALIZING TEMPORAL SCANNERS...", delay: 2000 },
  { text: "ANALYZING ARCHITECTURAL SIGNATURES...", delay: 2500 },
  { text: "RETRIEVING DATA FROM TIME CAPSULE...", delay: 3000 },
  { text: "CONNECTING TO FUTURE NEXUS...", delay: 2500 },
  { text: "ANALYZING TEMPORAL FINGERPRINTS...", delay: 3000 },
  { text: "CROSS-REFERENCING HISTORICAL DATABASE...", delay: 2500 },
  { text: "⚠ CONNECTION UNSTABLE...", delay: 2000, warning: true },
  { text: "RECALIBRATING TEMPORAL BRIDGE...", delay: 3000 },
];

const FINAL_MESSAGES: ProcessingMessage[] = [
  { text: "CONNECTION STABILIZED.", delay: 1500, success: true },
  { text: "RECONSTRUCTING TIMELINE...", delay: 2000 },
  { text: "VIDEO RECONSTRUCTION COMPLETE.", delay: 1500, success: true },
];

const ERROR_MESSAGES: ProcessingMessage[] = [
  { text: "CONNECTION FAILED. RETRYING...", delay: 2500, error: true },
  { text: "THIS MAY TAKE 2-3 MINUTES...", delay: 3000, error: true },
  { text: "STABILIZING QUANTUM LINK...", delay: 4000 },
];

export const ProcessingScreen = ({ photos, onComplete }: ProcessingScreenProps) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedMessages, setDisplayedMessages] = useState<typeof PROCESSING_MESSAGES>([]);
  const [progress, setProgress] = useState(0);
  const [transformedImages, setTransformedImages] = useState<string[] | null>(null);
  const [apiError, setApiError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(true);

  // Convert photos to base64 and call API
  const processPhotos = useCallback(async () => {
    try {
      console.log('Converting photos to base64...');
      const base64Images: string[] = [];
      
      for (const photo of photos) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(photo);
        });
        base64Images.push(base64);
      }

      console.log('Sending to transform-photos API...');
      const { data, error } = await supabase.functions.invoke('transform-photos', {
        body: { images: base64Images }
      });

      if (error) {
        console.error('API error:', error);
        setApiError(true);
        toast.error('Temporal reconstruction failed. Using fallback imagery.');
        return base64Images; // Return original images as fallback
      }

      if (data?.transformedImages) {
        console.log('Transformation successful!');
        return data.transformedImages;
      }

      return base64Images; // Fallback to originals
    } catch (err) {
      console.error('Processing error:', err);
      setApiError(true);
      toast.error('Connection to future nexus failed.');
      return null;
    }
  }, [photos]);

  // Start API call when component mounts
  useEffect(() => {
    processPhotos().then(images => {
      if (images) {
        setTransformedImages(images);
      }
    });
  }, [processPhotos]);

  // Message progression effect
  useEffect(() => {
    if (!isProcessing) return;

    // Determine which messages to show based on state
    const allMessages = transformedImages 
      ? [...PROCESSING_MESSAGES, ...FINAL_MESSAGES]
      : apiError 
        ? [...PROCESSING_MESSAGES, ...ERROR_MESSAGES, ...FINAL_MESSAGES]
        : PROCESSING_MESSAGES;

    if (currentMessageIndex < allMessages.length) {
      const message = allMessages[currentMessageIndex];
      
      // Add message to displayed list
      setDisplayedMessages(prev => [...prev, message]);
      
      // Update progress
      setProgress(((currentMessageIndex + 1) / allMessages.length) * 100);
      
      // Schedule next message
      const timer = setTimeout(() => {
        setCurrentMessageIndex(prev => prev + 1);
      }, message.delay);

      return () => clearTimeout(timer);
    } else if (transformedImages) {
      // All messages complete and we have images - proceed!
      console.log('Processing complete, transitioning with images:', transformedImages.length);
      setIsProcessing(false);
      const timer = setTimeout(() => {
        onComplete(transformedImages);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentMessageIndex, transformedImages, apiError, isProcessing, onComplete]);

  // Keep showing waiting messages while API is processing
  useEffect(() => {
    if (transformedImages || !isProcessing) return; // Exit if we have images or not processing
    
    if (currentMessageIndex >= PROCESSING_MESSAGES.length) {
      // Show waiting message every 3 seconds while API works
      const timer = setTimeout(() => {
        setDisplayedMessages(prev => [...prev, {
          text: "STABILIZING QUANTUM LINK...",
          delay: 3000,
        }]);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [transformedImages, currentMessageIndex, isProcessing, displayedMessages.length]);

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
            
            {isProcessing && (
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
              {transformedImages ? "TEMPORAL DATA RECONSTRUCTED" : "TEMPORAL DATA STREAM ACTIVE"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

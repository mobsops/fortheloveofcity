import { useState, useEffect, useCallback } from 'react';
import { TerminalText } from '@/components/TerminalText';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

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
  { text: "INITIALIZING TEMPORAL SCANNERS...", delay: 1500 },
  { text: "ANALYZING ARCHITECTURAL SIGNATURES...", delay: 2000 },
  { text: "CONNECTING TO FUTURE NEXUS...", delay: 2000 },
  { text: "CROSS-REFERENCING HISTORICAL DATABASE...", delay: 2000 },
];

const FINAL_MESSAGES: ProcessingMessage[] = [
  { text: "CONNECTION STABILIZED.", delay: 1000, success: true },
  { text: "RECONSTRUCTION COMPLETE.", delay: 1000, success: true },
];

export const ProcessingScreen = ({ photos, onComplete }: ProcessingScreenProps) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedMessages, setDisplayedMessages] = useState<typeof PROCESSING_MESSAGES>([]);
  const [progress, setProgress] = useState(0);
  const [transformedImages, setTransformedImages] = useState<string[] | null>(null);
  const [apiError, setApiError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(true);
  const [showRetry, setShowRetry] = useState(false);

  // Convert photos to base64 and call API
  const processPhotos = useCallback(async () => {
    try {
      setApiError(false);
      setShowRetry(false);
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
        setShowRetry(true);
        toast.error('Temporal reconstruction failed.');
        return base64Images; // Return original images as fallback
      }

      if (data?.transformedImages) {
        console.log('Transformation successful!', data.transformedImages.length, 'images');
        return data.transformedImages;
      }

      console.log('No transformed images in response, using originals');
      return base64Images;
    } catch (err) {
      console.error('Processing error:', err);
      setApiError(true);
      setShowRetry(true);
      toast.error('Connection to future nexus failed.');
      return null;
    }
  }, [photos]);

  // Start API call
  const startProcessing = useCallback(() => {
    setCurrentMessageIndex(0);
    setDisplayedMessages([]);
    setProgress(0);
    setTransformedImages(null);
    setIsProcessing(true);
    
    processPhotos().then(images => {
      if (images && images.length > 0) {
        console.log('Setting transformed images:', images.length);
        setTransformedImages(images);
      }
    });
  }, [processPhotos]);

  // Start on mount
  useEffect(() => {
    startProcessing();
  }, []);

  // Message progression effect
  useEffect(() => {
    if (!isProcessing) return;

    const allMessages = [...PROCESSING_MESSAGES, ...FINAL_MESSAGES];
    const canShowFinalMessages = transformedImages !== null;

    // Only show processing messages until we have images
    const messagesToShow = canShowFinalMessages 
      ? allMessages 
      : PROCESSING_MESSAGES;

    if (currentMessageIndex < messagesToShow.length) {
      const message = messagesToShow[currentMessageIndex];
      
      setDisplayedMessages(prev => [...prev, message]);
      setProgress(((currentMessageIndex + 1) / allMessages.length) * 100);
      
      const timer = setTimeout(() => {
        setCurrentMessageIndex(prev => prev + 1);
      }, message.delay);

      return () => clearTimeout(timer);
    } else if (transformedImages && currentMessageIndex >= allMessages.length) {
      // All messages shown and we have images - transition!
      console.log('All messages complete, calling onComplete');
      setIsProcessing(false);
      setProgress(100);
      onComplete(transformedImages);
    }
  }, [currentMessageIndex, transformedImages, isProcessing, onComplete]);

  // Show waiting indicator if API is slow
  useEffect(() => {
    if (transformedImages || !isProcessing) return;
    
    if (currentMessageIndex >= PROCESSING_MESSAGES.length) {
      const timer = setTimeout(() => {
        setDisplayedMessages(prev => [...prev, {
          text: "STABILIZING QUANTUM LINK...",
          delay: 2000,
          warning: true,
        }]);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [transformedImages, currentMessageIndex, isProcessing, displayedMessages.length]);

  const handleRetry = () => {
    startProcessing();
  };

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

        {/* Retry Button */}
        {showRetry && (
          <div className="text-center mb-6">
            <Button
              variant="terminal"
              onClick={handleRetry}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              RETRY TEMPORAL CONNECTION
            </Button>
          </div>
        )}

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

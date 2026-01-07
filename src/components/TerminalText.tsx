import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TerminalTextProps {
  text: string;
  delay?: number;
  className?: string;
  onComplete?: () => void;
  showCursor?: boolean;
}

export const TerminalText = ({ 
  text, 
  delay = 50, 
  className,
  onComplete,
  showCursor = true 
}: TerminalTextProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);
    
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsComplete(true);
        onComplete?.();
      }
    }, delay);

    return () => clearInterval(interval);
  }, [text, delay, onComplete]);

  return (
    <span className={cn('font-mono', className)}>
      {displayedText}
      {showCursor && !isComplete && (
        <span className="animate-blink text-primary">▌</span>
      )}
    </span>
  );
};

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Lock, Unlock, HelpCircle, AlertCircle, Loader2 } from 'lucide-react';
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
  answerAliases: string[];
}

interface ChatMessage {
  role: 'user' | 'system';
  content: string;
  isHint?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
}

interface DecryptionScreenProps {
  level: Level;
  currentLevel: number;
  totalLevels: number;
  completedLevels: number[];
  onDecrypted: () => void;
  username: string;
}

export const DecryptionScreen = ({ 
  level, 
  currentLevel, 
  totalLevels, 
  completedLevels,
  onDecrypted,
  username 
}: DecryptionScreenProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: 'system', 
      content: `AGENT ${username.toUpperCase()}, welcome to DECRYPTION PHASE. Solve the riddle to unlock the location. I cannot reveal the answer directly, but I can help you think.`
    }
  ]);
  const [input, setInput] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Strict local validation as fallback
  const normalizeAnswer = (text: string): string => {
    return text.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
  };

  const strictLocalCheck = (userInput: string): { isCorrect: boolean; isClose: boolean } => {
    const normalized = normalizeAnswer(userInput);
    const correctAnswers = [level.answer, ...level.answerAliases].map(normalizeAnswer);
    
    // Must match EXACTLY (not just contain)
    const isCorrect = correctAnswers.some(answer => normalized === answer);
    
    // Check if close (contains part of answer but not generic terms)
    const genericTerms = ['moscow', 'russia', 'st petersburg', 'saint petersburg', 'city', 'place', 'building'];
    const isGeneric = genericTerms.some(term => normalized.includes(term));
    const answerWords = normalizeAnswer(level.answer).split(' ');
    const isClose = !isGeneric && answerWords.some(word => word.length > 3 && normalized.includes(word));
    
    return { isCorrect, isClose };
  };

  const evaluateAnswer = async (userAnswer: string): Promise<{ isCorrect: boolean; isClose: boolean; response: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke('evaluate-answer', {
        body: {
          userAnswer,
          riddle: level.riddle,
          correctAnswer: level.answer,
          answerAliases: level.answerAliases,
          hint: level.hint,
          attemptCount: attempts + 1,
        },
      });

      if (error) {
        console.error('Evaluation error:', error);
        throw error;
      }

      // Check for API errors in response
      if (data?.error) {
        throw new Error(data.error);
      }

      return data;
    } catch (error) {
      console.error('AI unavailable, using local validation:', error);
      
      // Fallback to strict local checking
      const { isCorrect, isClose } = strictLocalCheck(userAnswer);
      
      if (isCorrect) {
        return { isCorrect: true, isClose: false, response: '' };
      }
      
      const hints = [
        "Think about the metaphors in the riddle. What specific Moscow landmark fits?",
        "Focus on the key imagery - what place matches these descriptions?",
        `Hint: ${level.hint}`,
        "Consider famous Moscow landmarks that tourists visit.",
        "Read the riddle again slowly. Each word is a clue."
      ];
      
      return {
        isCorrect: false,
        isClose,
        response: isClose 
          ? "You're getting warmer... but you need the exact location name."
          : hints[Math.min(attempts, hints.length - 1)],
      };
    }
  };

  const handleSubmit = async () => {
    if (!input.trim() || isDecrypted || isEvaluating) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setAttempts(prev => prev + 1);
    setInput('');
    setIsEvaluating(true);

    try {
      const result = await evaluateAnswer(input);

      if (result.isCorrect) {
        setIsDecrypted(true);
        setMessages(prev => [...prev, {
          role: 'system',
          content: `✓ CORRECT! Location decrypted: ${level.answer.toUpperCase()}. Proceed to EXTRACTION PHASE to verify your physical presence.`,
          isSuccess: true
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'system',
          content: result.response,
          isHint: result.isClose
        }]);
      }
    } catch (error) {
      toast.error('Communication error. Try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleProceed = () => {
    onDecrypted();
  };

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-6">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="text-xs text-muted-foreground tracking-widest mb-1">
          TRAVELER: {username.toUpperCase()} | LEVEL {currentLevel}/{totalLevels}
        </div>
        <GlitchText as="h1" className="text-xl md:text-2xl glow-text-cyan">
          DECRYPTION PHASE
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

      {/* Level Info */}
      <div className="terminal-box p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs text-secondary tracking-widest mb-1">
              LEVEL {currentLevel}
            </div>
            <h2 className="font-display text-lg glow-text-amber">
              {level.name}
            </h2>
          </div>
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center border-2",
            isDecrypted 
              ? "border-accent bg-accent/20" 
              : "border-secondary bg-secondary/10"
          )}>
            {isDecrypted ? (
              <Unlock className="w-5 h-5 text-accent" />
            ) : (
              <Lock className="w-5 h-5 text-secondary" />
            )}
          </div>
        </div>

        {/* Riddle */}
        <div className="bg-muted/50 rounded p-3 border border-primary/10">
          <div className="text-xs text-primary tracking-wider mb-1 flex items-center gap-1">
            <HelpCircle className="w-3 h-3" />
            THE RIDDLE:
          </div>
          <p className="text-foreground italic text-sm leading-relaxed">
            "{level.riddle}"
          </p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 terminal-box p-4 flex flex-col min-h-[300px]">
        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {messages.map((msg, idx) => (
            <div 
              key={idx}
              className={cn(
                "p-3 rounded text-sm",
                msg.role === 'user' 
                  ? "bg-primary/20 ml-8 text-foreground" 
                  : msg.isSuccess
                    ? "bg-accent/20 mr-8 text-accent glow-text-green"
                    : msg.isError
                      ? "bg-destructive/20 mr-8 text-destructive"
                      : "bg-muted/50 mr-8 text-muted-foreground"
              )}
            >
              {msg.role === 'system' && (
                <span className="text-xs text-primary block mb-1">SYSTEM:</span>
              )}
              {msg.content}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {!isDecrypted ? (
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isEvaluating && handleSubmit()}
              placeholder="Enter your answer..."
              className="flex-1 bg-background/50"
              disabled={isEvaluating}
            />
            <Button 
              variant="terminal" 
              size="icon"
              onClick={handleSubmit}
              disabled={!input.trim() || isEvaluating}
            >
              {isEvaluating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        ) : (
          <Button 
            variant="terminal" 
            onClick={handleProceed}
            className="w-full animate-pulse-glow"
          >
            <Unlock className="w-4 h-4 mr-2" />
            PROCEED TO EXTRACTION
          </Button>
        )}
      </div>

      {/* Attempts Counter */}
      <div className="text-center text-xs text-muted-foreground/60 mt-3 font-mono">
        <div className="flex items-center justify-center gap-2">
          <AlertCircle className="w-3 h-3" />
          <span>DECRYPTION ATTEMPTS: {attempts}</span>
        </div>
      </div>
    </div>
  );
};

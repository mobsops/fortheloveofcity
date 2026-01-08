import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Lock, Unlock, HelpCircle, AlertCircle, Loader2, ArrowLeft, BookOpen, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlitchText } from '@/components/GlitchText';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Level, LEVELS, DECRYPTION_POINTS, EXTRACTION_POINTS, REQUIRED_STABILITY } from '@/data/levels';
import { NodeProgress } from '@/components/game/TimelineDashboard';
import { useLanguage } from '@/contexts/LanguageContext';

interface ChatMessage {
  role: 'user' | 'system';
  content: string;
  isHint?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
}

interface DecryptionScreenProps {
  level: Level;
  nodeProgress: Record<number, NodeProgress>;
  onDecrypted: () => void;
  onBack: () => void;
  username: string;
}

export const DecryptionScreen = ({ 
  level, 
  nodeProgress,
  onDecrypted,
  onBack,
  username 
}: DecryptionScreenProps) => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: 'system', 
      content: `${t('agent')} ${username.toUpperCase()}, ${t('chronos_intro')} ${level.id}. ${t('chronos_help')}`
    }
  ]);
  const [input, setInput] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [showStory, setShowStory] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Calculate current points
  const calculatePoints = (): number => {
    let points = 0;
    Object.values(nodeProgress).forEach(progress => {
      if (progress.decrypted) points += DECRYPTION_POINTS;
      if (progress.extracted) points += EXTRACTION_POINTS;
    });
    return points;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Normalize and check answer locally
  const normalizeAnswer = (text: string): string => {
    return text.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
  };

  const strictLocalCheck = (userInput: string): { isCorrect: boolean; isClose: boolean } => {
    const normalized = normalizeAnswer(userInput);
    const keywords = level.answerKeywords.map(k => k.toLowerCase());
    
    // Check if any keyword is present in the answer
    const matchedKeywords = keywords.filter(keyword => normalized.includes(keyword));
    const isCorrect = matchedKeywords.length >= 1;
    
    // Check if close (contains part of a keyword)
    const isClose = !isCorrect && keywords.some(keyword => {
      const parts = keyword.split(' ');
      return parts.some(part => part.length > 3 && normalized.includes(part));
    });
    
    return { isCorrect, isClose };
  };

  const evaluateAnswer = async (userAnswer: string): Promise<{ isCorrect: boolean; isClose: boolean; response: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke('evaluate-answer', {
        body: {
          userAnswer,
          riddle: level.riddle,
          correctAnswer: level.location,
          answerAliases: level.answerKeywords,
          hint: `Look for: ${level.answerKeywords.join(', ')}`,
          attemptCount: attempts + 1,
        },
      });

      if (error) {
        console.error('Evaluation error:', error);
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data;
    } catch (error) {
      console.error('AI unavailable, using local validation:', error);
      
      const { isCorrect, isClose } = strictLocalCheck(userAnswer);
      
      if (isCorrect) {
        return { isCorrect: true, isClose: false, response: '' };
      }
      
      const hints = [
        "Think about Moscow's historical landmarks. What specific place fits this riddle?",
        "Focus on the key imagery and time period mentioned.",
        `This is from the ${level.era} era. What landmark fits?`,
        "Consider the metaphors carefully. Each word is a clue.",
        "Read the riddle again slowly. The answer is hidden in the details."
      ];
      
      return {
        isCorrect: false,
        isClose,
        response: isClose 
          ? "You're getting warmer... but I need more precision."
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
          content: `✓ ${t('signal_identified')} ${level.location.toUpperCase()}. +${DECRYPTION_POINTS} ${t('points_earned')}`,
          isSuccess: true
        }]);
        setShowStory(true);
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
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground">
          <ArrowLeft className="w-4 h-4 mr-1" />
          {t('dashboard')}
        </Button>
        <div className="text-xs text-muted-foreground tracking-widest">
          {t('agent')}: {username.toUpperCase()}
        </div>
      </div>

      <div className="text-center mb-4">
        <div className="text-xs text-secondary tracking-widest mb-1">
          {t('node')} {level.id} | {level.era}
        </div>
        <GlitchText as="h1" className="text-xl md:text-2xl glow-text-cyan">
          {level.name}
        </GlitchText>
        <div className="text-xs text-primary tracking-widest mt-1">
          {t('decryption_phase')}
        </div>
      </div>

      {/* Compact Stability Display */}
      <div className="terminal-box p-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t('stability_meter')}</span>
          <span className="font-mono text-primary">{calculatePoints().toFixed(1)} / {REQUIRED_STABILITY.toFixed(1)}</span>
        </div>
      </div>

      {/* Riddle */}
      <div className="terminal-box p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center border-2",
            isDecrypted ? "border-accent bg-accent/20" : "border-secondary bg-secondary/10"
          )}>
            {isDecrypted ? (
              <Unlock className="w-4 h-4 text-accent" />
            ) : (
              <Lock className="w-4 h-4 text-secondary" />
            )}
          </div>
          <div className="text-xs text-primary tracking-wider flex items-center gap-1">
            <HelpCircle className="w-3 h-3" />
            {t('the_riddle')}
          </div>
        </div>
        <p className="text-foreground italic text-sm leading-relaxed bg-muted/50 rounded p-3 border border-primary/10">
          "{level.riddle}"
        </p>
      </div>

      {/* Story & Location Reveal */}
      {showStory && (
        <>
          {/* Target Location */}
          <div className="terminal-box p-4 mb-4 border-primary/50 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-xs text-primary tracking-widest">{t('target_location')}</span>
            </div>
            <p className="text-sm text-foreground font-mono">
              {level.location}
            </p>
          </div>
          
          {/* Story/Narrative */}
          <div className="terminal-box p-4 mb-4 border-secondary/50 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-secondary" />
              <span className="text-xs text-secondary tracking-widest">{t('narrative_unlocked')}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {level.storyDecryption}
            </p>
          </div>
        </>
      )}

      {/* Chat Area */}
      <div className="flex-1 terminal-box p-4 flex flex-col min-h-[200px]">
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
                <span className="text-xs text-primary block mb-1">CHRONOS:</span>
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
              placeholder={t('enter_answer')}
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
            {t('proceed_extraction')}
          </Button>
        )}
      </div>

      {/* Attempts Counter */}
      <div className="text-center text-xs text-muted-foreground/60 mt-3 font-mono">
        <div className="flex items-center justify-center gap-2">
          <AlertCircle className="w-3 h-3" />
          <span>{t('decryption_attempts')}: {attempts}</span>
        </div>
      </div>
    </div>
  );
};

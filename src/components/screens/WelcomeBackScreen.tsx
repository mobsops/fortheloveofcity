import { Button } from '@/components/ui/button';
import { Play, RotateCcw, User } from 'lucide-react';
import { GlitchText } from '@/components/GlitchText';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useLanguage } from '@/contexts/LanguageContext';

interface WelcomeBackScreenProps {
  username: string;
  currentLevel: number;
  currentPhase: 'decryption' | 'extraction';
  totalPoints?: number;
  onResume: () => void;
  onRestart: () => void;
}

export const WelcomeBackScreen = ({ 
  username, 
  currentLevel, 
  currentPhase,
  totalPoints = 0,
  onResume, 
  onRestart 
}: WelcomeBackScreenProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary mx-auto mb-6 flex items-center justify-center animate-pulse-glow">
          <User className="w-10 h-10 text-primary" />
        </div>

        {/* Welcome Message */}
        <div className="mb-6">
          <div className="text-xs text-muted-foreground tracking-widest mb-2">
            TEMPORAL LINK DETECTED
          </div>
          <GlitchText as="h1" className="text-2xl md:text-3xl glow-text-cyan mb-4">
            {t('welcome_back')}
          </GlitchText>
          <h2 className="font-display text-xl text-secondary">
            {t('agent')} {username.toUpperCase()}
          </h2>
        </div>

        {/* Language Selector */}
        <LanguageSelector />

        {/* Session Info */}
        <div className="terminal-box p-6 mb-8">
          <div className="text-xs text-muted-foreground tracking-widest mb-4">
            {t('session_recovered')}
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-primary/20">
              <span className="text-muted-foreground text-sm">{t('points')}</span>
              <span className={`font-mono ${totalPoints >= 4.0 ? 'text-accent' : 'text-primary'}`}>
                {totalPoints.toFixed(1)} / 4.0
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-primary/20">
              <span className="text-muted-foreground text-sm">{t('status')}</span>
              <span className="text-secondary font-mono uppercase">{currentPhase}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground text-sm">{t('progress')}</span>
              <span className={`font-mono ${totalPoints >= 4.0 ? 'text-accent' : 'text-secondary'}`}>
                {totalPoints >= 4.0 ? t('complete') : t('in_progress')}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button 
            variant="terminal" 
            size="lg"
            onClick={onResume}
            className="w-full animate-pulse-glow"
          >
            <Play className="w-5 h-5 mr-2" />
            {t('continue_mission')}
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            onClick={onRestart}
            className="w-full border-muted-foreground/30 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            {t('new_session')}
          </Button>
        </div>

        {/* Status */}
        <div className="mt-6 text-xs text-muted-foreground/60 font-mono">
          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span>TEMPORAL SIGNATURE MATCHED</span>
          </div>
        </div>
      </div>
    </div>
  );
};

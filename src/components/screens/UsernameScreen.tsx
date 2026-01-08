import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TerminalText } from '@/components/TerminalText';
import { GlitchText } from '@/components/GlitchText';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useLanguage } from '@/contexts/LanguageContext';

interface UsernameScreenProps {
  onSubmit: (username: string) => void;
}

export const UsernameScreen = ({ onSubmit }: UsernameScreenProps) => {
  const [username, setUsername] = useState('');
  const [showInput, setShowInput] = useState(false);
  const { t, language } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onSubmit(username.trim());
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center mb-8">
        <GlitchText as="h1" className="text-4xl md:text-6xl glow-text-cyan mb-4">
          {t('title')}
        </GlitchText>
        <div className="text-muted-foreground text-sm tracking-widest">
          <TerminalText 
            text={t('subtitle')} 
            delay={30}
            onComplete={() => setTimeout(() => setShowInput(true), 500)}
            key={language} // Re-animate when language changes
          />
        </div>
      </div>

      {showInput && (
        <div className="w-full max-w-md animate-fade-in-up">
          <LanguageSelector />
          
          <div className="terminal-box p-6">
            <div className="text-primary/70 text-xs mb-4 tracking-wider">
              {'>'} {t('identity_required')}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground tracking-wider">
                  {t('traveler_id')}
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t('enter_designation')}
                  className="w-full px-4 py-3 terminal-input rounded font-mono text-lg tracking-wide"
                  autoFocus
                />
              </div>

              <Button 
                type="submit" 
                variant="terminal" 
                size="lg"
                className="w-full"
                disabled={!username.trim()}
              >
                {t('initialize_session')}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-primary/20">
              <div className="text-xs text-muted-foreground/60 font-mono">
                <div>{t('status_awaiting')}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span>{t('temporal_bridge')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import { GlitchText } from '@/components/GlitchText';
import { Button } from '@/components/ui/button';
import { RotateCcw, Trophy, Shield } from 'lucide-react';

interface CompletionScreenProps {
  username: string;
  onRestart: () => void;
}

export const CompletionScreen = ({ username, onRestart }: CompletionScreenProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl text-center">
        {/* Success Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto rounded-full bg-accent/20 flex items-center justify-center animate-pulse-glow border-2 border-accent">
            <Trophy className="w-12 h-12 text-accent" />
          </div>
        </div>

        {/* Title */}
        <GlitchText as="h1" className="text-3xl md:text-5xl glow-text-green mb-4">
          TIMELINE SECURED
        </GlitchText>
        
        <div className="text-muted-foreground mb-8 max-w-md mx-auto">
          <p className="mb-4">
            Congratulations, <span className="text-primary">{username}</span>.
          </p>
          <p className="text-sm">
            You have successfully sealed all temporal fractures. The burnt reality 
            has been averted. The future thanks you.
          </p>
        </div>

        {/* Stats */}
        <div className="terminal-box p-6 mb-8">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-display text-accent mb-1">7</div>
              <div className="text-xs text-muted-foreground">LEVELS COMPLETED</div>
            </div>
            <div>
              <div className="text-3xl font-display text-primary mb-1">
                <Shield className="w-8 h-8 mx-auto" />
              </div>
              <div className="text-xs text-muted-foreground">TIMELINE PROTECTED</div>
            </div>
            <div>
              <div className="text-3xl font-display text-secondary mb-1">∞</div>
              <div className="text-xs text-muted-foreground">FUTURES SAVED</div>
            </div>
          </div>
        </div>

        {/* Certificate */}
        <div className="border border-accent/30 rounded p-6 bg-accent/5 mb-8">
          <div className="text-xs text-accent tracking-widest mb-2">
            TEMPORAL CERTIFICATE
          </div>
          <div className="font-display text-xl glow-text-green mb-2">
            TIME TRAVELER: VERIFIED
          </div>
          <div className="text-muted-foreground text-sm">
            {username.toUpperCase()} | ID: {Date.now().toString(36).toUpperCase()}
          </div>
        </div>

        {/* Restart */}
        <Button variant="terminal" size="lg" onClick={onRestart}>
          <RotateCcw className="w-5 h-5 mr-2" />
          NEW TIMELINE
        </Button>
      </div>
    </div>
  );
};

import { cn } from '@/lib/utils';
import { AlertTriangle, Shield, Zap } from 'lucide-react';
import { REQUIRED_STABILITY } from '@/data/levels';

interface StabilityMeterProps {
  currentPoints: number;
  className?: string;
}

export const StabilityMeter = ({ currentPoints, className }: StabilityMeterProps) => {
  const percentage = Math.min((currentPoints / REQUIRED_STABILITY) * 100, 100);
  const isStable = currentPoints >= REQUIRED_STABILITY;
  const isWarning = currentPoints >= 3.5 && currentPoints < REQUIRED_STABILITY;

  return (
    <div className={cn("terminal-box p-4", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isStable ? (
            <Shield className="w-5 h-5 text-accent" />
          ) : isWarning ? (
            <AlertTriangle className="w-5 h-5 text-secondary animate-pulse" />
          ) : (
            <Zap className="w-5 h-5 text-primary" />
          )}
          <span className="text-xs tracking-widest text-muted-foreground">
            TIMELINE STABILITY
          </span>
        </div>
        <div className={cn(
          "font-mono text-lg font-bold",
          isStable ? "text-accent glow-text-green" : isWarning ? "text-secondary" : "text-primary"
        )}>
          {currentPoints.toFixed(1)} / {REQUIRED_STABILITY.toFixed(1)}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-4 bg-muted rounded-full overflow-hidden border border-primary/20">
        <div 
          className={cn(
            "absolute inset-y-0 left-0 transition-all duration-500 rounded-full",
            isStable 
              ? "bg-accent" 
              : isWarning 
                ? "bg-gradient-to-r from-secondary to-accent"
                : "bg-gradient-to-r from-primary to-secondary"
          )}
          style={{ width: `${percentage}%` }}
        />
        {/* Threshold marker at 4.0 */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-foreground/50"
          style={{ left: '100%' }}
        />
      </div>

      {/* Warning Message */}
      {isWarning && (
        <div className="mt-3 p-2 bg-secondary/10 rounded border border-secondary/30 text-xs text-secondary">
          <AlertTriangle className="w-3 h-3 inline mr-1" />
          Timeline Unstable ({currentPoints.toFixed(1)}/{REQUIRED_STABILITY.toFixed(1)}). Physical intervention required at one location to anchor the reality.
        </div>
      )}

      {isStable && (
        <div className="mt-3 p-2 bg-accent/10 rounded border border-accent/30 text-xs text-accent">
          <Shield className="w-3 h-3 inline mr-1" />
          Timeline stabilized! The city is anchored across all temporal nodes.
        </div>
      )}
    </div>
  );
};

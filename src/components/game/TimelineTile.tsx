import { cn } from '@/lib/utils';
import { Lock, Unlock, Check, MapPin } from 'lucide-react';
import { Level } from '@/data/levels';

export type TileStatus = 'locked' | 'decrypted' | 'extracted';

interface TimelineTileProps {
  level: Level;
  status: TileStatus;
  onClick: () => void;
  disabled?: boolean;
}

export const TimelineTile = ({ level, status, onClick, disabled }: TimelineTileProps) => {
  const isLocked = status === 'locked';
  const isDecrypted = status === 'decrypted';
  const isExtracted = status === 'extracted';

  return (
    <button
      onClick={onClick}
      disabled={disabled || isExtracted}
      className={cn(
        "terminal-box p-4 text-left transition-all duration-300 group relative overflow-hidden",
        isExtracted && "border-accent/50 bg-accent/5",
        isDecrypted && "border-secondary/50 bg-secondary/5",
        isLocked && "border-primary/30 hover:border-primary/60",
        !disabled && !isExtracted && "hover:scale-[1.02] cursor-pointer",
        (disabled || isExtracted) && "cursor-default"
      )}
    >
      {/* Status Icon */}
      <div className={cn(
        "absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center",
        isExtracted && "bg-accent/20",
        isDecrypted && "bg-secondary/20",
        isLocked && "bg-primary/20"
      )}>
        {isExtracted ? (
          <Check className="w-4 h-4 text-accent" />
        ) : isDecrypted ? (
          <MapPin className="w-4 h-4 text-secondary" />
        ) : (
          <Lock className="w-4 h-4 text-primary" />
        )}
      </div>

      {/* Era Badge - Hidden until decrypted */}
      <div className={cn(
        "text-[10px] tracking-widest font-mono mb-2",
        isExtracted ? "text-accent" : isDecrypted ? "text-secondary" : "text-primary"
      )}>
        {(isDecrypted || isExtracted) ? level.era : "████████"}
      </div>

      {/* Title */}
      <h3 className={cn(
        "font-display text-sm md:text-base mb-2 pr-10",
        isExtracted ? "text-accent glow-text-green" : isDecrypted ? "text-secondary glow-text-amber" : "text-foreground"
      )}>
        {level.name}
      </h3>

      {/* Status Label */}
      <div className={cn(
        "text-[10px] tracking-wider font-mono",
        isExtracted ? "text-accent/80" : isDecrypted ? "text-secondary/80" : "text-muted-foreground"
      )}>
        {isExtracted ? "FULLY STABILIZED" : isDecrypted ? "SIGNAL IDENTIFIED" : "UNSTABLE NODE"}
      </div>

      {/* Progress Indicator */}
      <div className="mt-3 flex gap-1">
        <div className={cn(
          "h-1 flex-1 rounded-full",
          (isDecrypted || isExtracted) ? "bg-secondary" : "bg-muted"
        )} />
        <div className={cn(
          "h-1 flex-1 rounded-full",
          isExtracted ? "bg-accent" : "bg-muted"
        )} />
      </div>

      {/* Points Display */}
      <div className="mt-2 flex justify-between text-[10px] font-mono text-muted-foreground">
        <span>+0.5 decrypt</span>
        <span>+0.5 extract</span>
      </div>

      {/* Hover Effect */}
      {!isExtracted && !disabled && (
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      )}
    </button>
  );
};

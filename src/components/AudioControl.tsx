import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AudioControlProps {
  isMuted: boolean;
  isLoading?: boolean;
  onToggle: () => void;
}

export const AudioControl = ({ isMuted, isLoading, onToggle }: AudioControlProps) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      disabled={isLoading}
      className="fixed top-4 right-4 z-50 bg-background/50 backdrop-blur-sm border border-primary/30 hover:border-primary hover:bg-primary/10"
      title={isMuted ? 'Unmute' : 'Mute'}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
      ) : isMuted ? (
        <VolumeX className="w-5 h-5 text-muted-foreground" />
      ) : (
        <Volume2 className="w-5 h-5 text-primary animate-pulse" />
      )}
    </Button>
  );
};

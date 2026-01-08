import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AudioControlProps {
  isMuted: boolean;
  onToggle: () => void;
}

export const AudioControl = ({ isMuted, onToggle }: AudioControlProps) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      className="fixed top-4 right-4 z-50 bg-background/50 backdrop-blur-sm border border-primary/30 hover:border-primary hover:bg-primary/10"
      title={isMuted ? 'Unmute' : 'Mute'}
    >
      {isMuted ? (
        <VolumeX className="w-5 h-5 text-muted-foreground" />
      ) : (
        <Volume2 className="w-5 h-5 text-primary animate-pulse" />
      )}
    </Button>
  );
};

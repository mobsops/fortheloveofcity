import { GlitchText } from '@/components/GlitchText';
import { StabilityMeter } from './StabilityMeter';
import { TimelineTile, TileStatus } from './TimelineTile';
import { LEVELS, Level, REQUIRED_STABILITY, DECRYPTION_POINTS, EXTRACTION_POINTS } from '@/data/levels';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

export interface NodeProgress {
  decrypted: boolean;
  extracted: boolean;
}

interface TimelineDashboardProps {
  username: string;
  nodeProgress: Record<number, NodeProgress>;
  onSelectNode: (level: Level) => void;
  onComplete: () => void;
}

export const TimelineDashboard = ({
  username,
  nodeProgress,
  onSelectNode,
  onComplete
}: TimelineDashboardProps) => {
  // Calculate total points
  const calculatePoints = (): number => {
    let points = 0;
    Object.values(nodeProgress).forEach(progress => {
      if (progress.decrypted) points += DECRYPTION_POINTS;
      if (progress.extracted) points += EXTRACTION_POINTS;
    });
    return points;
  };

  const currentPoints = calculatePoints();
  const isComplete = currentPoints >= REQUIRED_STABILITY;

  const getTileStatus = (levelId: number): TileStatus => {
    const progress = nodeProgress[levelId];
    if (!progress) return 'locked';
    if (progress.extracted) return 'extracted';
    if (progress.decrypted) return 'decrypted';
    return 'locked';
  };

  const handleTileClick = (level: Level) => {
    const status = getTileStatus(level.id);
    if (status !== 'extracted') {
      onSelectNode(level);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-6">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="text-xs text-muted-foreground tracking-widest mb-1">
          AGENT: {username.toUpperCase()} | MISSION: TIMELINE REPAIR
        </div>
        <GlitchText as="h1" className="text-xl md:text-2xl glow-text-cyan">
          MOSCOW TIMELINE NODES
        </GlitchText>
        <p className="text-xs text-muted-foreground mt-2">
          Stabilize fractured temporal nodes. Each node requires DECRYPTION (remote) and EXTRACTION (on-site).
        </p>
      </div>

      {/* Stability Meter */}
      <StabilityMeter currentPoints={currentPoints} className="mb-6" />

      {/* Timeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
        {LEVELS.map((level) => (
          <TimelineTile
            key={level.id}
            level={level}
            status={getTileStatus(level.id)}
            onClick={() => handleTileClick(level)}
          />
        ))}
      </div>

      {/* Complete Button */}
      {isComplete && (
        <div className="mt-6 animate-fade-in-up">
          <Button
            variant="terminal"
            size="lg"
            onClick={onComplete}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground animate-pulse-glow"
          >
            <Shield className="w-5 h-5 mr-2" />
            FINALIZE TIMELINE RESTORATION
          </Button>
        </div>
      )}

      {/* Stats Footer */}
      <div className="mt-4 flex justify-center gap-6 text-xs font-mono text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-secondary" />
          <span>DECRYPTED</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-accent" />
          <span>EXTRACTED</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-muted" />
          <span>UNSTABLE</span>
        </div>
      </div>
    </div>
  );
};

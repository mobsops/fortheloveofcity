import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GlitchText } from '@/components/GlitchText';
import { ScanlineOverlay } from '@/components/ScanlineOverlay';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Trophy, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdminLogin } from '@/components/admin/AdminLogin';

interface GameSessionData {
  id: string;
  username: string;
  total_points: number;
  decrypted_levels: number[];
  completed_levels: number[];
  current_level: number;
  current_phase: string;
  created_at: string;
  updated_at: string;
}

const Admin = () => {
  const [sessions, setSessions] = useState<GameSessionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already authenticated
    const token = sessionStorage.getItem('admin_token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSessions();
    }
  }, [isAuthenticated]);

  const fetchSessions = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('game_sessions')
      .select('*')
      .order('total_points', { ascending: false });

    if (error) {
      console.error('Error fetching sessions:', error);
    } else {
      setSessions(data as GameSessionData[]);
    }
    setIsLoading(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated) {
    return <AdminLogin onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <ScanlineOverlay />
      
      <div className="relative z-10 p-4 md:p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <GlitchText as="h1" className="text-xl md:text-2xl glow-text-cyan">
              ADMIN CONSOLE
            </GlitchText>
            <p className="text-xs text-muted-foreground tracking-widest">
              TIMELINE AGENT MONITORING
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="terminal-box p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <div className="text-2xl font-display text-primary glow-text-cyan">
                  {sessions.length}
                </div>
                <div className="text-xs text-muted-foreground">TOTAL AGENTS</div>
              </div>
            </div>
          </div>
          <div className="terminal-box p-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-accent" />
              <div>
                <div className="text-2xl font-display text-accent glow-text-green">
                  {sessions.filter(s => s.total_points >= 4.0).length}
                </div>
                <div className="text-xs text-muted-foreground">MISSIONS COMPLETE</div>
              </div>
            </div>
          </div>
          <div className="terminal-box p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-secondary" />
              <div>
                <div className="text-2xl font-display text-secondary glow-text-amber">
                  {sessions.filter(s => s.total_points > 0 && s.total_points < 4.0).length}
                </div>
                <div className="text-xs text-muted-foreground">IN PROGRESS</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sessions Table */}
        <div className="terminal-box overflow-hidden">
          <div className="p-4 border-b border-primary/30">
            <h2 className="text-sm font-mono text-primary tracking-wider">
              AGENT PROGRESS LOG
            </h2>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              <div className="animate-pulse">LOADING DATA...</div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              NO AGENTS REGISTERED
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/20">
                  <tr className="text-left text-xs text-muted-foreground tracking-wider">
                    <th className="p-3">AGENT</th>
                    <th className="p-3">POINTS</th>
                    <th className="p-3">DECRYPTED</th>
                    <th className="p-3">EXTRACTED</th>
                    <th className="p-3">STATUS</th>
                    <th className="p-3">LAST ACTIVE</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr 
                      key={session.id} 
                      className="border-t border-muted/20 hover:bg-muted/10 transition-colors"
                    >
                      <td className="p-3 font-mono text-foreground">
                        {session.username.toUpperCase()}
                      </td>
                      <td className="p-3">
                        <span className={`font-display ${
                          session.total_points >= 4.0 
                            ? 'text-accent glow-text-green' 
                            : session.total_points > 0 
                              ? 'text-secondary glow-text-amber' 
                              : 'text-muted-foreground'
                        }`}>
                          {session.total_points.toFixed(1)} / 4.0
                        </span>
                      </td>
                      <td className="p-3 text-secondary">
                        {session.decrypted_levels.length} / 7
                      </td>
                      <td className="p-3 text-accent">
                        {session.completed_levels.length} / 7
                      </td>
                      <td className="p-3">
                        {session.total_points >= 4.0 ? (
                          <span className="text-xs px-2 py-1 bg-accent/20 text-accent rounded">
                            COMPLETE
                          </span>
                        ) : session.total_points > 0 ? (
                          <span className="text-xs px-2 py-1 bg-secondary/20 text-secondary rounded">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 bg-muted/20 text-muted-foreground rounded">
                            NEW
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-muted-foreground text-xs">
                        {formatDate(session.updated_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <div className="mt-4 text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSessions}
            className="text-xs tracking-wider"
          >
            REFRESH DATA
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Admin;

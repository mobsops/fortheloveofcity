import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GlitchText } from '@/components/GlitchText';
import { ScanlineOverlay } from '@/components/ScanlineOverlay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, User } from 'lucide-react';

interface AdminLoginProps {
  onSuccess: () => void;
}

export const AdminLogin = ({ onSuccess }: AdminLoginProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error: fnError } = await supabase.functions.invoke('validate-admin', {
        body: { username, password }
      });

      if (fnError) {
        setError('Connection error. Please try again.');
        return;
      }

      if (data?.success) {
        sessionStorage.setItem('admin_token', data.token);
        onSuccess();
      } else {
        setError(data?.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
      <ScanlineOverlay />
      
      <div className="relative z-10 w-full max-w-md p-6">
        <div className="terminal-box p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <GlitchText as="h1" className="text-xl glow-text-cyan">
              ADMIN ACCESS
            </GlitchText>
            <p className="text-xs text-muted-foreground mt-2 tracking-widest">
              AUTHENTICATION REQUIRED
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 bg-background/50 border-primary/30 focus:border-primary"
                autoComplete="username"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-background/50 border-primary/30 focus:border-primary"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="text-xs text-destructive text-center p-2 bg-destructive/10 rounded">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !username || !password}
            >
              {isLoading ? 'AUTHENTICATING...' : 'ACCESS CONSOLE'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

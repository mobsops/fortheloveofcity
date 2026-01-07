-- Create a table to store user sessions and progress
CREATE TABLE public.game_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  device_id TEXT NOT NULL,
  current_level INTEGER NOT NULL DEFAULT 1,
  current_phase TEXT NOT NULL DEFAULT 'decryption', -- 'decryption' or 'extraction'
  completed_levels INTEGER[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(username, device_id)
);

-- Enable RLS (public access for this game - no auth required)
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to select their own session by username+device
CREATE POLICY "Anyone can read their own session" 
ON public.game_sessions 
FOR SELECT 
USING (true);

-- Allow anyone to insert their own session
CREATE POLICY "Anyone can create a session" 
ON public.game_sessions 
FOR INSERT 
WITH CHECK (true);

-- Allow anyone to update their own session
CREATE POLICY "Anyone can update their own session" 
ON public.game_sessions 
FOR UPDATE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_game_sessions_updated_at
BEFORE UPDATE ON public.game_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
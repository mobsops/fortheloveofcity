import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username, password } = await req.json();
    
    const adminUsername = Deno.env.get('ADMIN_USERNAME');
    const adminPassword = Deno.env.get('ADMIN_PASSWORD');

    console.log('Admin login attempt for username:', username);

    if (!adminUsername || !adminPassword) {
      console.error('Admin credentials not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Admin credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (username === adminUsername && password === adminPassword) {
      console.log('Admin login successful');
      // Generate a simple session token
      const sessionToken = crypto.randomUUID();
      return new Response(
        JSON.stringify({ success: true, token: sessionToken }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Admin login failed - invalid credentials');
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid credentials' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in validate-admin:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Optimized prompt for Nano Banana
const APOCALYPTIC_PROMPT = `Photorealistic cinematic wide shot. A catastrophic post-apocalyptic scene based on the provided image. Deep tectonic fissures splitting the asphalt roads. Structural collapses of skyscrapers with exposed rebar and crumbling concrete. Intense fireballs and volumetric thick black smoke billowing into a dark, smog-filled sky. An eerie, high-contrast orange-red glow illuminating the chaos. Sharp details on debris, dust, and wreckage. High dynamic range, hyper-detailed textures, 8k resolution, disaster movie aesthetic.`;

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { images } = await req.json();
    
    if (!images || !Array.isArray(images) || images.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No images provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured in environment variables');
    }

    console.log(`Starting apocalyptic transformation for ${images.length} images...`);

    // Helper function to call the Nano Banana (Gemini) model
    const transformImage = async (imageUrl: string) => {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image", // This is the official Nano Banana model ID
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: APOCALYPTIC_PROMPT },
                { type: "image_url", image_url: { url: imageUrl } }
              ]
            }
          ],
          modalities: ["image"]
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Model Error:", errorText);
        return imageUrl; // Return original if error occurs
      }

      const data = await response.json();
      // Extract the generated image URL
      return data.choices?.[0]?.message?.images?.[0]?.image_url?.url || imageUrl;
    };

    // Process all images at once
    const transformedImages = await Promise.all(
      images.map(url => transformImage(url))
    );

    return new Response(
      JSON.stringify({ 
        success: true, 
        transformedImages,
        message: "Transformation complete" 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Execution Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
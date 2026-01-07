import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Optimized prompt for Nano Banana - more specific for consistent results
const APOCALYPTIC_PROMPT = `Transform this image into a photorealistic post-apocalyptic scene. Add the following elements:
- Deep cracks and fissures in roads and ground
- Collapsed or damaged buildings with exposed structure
- Intense orange-red glow from fires in the sky
- Thick black smoke and haze in the atmosphere
- Debris, rubble, and destruction throughout
- Dark, ominous sky with smog
Keep the original composition and landmarks recognizable but devastated.
Style: Cinematic disaster movie, 8k resolution, hyper-detailed textures, high dynamic range.`;

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

    // Helper function to call the Nano Banana (Gemini) model with retry logic
    const transformImage = async (imageUrl: string, index: number): Promise<{ success: boolean; result: string }> => {
      console.log(`Transforming image ${index + 1}...`);
      
      try {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image",
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: APOCALYPTIC_PROMPT },
                  { type: "image_url", image_url: { url: imageUrl } }
                ]
              }
            ],
            modalities: ["image", "text"]
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Image ${index + 1} API error (${response.status}):`, errorText);
          return { success: false, result: imageUrl };
        }

        const data = await response.json();
        console.log(`Image ${index + 1} response received:`, JSON.stringify(data).substring(0, 200));
        
        // Extract the generated image URL from the response
        const generatedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        
        if (generatedImageUrl) {
          console.log(`Image ${index + 1} transformed successfully`);
          return { success: true, result: generatedImageUrl };
        } else {
          console.log(`Image ${index + 1} no image in response, using original`);
          return { success: false, result: imageUrl };
        }
      } catch (err) {
        console.error(`Image ${index + 1} transform error:`, err);
        return { success: false, result: imageUrl };
      }
    };

    // Process images sequentially to avoid rate limits
    const results: { success: boolean; result: string }[] = [];
    for (let i = 0; i < images.length; i++) {
      const result = await transformImage(images[i], i);
      results.push(result);
      
      // Small delay between requests to avoid rate limiting
      if (i < images.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    const transformedImages = results.map(r => r.result);
    const successCount = results.filter(r => r.success).length;
    
    console.log(`Transformation complete: ${successCount}/${images.length} images successfully transformed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        transformedImages,
        stats: {
          total: images.length,
          transformed: successCount,
          fallback: images.length - successCount
        },
        message: `${successCount}/${images.length} images transformed` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Execution Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

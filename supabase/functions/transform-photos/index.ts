import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const APOCALYPTIC_PROMPT = `Transform this image into a post-apocalyptic disaster scene. 
The streets should be splitting apart with massive cracks and chasms. 
All buildings should be crumbling, falling down, and catching fire with intense flames and smoke.
The sky should be dark and ominous with an orange/red glow from the fires.
If there are any people in the image, show them running in panic and terror.
Add debris, destruction, smoke, and chaos everywhere.
Make it look like the end of the world is happening.
Ultra high resolution, cinematic quality, dramatic lighting.`;

serve(async (req) => {
  // Handle CORS preflight requests
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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`Processing ${images.length} images with apocalyptic transformation...`);

    const transformedImages: string[] = [];

    for (let i = 0; i < images.length; i++) {
      console.log(`Transforming image ${i + 1}/${images.length}...`);
      
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: APOCALYPTIC_PROMPT
                },
                {
                  type: "image_url",
                  image_url: {
                    url: images[i]
                  }
                }
              ]
            }
          ],
          modalities: ["image", "text"]
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`AI gateway error for image ${i + 1}:`, response.status, errorText);
        
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: 'Payment required. Please add credits to continue.' }),
            { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        throw new Error(`Failed to transform image ${i + 1}`);
      }

      const data = await response.json();
      console.log(`Image ${i + 1} response received`);
      
      const generatedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
      if (generatedImageUrl) {
        transformedImages.push(generatedImageUrl);
        console.log(`Image ${i + 1} transformed successfully`);
      } else {
        console.warn(`No image generated for image ${i + 1}, using original`);
        transformedImages.push(images[i]);
      }
    }

    console.log(`All ${transformedImages.length} images processed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        transformedImages,
        message: `Successfully transformed ${transformedImages.length} images into apocalyptic scenes`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Transform photos error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

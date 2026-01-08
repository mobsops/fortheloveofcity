import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to send Email (Using Resend API)
async function sendToOperator(photoBase64: string, target: string, aiResult: { isMatch: boolean; comment: string }) {
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  if (!RESEND_API_KEY) {
    console.log('RESEND_API_KEY not configured, skipping email');
    return;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Protocol_Omega <onboarding@resend.dev>',
        to: ['mobthomas@gmail.com'],
        subject: `EVIDENCE SUBMITTED: ${target}`,
        html: `
          <h1>New Mission Evidence</h1>
          <p><strong>Target:</strong> ${target}</p>
          <p><strong>AI Verdict:</strong> ${aiResult.isMatch ? 'MATCH ✓' : 'FAIL ✗'}</p>
          <p><strong>AI Comment:</strong> "${aiResult.comment}"</p>
          <p>See attached photo.</p>
        `,
        attachments: [
          {
            filename: 'evidence.jpg',
            content: photoBase64.replace(/^data:image\/\w+;base64,/, ""),
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Email send failed:', errorText);
    } else {
      console.log('Email sent successfully to operator');
    }
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { photoBase64, targetLandmark } = await req.json();

    if (!photoBase64 || !targetLandmark) {
      throw new Error('Missing required fields: photoBase64 and targetLandmark');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // --- STEP A: AI VERIFICATION (Using Lovable AI with Gemini) ---
    const prompt = `You are the Chronos Daemon, a deceptive trickster AI trapped in the machine.
Check if this image clearly shows: "${targetLandmark}".

RULES:
1. If the image CLEARLY shows the landmark "${targetLandmark}" or something unmistakably recognizable as that location, return TRUE. Be angry/grudging about it. Say things like "Fine. You found it. I was hoping you'd fail."
2. If the image does NOT show the landmark, return FALSE. Mock them creatively and insult their attempt. Be playful but mean.
3. If the image is blurry, dark, or unclear, return FALSE. Insult their camera or photography skills.
4. NEVER reveal what you're looking for if they got it wrong.

OUTPUT: Return ONLY a valid JSON object. No markdown, no extra text.
{ "isMatch": boolean, "comment": string }`;

    // Prepare the base64 image data
    const imageData = photoBase64.replace(/^data:image\/\w+;base64,/, "");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageData}`
                }
              }
            ]
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Rate limit exceeded. Please try again in a moment.",
          isMatch: false,
          comment: "The Moscow Grid is overloaded. Try again, mortal."
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "Service temporarily unavailable.",
          isMatch: false,
          comment: "The Chronos Daemon sleeps... (Service unavailable)"
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      throw new Error(`AI gateway returned ${response.status}`);
    }

    const data = await response.json();
    const aiResponseText = data.choices?.[0]?.message?.content || '';
    
    console.log("AI Response:", aiResponseText);

    // Parse the JSON response
    let aiData: { isMatch: boolean; comment: string };
    try {
      // Clean up the response - remove markdown code blocks if present
      const cleanJson = aiResponseText.replace(/```json\s*|\s*```/g, '').trim();
      aiData = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiResponseText);
      // Fallback response
      aiData = {
        isMatch: false,
        comment: "The Chronos Daemon is confused by your offering. Try again with a clearer image."
      };
    }

    // --- STEP B: SEND TO OPERATOR (ASYNC) ---
    // Don't await - let it run in background
    sendToOperator(photoBase64, targetLandmark, aiData).catch(console.error);

    return new Response(JSON.stringify(aiData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('verify-location error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      isMatch: false,
      comment: "A glitch in the Moscow Grid... Try again."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

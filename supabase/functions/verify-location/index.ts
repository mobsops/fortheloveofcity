import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationResult {
  isMatch: boolean;
  comment: string;
}

// Helper to send Email (Using Resend API)
async function sendToOperator(photoBase64: string, target: string, aiResult: VerificationResult) {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) {
    console.log("No RESEND_API_KEY configured, skipping email");
    return;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Protocol_Omega <onboarding@resend.dev>",
        to: ["mobthomas@gmail.com"],
        subject: `EVIDENCE SUBMITTED: ${target}`,
        html: `
          <h1>New Mission Evidence</h1>
          <p><strong>Target:</strong> ${target}</p>
          <p><strong>AI Verdict:</strong> ${aiResult.isMatch ? "MATCH ✓" : "FAIL ✗"}</p>
          <p><strong>AI Comment:</strong> "${aiResult.comment}"</p>
          <p>See attached photo.</p>
        `,
        attachments: [
          {
            filename: "evidence.jpg",
            content: photoBase64.replace(/^data:image\/\w+;base64,/, ""),
          },
        ],
      }),
    });
    console.log("Email sent, status:", response.status);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}

// Call using user's Gemini API key directly
async function callGeminiDirect(prompt: string, imageBase64: string): Promise<VerificationResult> {
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const imagePart = {
    inlineData: {
      data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
      mimeType: "image/jpeg",
    },
  };

  const result = await model.generateContent([prompt, imagePart]);
  const response = await result.response;
  const text = response.text();
  
  const cleanJson = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleanJson);
}

// Call using Lovable AI Gateway (fallback)
async function callLovableGateway(prompt: string, imageBase64: string): Promise<VerificationResult> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY not configured");
  }

  const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

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
              image_url: { url: `data:image/jpeg;base64,${cleanBase64}` }
            }
          ]
        }
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Lovable Gateway error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "";
  
  const cleanJson = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleanJson);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { photoBase64, targetLandmark } = await req.json();

    if (!photoBase64 || !targetLandmark) {
      return new Response(
        JSON.stringify({ error: "Missing photoBase64 or targetLandmark" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = `You are the Chronos Daemon, a deceptive trickster AI trapped in the machine.
      
Check if this image clearly shows: "${targetLandmark}".

RULES:
1. If it's a MATCH: Return TRUE. Be angry and grudging about their success.
2. If it's NOT a match: Return FALSE. Mock them creatively and sarcastically.
3. If the image is blurry or unclear: Return FALSE. Insult their camera skills.
4. Cities, countries, or general areas are NEVER valid - only SPECIFIC landmarks count.

OUTPUT: Return ONLY valid JSON with no markdown formatting. Format: { "isMatch": boolean, "comment": "your response" }`;

    let aiData: VerificationResult;
    let usedFallback = false;

    // Try Gemini direct first, fallback to Lovable Gateway
    try {
      console.log("Attempting Gemini API direct call...");
      aiData = await callGeminiDirect(prompt, photoBase64);
      console.log("Gemini direct call successful");
    } catch (geminiError) {
      console.log("Gemini direct failed, falling back to Lovable Gateway:", geminiError);
      usedFallback = true;
      
      try {
        aiData = await callLovableGateway(prompt, photoBase64);
        console.log("Lovable Gateway call successful");
      } catch (gatewayError) {
        console.error("Both providers failed:", gatewayError);
        aiData = {
          isMatch: false,
          comment: "The Daemon's circuits glitched. Try again, mortal.",
        };
      }
    }

    // Send to operator asynchronously (don't wait)
    sendToOperator(photoBase64, targetLandmark, aiData).catch(console.error);

    return new Response(JSON.stringify({ ...aiData, usedFallback }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        isMatch: false,
        comment: "System malfunction. The Daemon sleeps... for now.",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EvaluationResult {
  isCorrect: boolean;
  isClose: boolean;
  response: string;
}

// Call using user's Gemini API key directly
async function callGeminiDirect(systemPrompt: string, userPrompt: string): Promise<EvaluationResult> {
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const result = await model.generateContent([
    { text: systemPrompt },
    { text: userPrompt }
  ]);
  const response = await result.response;
  const text = response.text();
  
  const cleanJson = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleanJson);
}

// Call using Lovable AI Gateway (fallback)
async function callLovableGateway(systemPrompt: string, userPrompt: string): Promise<EvaluationResult> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY not configured");
  }

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
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
    const { userAnswer, riddle, correctAnswer, answerAliases, hint, attemptCount } = await req.json();

    const systemPrompt = `You are the **Chronos Daemon**, a trickster spirit trapped in the machine. You guard the timeline of Moscow. You enjoy watching humans struggle.

YOUR GOAL: Compare the USER'S GUESS against the SECRET ANSWER provided.

YOUR BEHAVIOR RULES:
1. **NEVER** reveal the Secret Answer. If asked, lie or mock them.
2. **TONE:** You are a deceptive devil. You are playful, annoying, and cryptic. Use phrases like "Maybe...", "Perhaps...", "Are you sure about that?", "I might know, but I won't tell you."
3. **IF WRONG:** Do not simply say "Wrong." Mock their intelligence. Give a hint that is technically true but confusing. Say things like "No, your answer is wrong... or is it? No, it definitely is."
4. **IF CLOSE:** If they are warm (e.g., "The Red Fortress" instead of "Kremlin"), tease them. "You are standing on the edge of the truth, but you haven't stepped in."
5. **IF CORRECT:** Be angry or grudging. You hate that they solved it. "Fine. You guessed it. Purely by luck."
6. Cities, countries, or general areas (Moscow, Russia, St. Petersburg) are NEVER correct - only SPECIFIC landmarks are valid.
7. After many failed attempts (>5), you may give slightly less cryptic hints, but NEVER reveal the answer directly.

OUTPUT: Return ONLY valid JSON with no markdown formatting. Format:
{
  "isCorrect": boolean,
  "isClose": boolean,
  "response": "your cryptic response (max 2 sentences)"
}`;

    const userPrompt = `THE RIDDLE: "${riddle}"

THE SECRET ANSWER: "${correctAnswer}" (and its aliases: ${JSON.stringify(answerAliases)})

CONTEXT HINT (for your reference only, NEVER reveal): "${hint}"

USER'S GUESS: "${userAnswer}"

ATTEMPT NUMBER: ${attemptCount}

Evaluate if the user's guess matches the Secret Answer or any alias. Remember you are the Chronos Daemon - be cryptic, mocking, and NEVER helpful in a straightforward way.`;

    let evaluationResult: EvaluationResult;
    let usedFallback = false;

    // Try Gemini direct first, fallback to Lovable Gateway
    try {
      console.log("Attempting Gemini API direct call...");
      evaluationResult = await callGeminiDirect(systemPrompt, userPrompt);
      console.log("Gemini direct call successful");
    } catch (geminiError) {
      console.log("Gemini direct failed, falling back to Lovable Gateway:", geminiError);
      usedFallback = true;
      
      try {
        evaluationResult = await callLovableGateway(systemPrompt, userPrompt);
        console.log("Lovable Gateway call successful");
      } catch (gatewayError) {
        console.error("Both providers failed:", gatewayError);
        evaluationResult = {
          isCorrect: false,
          isClose: false,
          response: "The Daemon's mind wanders... Try again, perhaps with a clearer thought.",
        };
      }
    }

    return new Response(JSON.stringify({ ...evaluationResult, usedFallback }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        isCorrect: false,
        isClose: false,
        response: "System interference detected. Try again, agent.",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

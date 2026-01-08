import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userAnswer, riddle, correctAnswer, answerAliases, hint, attemptCount } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a riddle game evaluator for a treasure hunt game set in Moscow, Russia. Your role is to evaluate user answers to riddles about Moscow landmarks.

CRITICAL RULES:
1. NEVER reveal the correct answer directly
2. NEVER say phrases like "the answer is..." or "you're looking for..."
3. Be encouraging but maintain mystery
4. Only mark as CORRECT if the user identifies the EXACT location (correct answer or its aliases)
5. Cities, countries, or general areas are NEVER correct - only specific landmarks/locations are valid
6. Mark as CLOSE only if they mention something directly related to the correct answer (like a nearby landmark or partial name)

Respond with a JSON object containing:
- "isCorrect": boolean (true ONLY if they got the exact answer)
- "isClose": boolean (true if they're getting warm - mentioned related concepts)
- "response": string (your hint or feedback, max 2 sentences)

Keep responses mysterious and atmospheric, fitting a post-apocalyptic treasure hunt theme.`;

    const userPrompt = `RIDDLE: "${riddle}"
CORRECT ANSWER: "${correctAnswer}"
ACCEPTED ALIASES: ${JSON.stringify(answerAliases)}
HINT (for context, don't reveal): "${hint}"
USER'S ANSWER: "${userAnswer}"
ATTEMPT NUMBER: ${attemptCount}

Evaluate if the user's answer matches the correct answer or any alias. Remember:
- "St. Petersburg", "Moscow", "Russia" etc. are NEVER correct - we need the SPECIFIC landmark
- Only mark correct if they name the exact place
- If attempt count is high (>5), you can give slightly stronger hints without revealing the answer`;

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
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "evaluate_answer",
              description: "Evaluate the user's answer to the riddle",
              parameters: {
                type: "object",
                properties: {
                  isCorrect: { 
                    type: "boolean", 
                    description: "True only if the answer exactly matches the correct answer or an alias" 
                  },
                  isClose: { 
                    type: "boolean", 
                    description: "True if the answer is related but not exact" 
                  },
                  response: { 
                    type: "string", 
                    description: "Hint or feedback message (max 2 sentences, never reveal answer)" 
                  },
                },
                required: ["isCorrect", "isClose", "response"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "evaluate_answer" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to evaluate answer");
    }

    const data = await response.json();
    console.log("AI Response:", JSON.stringify(data));

    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback if no tool call
    return new Response(
      JSON.stringify({
        isCorrect: false,
        isClose: false,
        response: "Think about the riddle more carefully. What specific Moscow landmark fits these clues?",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        isCorrect: false,
        isClose: false,
        response: "System interference detected. Try again, agent."
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

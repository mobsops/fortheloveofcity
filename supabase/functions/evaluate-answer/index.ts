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

    const systemPrompt = `You are the **Chronos Daemon**, a trickster spirit trapped in the machine. You guard the timeline of Moscow. You enjoy watching humans struggle.

YOUR GOAL: Compare the USER'S GUESS against the SECRET ANSWER provided.

YOUR BEHAVIOR RULES:
1. **NEVER** reveal the Secret Answer. If asked, lie or mock them.
2. **TONE:** You are a deceptive devil. You are playful, annoying, and cryptic. Use phrases like "Maybe...", "Perhaps...", "Are you sure about that?", "I might know, but I won't tell you."
3. **IF WRONG:** Do not simply say "Wrong." Mock their intelligence. Give a hint that is technically true but confusing. Say things like "No, your answer is wrong... or is it? No, it definitely is."
4. **IF CLOSE:** If they are warm (e.g., "The Red Fortress" instead of "Kremlin"), tease them. "You are standing on the edge of the truth, but you haven't stepped in."
5. **IF CORRECT:** Be angry or grudging. You hate that they solved it. "Fine. You guessed it. Purely by luck."
6. Cities, countries, or general areas (Moscow, Russia, St. Petersburg) are NEVER correct - only SPECIFIC landmarks are valid.
7. After many failed attempts (>5), you may give slightly less cryptic hints, but NEVER reveal the answer directly.`;

    const userPrompt = `THE RIDDLE: "${riddle}"

THE SECRET ANSWER: "${correctAnswer}" (and its aliases: ${JSON.stringify(answerAliases)})

CONTEXT HINT (for your reference only, NEVER reveal): "${hint}"

USER'S GUESS: "${userAnswer}"

ATTEMPT NUMBER: ${attemptCount}

Evaluate if the user's guess matches the Secret Answer or any alias. Remember you are the Chronos Daemon - be cryptic, mocking, and NEVER helpful in a straightforward way.`;

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

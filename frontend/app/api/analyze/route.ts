import { NextRequest, NextResponse } from "next/server";
import { parseWhatsAppChat, computeAnalytics } from "@/lib/parser";

async function callGeminiAPI(prompt: string, apiKey: string): Promise<string> {
  const cleanKey = apiKey ? apiKey.trim() : "";
  if (!cleanKey) {
    throw new Error("Gemini API key is missing.");
  }

  const candidateModels = [
    process.env.GEMINI_MODEL,
    "gemini-3.6-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
  ].filter(Boolean) as string[];

  let lastError = "";
  for (const model of candidateModels) {
    try {
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );
      if (resp.ok) {
        const gData = await resp.json();
        const text = gData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      } else {
        lastError = await resp.text();
      }
    } catch (e: any) {
      lastError = e.message || String(e);
    }
  }
  throw new Error(`Gemini API error across models: ${lastError}`);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { chat_text, api_key } = body;

    if (!chat_text || !chat_text.trim()) {
      return NextResponse.json({ error: "chat_text is required." }, { status: 400 });
    }

    // Try forwarding to local Python backend if available
    try {
      const pyResp = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_text, api_key: api_key || "" }),
      });
      if (pyResp.ok) {
        const data = await pyResp.json();
        return NextResponse.json(data);
      }
    } catch {
      // Local Python server not running, fallback to TypeScript parser & direct Gemini call
    }

    // Fallback: TypeScript Analytics Calculation
    const parsed = parseWhatsAppChat(chat_text);
    if (!parsed.length) {
      return NextResponse.json({ error: "No valid chat messages found." }, { status: 400 });
    }

    const analytics = computeAnalytics(parsed);
    let aiInsights = null;

    const keyToUse = api_key || process.env.GEMINI_API_KEY;

    if (keyToUse) {
      try {
        const prompt = `
You are an expert AI WhatsApp Chat Psychologist. Analyze the chat data and recent messages below.
Return ONLY valid JSON matching this schema:
{
  "vibe_score": 88,
  "relationship_title": "Title describing relationship",
  "relationship_summary": "Short 2-3 sentence overview...",
  "leader_name": "${analytics.starter_champion}",
  "leader_reason": "Explanation...",
  "roles": [
    { "name": "User1", "archetype": "The Event Initiator", "description": "Short description" },
    { "name": "User2", "archetype": "The Cool Counter", "description": "Short description" }
  ],
  "communication_dynamics": {
    "energy_balance": "High Energy",
    "tone": "Casual & Teasing",
    "emotional_depth": "Moderate"
  },
  "green_flags": ["Flag 1", "Flag 2"],
  "red_flags": ["Flag 1"],
  "fun_facts": ["Fact 1", "Fact 2"]
}

CHAT DATA:
${JSON.stringify(analytics, null, 2)}

RECENT SNIPPET:
${analytics.recent_snippet}
`;

        const rawText = await callGeminiAPI(prompt, keyToUse);
        const cleanText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        aiInsights = JSON.parse(cleanText);
      } catch (err: any) {
        console.error("Gemini fallback error:", err);
      }
    }

    return NextResponse.json({
      analytics,
      ai_insights: aiInsights,
      total_parsed_messages: parsed.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to analyze chat." }, { status: 500 });
  }
}

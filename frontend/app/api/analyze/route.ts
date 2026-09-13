import { NextRequest, NextResponse } from "next/server";
import { parseWhatsAppChat, computeAnalytics } from "@/lib/parser";

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

        const geminiResp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${keyToUse}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
          }
        );

        if (geminiResp.ok) {
          const gData = await geminiResp.json();
          const rawText = gData.candidates[0].content.parts[0].text;
          const cleanText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
          aiInsights = JSON.parse(cleanText);
        }
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

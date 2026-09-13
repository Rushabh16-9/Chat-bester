import { NextRequest, NextResponse } from "next/server";
import { parseWhatsAppChat, computeAnalytics } from "@/lib/parser";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { chat_text, user_name, target_name, goal, user_context, api_key } = body;

    if (!chat_text || !user_name || !target_name) {
      return NextResponse.json({ error: "chat_text, user_name, and target_name are required." }, { status: 400 });
    }

    // Try forwarding to local Python backend first
    try {
      const pyResp = await fetch("http://localhost:8000/api/personalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_text, user_name, target_name, goal, user_context: user_context || "", api_key: api_key || "" }),
      });
      if (pyResp.ok) {
        const data = await pyResp.json();
        return NextResponse.json(data);
      }
    } catch {
      // Fallback to direct Next.js execution
    }

    const keyToUse = api_key || process.env.GEMINI_API_KEY;
    if (!keyToUse) {
      return NextResponse.json(
        { error: "Gemini API key required for personalized chat coach suggestions. Please add your key in settings!" },
        { status: 400 }
      );
    }

    const parsed = parseWhatsAppChat(chat_text);
    const analytics = computeAnalytics(parsed);

    const prompt = `
You are the ultimate AI Personal Chat Coach & Relationship Strategist.
User '${user_name}' needs customized message recommendations and advice for messaging '${target_name}'.

GOAL / SITUATION: ${goal}
EXTRA CONTEXT: ${user_context || "None provided"}

CHAT STATS:
${JSON.stringify(analytics, null, 2)}

RECENT MESSAGES SNIPPET:
${analytics.recent_snippet}

Output MUST be valid JSON with this exact schema:
{
  "user_name": "${user_name}",
  "target_name": "${target_name}",
  "goal": "${goal}",
  "psychological_insight": "In-depth analysis of how ${target_name} views ${user_name} based on their messaging habits...",
  "recommended_opening_lines": [
    "Witty context line 1",
    "Playful line 2",
    "Direct invitation line 3"
  ],
  "flirty_or_spicy_comebacks": [
    "Flirty line 1...",
    "Flirty line 2..."
  ],
  "reply_to_latest_message_suggestion": "Suggested reply to send to their last line in chat...",
  "dos_and_donts": {
    "dos": ["Do reference their inside joke about...", "Do keep tone relaxed..."],
    "donts": ["Don't double text excessively...", "Don't sound overly formal..."]
  },
  "action_strategy": "Step-by-step game plan for ${user_name}..."
}

Return ONLY valid JSON.
`;

    const geminiResp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${keyToUse}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    if (!geminiResp.ok) {
      const errText = await geminiResp.text();
      return NextResponse.json({ error: `Gemini API error: ${errText}` }, { status: 500 });
    }

    const gData = await geminiResp.json();
    const rawText = gData.candidates[0].content.parts[0].text;
    const cleanText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const advice = JSON.parse(cleanText);

    return NextResponse.json({ advice });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to generate personalization." }, { status: 500 });
  }
}

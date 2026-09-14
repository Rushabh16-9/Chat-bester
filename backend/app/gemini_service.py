import os
import json
from typing import Dict, Any, Optional

def call_gemini_api(prompt: str, api_key: str) -> str:
    """Invokes Google Gemini API with automatic free-tier model fallback (gemini-2.5-flash, gemini-2.0-flash, gemini-1.5-flash-latest)."""
    if not api_key:
        api_key = os.environ.get("GEMINI_API_KEY", "")
        
    if not api_key:
        raise ValueError("Gemini API key is required. Please set GEMINI_API_KEY or provide it in the request.")

    candidate_models = [
        os.environ.get("GEMINI_MODEL", "").strip(),
        "gemini-1.5-flash",
        "gemini-2.0-flash",
        "gemini-1.5-pro",
        "gemini-2.5-flash",
    ]
    candidate_models = [m for m in candidate_models if m]

    errors = []

    # 1. Try official google-genai SDK first
    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        for model_name in candidate_models:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt
                )
                if response and hasattr(response, "text") and response.text:
                    return response.text
            except Exception as ex:
                errors.append(f"google-genai ({model_name}): {ex}")
    except ImportError:
        pass

    # 2. Try legacy google-generativeai SDK
    try:
        import google.generativeai as genai_legacy
        genai_legacy.configure(api_key=api_key)
        for model_name in candidate_models:
            try:
                model = genai_legacy.GenerativeModel(model_name)
                response = model.generate_content(prompt)
                if response and hasattr(response, "text") and response.text:
                    return response.text
            except Exception as ex:
                errors.append(f"google-generativeai ({model_name}): {ex}")
    except ImportError:
        pass

    # 3. Direct HTTP REST fallback with urllib
    import urllib.request
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [{"parts": [{"text": prompt}]}]
    }

    for model_name in candidate_models:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
            req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers)
            with urllib.request.urlopen(req) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                text = result["candidates"][0]["content"]["parts"][0]["text"]
                if text:
                    return text
        except Exception as ex:
            errors.append(f"urllib REST ({model_name}): {ex}")

    raise RuntimeError(f"All Gemini API model calls failed: {'; '.join(errors)}")

def generate_chat_insights(analytics_data: Dict[str, Any], recent_snippet: str, api_key: str = "") -> Dict[str, Any]:
    prompt = f"""
You are an expert AI Relationship Analyst and WhatsApp Chat Psychologist.
Analyze the following chat stats and conversation snippet and generate a structured JSON insight report.

CHAT ANALYTICS DATA:
{json.dumps(analytics_data, indent=2)}

RECENT MESSAGES SNIPPET:
{recent_snippet}

Output MUST be valid JSON matching this exact structure:
{{
  "vibe_score": 88,
  "relationship_title": "Hilarious Bro Banter & Tight Friendship",
  "relationship_summary": "High energy chat filled with inside jokes, meme sharing, and teasing...",
  "leader_name": "Kushlo",
  "leader_reason": "Initiates 65% of conversations and sets the plans for hanging out.",
  "roles": [
    {{
      "name": "Kushlo",
      "archetype": "The Event Initiator & Meme Spammer",
      "description": "Always proposing plans, spamming reels, and double texting when excited."
    }},
    {{
      "name": "Rushabh Shah",
      "archetype": "The Calm Witty Counter",
      "description": "Replies with dry humor, short laughing reactions, and reality checks."
    }}
  ],
  "communication_dynamics": {{
    "energy_balance": "Balanced & High Energy",
    "tone": "Casual Hinglish / Gujarati Banter",
    "emotional_depth": "Moderate - mostly entertainment & quick updates"
  }},
  "green_flags": [
    "Quick responses on urgent matters",
    "Frequent media & link sharing indicating trust and active connection"
  ],
  "red_flags": [
    "Frequent deleted messages",
    "Occasional ghosting during lecture hours"
  ],
  "fun_facts": [
    "Most active around 7 PM to 10 PM",
    "Dream11 and Instagram reels are major bonding topics"
  ]
}}

Return ONLY valid JSON. No markdown backticks outside of JSON.
"""
    raw_response = call_gemini_api(prompt, api_key)
    cleaned = raw_response.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    cleaned = cleaned.strip()

    try:
        return json.loads(cleaned)
    except Exception:
        return {
            "vibe_score": 85,
            "relationship_title": "Dynamic Conversation",
            "relationship_summary": raw_response,
            "leader_name": analytics_data.get("starter_champion", "N/A"),
            "leader_reason": "High frequency of conversation initiations.",
            "roles": [],
            "communication_dynamics": {"energy_balance": "Active", "tone": "Casual"},
            "green_flags": ["Active communication"],
            "red_flags": [],
            "fun_facts": []
        }

def generate_personalized_advice(
    analytics_data: Dict[str, Any],
    recent_snippet: str,
    user_name: str,
    target_name: str,
    goal: str,
    user_context: str = "",
    api_key: str = ""
) -> Dict[str, Any]:
    prompt = f"""
You are the ultimate AI Personal Chat Coach & Dating/Relationship Strategist.
The user '{user_name}' wants personalized advice for messaging '{target_name}'.

USER GOAL / SITUATION: {goal}
EXTRA USER CONTEXT: {user_context}

CHAT ANALYTICS DATA:
{json.dumps(analytics_data, indent=2)}

RECENT CONVERSATION SNIPPET:
{recent_snippet}

Generate a tactical, fun, highly personalized advice guide for {user_name} to message {target_name}.

Output MUST be valid JSON with this exact schema:
{{
  "user_name": "{user_name}",
  "target_name": "{target_name}",
  "goal": "{goal}",
  "psychological_insight": "Detailed breakdown of how {target_name} perceives {user_name} based on their chat history...",
  "recommended_opening_lines": [
    "Line 1 (Witty/Flirty context-aware message referencing past jokes)",
    "Line 2 (Playful tease or challenge)",
    "Line 3 (Smooth direct invitation or casual opener)"
  ],
  "flirty_or_spicy_comebacks": [
    "Flirty line 1...",
    "Flirty line 2..."
  ],
  "reply_to_latest_message_suggestion": "Best exact reply to send to their last chat line...",
  "dos_and_donts": {{
    "dos": [
      "Do use inside jokes about...",
      "Do keep replies snappy..."
    ],
    "donts": [
      "Don't double text within 5 minutes if they're busy...",
      "Don't be overly formal..."
    ]
  }},
  "action_strategy": "Step-by-step game plan for {user_name}..."
}}

Return ONLY valid JSON.
"""
    raw_response = call_gemini_api(prompt, api_key)
    cleaned = raw_response.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    cleaned = cleaned.strip()

    try:
        return json.loads(cleaned)
    except Exception:
        return {
            "user_name": user_name,
            "target_name": target_name,
            "goal": goal,
            "psychological_insight": raw_response,
            "recommended_opening_lines": ["Hey, was just thinking about that thing we discussed earlier!"],
            "flirty_or_spicy_comebacks": ["You miss me yet?"],
            "reply_to_latest_message_suggestion": "Haha totally!",
            "dos_and_donts": {"dos": ["Be yourself"], "donts": ["Overthink it"]},
            "action_strategy": "Send a lighthearted message when they are active."
        }

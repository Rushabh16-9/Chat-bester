import os
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

from app.parser import parse_whatsapp_chat
from app.analytics import compute_chat_analytics
from app.gemini_service import generate_chat_insights, generate_personalized_advice

app = FastAPI(
    title="ChatPulse AI - WhatsApp Analytics & Chat Coach API",
    version="1.0.0"
)

# Enable CORS for local Next.js dev server & Vercel deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    chat_text: str
    api_key: Optional[str] = ""

class PersonalizeRequest(BaseModel):
    chat_text: str
    user_name: str
    target_name: str
    goal: str
    user_context: Optional[str] = ""
    api_key: Optional[str] = ""

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "ChatPulse AI API"}

@app.post("/api/analyze")
def analyze_chat(req: AnalyzeRequest):
    if not req.chat_text or not req.chat_text.strip():
        raise HTTPException(status_code=400, detail="chat_text cannot be empty.")
        
    parsed_messages = parse_whatsapp_chat(req.chat_text)
    if not parsed_messages:
        raise HTTPException(status_code=400, detail="Could not parse any valid messages from the provided chat text.")

    analytics = compute_chat_analytics(parsed_messages)
    
    ai_insights = None
    if req.api_key or os.environ.get("GEMINI_API_KEY"):
        try:
            ai_insights = generate_chat_insights(
                analytics_data=analytics,
                recent_snippet=analytics.get("recent_snippet", ""),
                api_key=req.api_key or ""
            )
        except Exception as e:
            ai_insights = {"error": f"AI Insights failed: {str(e)}"}

    return {
        "analytics": analytics,
        "ai_insights": ai_insights,
        "total_parsed_messages": len(parsed_messages)
    }

@app.post("/api/personalize")
def personalize_chat(req: PersonalizeRequest):
    if not req.chat_text or not req.chat_text.strip():
        raise HTTPException(status_code=400, detail="chat_text cannot be empty.")
    if not req.user_name or not req.target_name:
        raise HTTPException(status_code=400, detail="user_name and target_name are required.")

    parsed_messages = parse_whatsapp_chat(req.chat_text)
    analytics = compute_chat_analytics(parsed_messages)
    
    try:
        advice = generate_personalized_advice(
            analytics_data=analytics,
            recent_snippet=analytics.get("recent_snippet", ""),
            user_name=req.user_name,
            target_name=req.target_name,
            goal=req.goal,
            user_context=req.user_context or "",
            api_key=req.api_key or ""
        )
        return {"advice": advice}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate advice: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

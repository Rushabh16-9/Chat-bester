# ChatPulse AI - WhatsApp Chat Analyzer & AI Personal Coach 🚀

ChatPulse AI is a modern web application designed to analyze WhatsApp text chat exports, deliver visual data analytics (emoji rankings, conversation starter champions, talkativeness ratios, activity heatmaps), and provide personalized AI chat coaching (flirty lines, reply suggestions, fight resolution strategies) using Google Gemini API.

---

## 🌟 Key Features

1. **WhatsApp Chat Parser**: Supports 12h/24h timestamps, multi-line chats, media flags, system message filtering, and emoji detection.
2. **Instant "Load Example Chat" Button**: Pre-loaded with the WhatsApp chat history between Rushabh Shah and Kushlo for 1-click testing.
3. **Analytics Dashboard**:
   - 💬 **Talkativeness Ratio**: Message counts, word counts, average words per message.
   - 👑 **Conversation Initiator Champion**: Identifies who starts new chat threads after a gap (> 4 hours).
   - 😀 **Emoji Intelligence**: Top emojis per participant and overall emoji frequency cloud.
   - ⚡ **Response Speed & Double-Texting Score**: Measures responsiveness in minutes.
   - 🕒 **Peak Hours & Weekly Heatmap**: Identifies peak messaging windows.
4. **AI Relationship Vibe & Dynamic Rating**:
   - Powered by **Google Gemini API** (`gemini-2.5-flash` / `gemini-1.5-flash`).
   - Dynamic Vibe Score (0 to 100%).
   - Participant chat personality archetypes (e.g., "The Event Initiator", "The Dry Witty Replier").
   - Green Flags & Red Flags analysis.
5. **🎯 Personalize Chat & AI Coach Modal**:
   - Choose identity & target participant.
   - Select goal: 💖 **Crush / Flirting**, 💥 **Funny Banter**, 🕊️ **Resolve Conflict / Apology**, 🔥 **Rekindle Dead Chat**, 🥂 **Ask Out on Date**.
   - Generates custom flirty lines, tactical advice, DOs & DON'Ts, and exact reply suggestions to send right now!

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS, Lucide Icons, Framer Motion.
- **Backend**: Python 3.10+ (FastAPI, Uvicorn, Pydantic) + Next.js Serverless API Fallback.
- **AI Model**: Google Gemini API (`google-genai` / Generative Language API).

---

## 🚀 Local Setup Instructions

### 1. Run Python Backend (Optional for local Python server)
```bash
cd backend
pip install -r requirements.txt
python run.py
```
*The FastAPI server will run on `http://localhost:8000`.*

### 2. Run Next.js Frontend
```bash
cd frontend
npm install
npm run dev
```
*Open `http://localhost:3000` in your browser.*

---

## 📦 Deploying to GitHub & Vercel

### Step A: Initialize Git & Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit of ChatPulse AI web app"
git branch -M main
git remote add origin https://github.com/Rushabh16-9/Chat-bester.git
git push -u origin main
```

### Step B: Deploy to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/new).
2. Import your GitHub repository.
3. Vercel will automatically detect `vercel.json` and set the Root Directory to `frontend`.
4. (Optional) Add Environment Variable:
   - Name: `GEMINI_API_KEY`
   - Value: `your-google-gemini-api-key`
5. Click **Deploy**! 🎉

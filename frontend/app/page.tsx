"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import ChatInput from "@/components/ChatInput";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import PersonalizeModal from "@/components/PersonalizeModal";
import ApiKeyModal from "@/components/ApiKeyModal";

import { SAMPLE_CHAT } from "@/lib/sampleChat";
import { AnalyticsResult } from "@/lib/parser";

export default function Home() {
  const [chatText, setChatText] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean>(false);
  const [isPersonalizeOpen, setIsPersonalizeOpen] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analytics, setAnalytics] = useState<AnalyticsResult | null>(null);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const savedKey = localStorage.getItem("GEMINI_API_KEY");
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem("GEMINI_API_KEY", key);
  };

  const handleLoadExample = () => {
    setChatText(SAMPLE_CHAT);
  };

  const handleAnalyze = async () => {
    if (!chatText.trim()) return;

    setIsLoading(true);
    setError("");
    setAnalytics(null);
    setAiInsights(null);

    try {
      const resp = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_text: chatText, api_key: apiKey }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || "Failed to analyze chat.");
      }

      setAnalytics(data.analytics);
      setAiInsights(data.ai_insights);
    } catch (err: any) {
      setError(err.message || "An error occurred while processing the chat log.");
    } finally {
      setIsLoading(false);
    }
  };

  const participantNames = analytics?.participants?.map((p) => p.name) || ["Rushabh Shah", "Kushlo"];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        apiKey={apiKey}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
        onLoadExample={handleLoadExample}
      />

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8 space-y-8">
        {/* Intro Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 rounded-full bg-blue-500/10 px-3.5 py-1 text-xs font-bold text-blue-400 border border-blue-500/20 shadow-sm">
            <span>✨ Powered by Gemini API & Python Analytics Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Discover Chat Insights & Get{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI Personalized Advice
            </span>
          </h1>

          <p className="text-sm text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Upload your WhatsApp chat export to analyze emoji usage, conversation starters, talkativeness ratios, and get personalized flirty or tactical message recommendations.
          </p>
        </div>

        {/* Chat Input Section */}
        <ChatInput
          chatText={chatText}
          setChatText={setChatText}
          onAnalyze={handleAnalyze}
          onLoadExample={handleLoadExample}
          isLoading={isLoading}
        />

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-medium text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Analytics Dashboard */}
        {analytics && (
          <AnalyticsDashboard
            analytics={analytics}
            aiInsights={aiInsights}
            onOpenPersonalize={() => setIsPersonalizeOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>ChatPulse AI © 2026 — Built with Next.js, Python FastAPI & Google Gemini API</p>
      </footer>

      {/* Modals */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
      />

      <PersonalizeModal
        isOpen={isPersonalizeOpen}
        onClose={() => setIsPersonalizeOpen(false)}
        participants={participantNames}
        chatText={chatText}
        apiKey={apiKey}
      />
    </div>
  );
}

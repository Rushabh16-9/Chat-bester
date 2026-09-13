"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  User,
  Heart,
  Flame,
  MessageSquare,
  ShieldCheck,
  Lightbulb,
  Copy,
  Check,
  Target,
  Zap,
} from "lucide-react";

interface PersonalizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: string[];
  chatText: string;
  apiKey: string;
}

const GOALS = [
  {
    id: "crush",
    label: "Crush & Flirting",
    icon: Heart,
    color: "from-pink-500 to-rose-500",
    description: "Start a flirty conversation or break the ice with your crush",
  },
  {
    id: "banter",
    label: "Funny Banter & Roasts",
    icon: Flame,
    color: "from-amber-500 to-orange-500",
    description: "Witty comebacks, hilarious teasing, and keeping the vibe high",
  },
  {
    id: "rekindle",
    label: "Rekindle Dead Chat",
    icon: Zap,
    color: "from-blue-500 to-indigo-500",
    description: "Revive an old friendship or chat after days of silence",
  },
  {
    id: "fight",
    label: "Resolve Conflict / Apology",
    icon: ShieldCheck,
    color: "from-emerald-500 to-teal-500",
    description: "Clear up misunderstandings or smooth over a fight smoothly",
  },
  {
    id: "date",
    label: "Ask Out on a Date / Plan",
    icon: Target,
    color: "from-purple-500 to-indigo-600",
    description: "Confidently propose a hang out or date without awkwardness",
  },
];

export default function PersonalizeModal({
  isOpen,
  onClose,
  participants,
  chatText,
  apiKey,
}: PersonalizeModalProps) {
  const [userName, setUserName] = useState<string>(participants[0] || "Rushabh Shah");
  const [targetName, setTargetName] = useState<string>(participants[1] || "Kushlo");
  const [goal, setGoal] = useState<string>("crush");
  const [userContext, setUserContext] = useState<string>("");

  const [isLoading, setIsLoading] = useState(false);
  const [adviceData, setAdviceData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [copiedText, setCopiedText] = useState<string>("");

  if (!isOpen) return null;

  const handleGenerateAdvice = async () => {
    setIsLoading(true);
    setErrorMsg("");
    setAdviceData(null);

    try {
      const resp = await fetch("/api/personalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_text: chatText,
          user_name: userName,
          target_name: targetName,
          goal: GOALS.find((g) => g.id === goal)?.label || goal,
          user_context: userContext,
          api_key: apiKey,
        }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || "Failed to generate personalization.");
      }
      setAdviceData(data.advice);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to generate personalized chat coach advice.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(""), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl my-8 rounded-3xl border border-slate-700 bg-slate-900 p-5 sm:p-7 shadow-2xl shadow-purple-500/10">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 shadow-lg shadow-pink-500/20 text-white">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              Personalized AI Chat Coach
            </h2>
            <p className="text-xs text-slate-400">
              Tailored flirty lines, conversation starters & game plan based on your exact chat history
            </p>
          </div>
        </div>

        {!adviceData ? (
          <div className="space-y-6">
            {/* Step 1: Identity Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-blue-400" />
                  Who are YOU in this chat?
                </label>
                <select
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                >
                  {participants.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                  <option value="Rushabh Shah">Rushabh Shah</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-pink-400" />
                  Who are you messaging?
                </label>
                <select
                  value={targetName}
                  onChange={(e) => setTargetName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-pink-500 focus:outline-none"
                >
                  {participants
                    .filter((p) => p !== userName)
                    .map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  <option value="Kushlo">Kushlo</option>
                  <option value="Crush">Crush / Friend</option>
                </select>
              </div>
            </div>

            {/* Step 2: Goal Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                What is your intent / goal right now?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {GOALS.map((item) => {
                  const Icon = item.icon;
                  const isSelected = goal === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setGoal(item.id)}
                      className={`cursor-pointer rounded-2xl border p-3.5 transition ${
                        isSelected
                          ? "border-pink-500 bg-gradient-to-r from-pink-500/10 to-purple-500/10 shadow-lg shadow-pink-500/10"
                          : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <div
                          className={`p-2 rounded-xl text-white bg-gradient-to-tr ${item.color}`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{item.label}</div>
                          <div className="text-[11px] text-slate-400 leading-tight">
                            {item.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Extra Context */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Extra Details or Situation (Optional)
              </label>
              <input
                type="text"
                value={userContext}
                onChange={(e) => setUserContext(e.target.value)}
                placeholder="e.g. They didn't reply yesterday, or we had a plan for Friday..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
              />
            </div>

            {errorMsg && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                {errorMsg}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleGenerateAdvice}
                disabled={isLoading}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 px-7 py-3 text-sm font-bold text-white shadow-xl shadow-pink-500/20 hover:opacity-95 transition"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                    <span>Consulting Gemini AI Coach...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Generate Personal Chat Recommendations</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Advice Display Screen */
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-pink-400">
                  AI Advice for {adviceData.user_name} → {adviceData.target_name}
                </span>
                <h3 className="text-lg font-bold text-white">{adviceData.goal} Strategy</h3>
              </div>
              <button
                onClick={() => setAdviceData(null)}
                className="text-xs text-slate-400 underline hover:text-white"
              >
                Change Inputs
              </button>
            </div>

            {/* Psychological Insight */}
            <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-1.5 flex items-center gap-1.5">
                <Lightbulb className="h-4 w-4 text-purple-400" />
                Psychological Analysis
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {adviceData.psychological_insight}
              </p>
            </div>

            {/* Recommended Lines */}
            {adviceData.recommended_opening_lines?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-blue-400" />
                  Recommended Opening / Conversation Lines
                </h4>
                <div className="space-y-2">
                  {adviceData.recommended_opening_lines.map((line: string, idx: number) => (
                    <div
                      key={idx}
                      className="group flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white hover:border-blue-500/50 transition"
                    >
                      <span className="font-medium pr-3">{line}</span>
                      <button
                        onClick={() => copyToClipboard(line)}
                        className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                      >
                        {copiedText === line ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Flirty Lines */}
            {adviceData.flirty_or_spicy_comebacks?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-pink-400 mb-2 flex items-center gap-1.5">
                  <Heart className="h-4 w-4 text-pink-400" />
                  Flirty & Spicy Comebacks
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {adviceData.flirty_or_spicy_comebacks.map((line: string, idx: number) => (
                    <div
                      key={idx}
                      onClick={() => copyToClipboard(line)}
                      className="cursor-pointer rounded-xl border border-pink-500/20 bg-pink-500/5 p-3 text-xs text-pink-200 hover:border-pink-500/50 transition flex justify-between items-center"
                    >
                      <span className="font-medium">{line}</span>
                      {copiedText === line ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 ml-2" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-pink-400 opacity-60 shrink-0 ml-2" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DOs & DON'Ts */}
            {adviceData.dos_and_donts && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5">
                  <h5 className="text-xs font-bold text-emerald-400 mb-2 uppercase tracking-wider">
                    ✅ DO THIS
                  </h5>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {adviceData.dos_and_donts.dos?.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-400">•</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5">
                  <h5 className="text-xs font-bold text-rose-400 mb-2 uppercase tracking-wider">
                    ❌ AVOID THIS
                  </h5>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {adviceData.dos_and_donts.donts?.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-rose-400">•</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Action Strategy */}
            {adviceData.action_strategy && (
              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300 mb-1">
                  🎯 Step-by-Step Tactical Game Plan
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {adviceData.action_strategy}
                </p>
              </div>
            )}

            <div className="pt-3 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition"
              >
                Close Coach
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

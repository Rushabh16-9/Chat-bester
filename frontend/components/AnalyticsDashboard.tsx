"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  Smile,
  Crown,
  Flame,
  Clock,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  BarChart3,
  Users,
  Send,
  Zap,
  Trash2,
  Image as ImageIcon,
  Share2,
} from "lucide-react";
import { AnalyticsResult } from "@/lib/parser";

interface AnalyticsDashboardProps {
  analytics: AnalyticsResult;
  aiInsights: any;
  onOpenPersonalize: () => void;
}

export default function AnalyticsDashboard({
  analytics,
  aiInsights,
  onOpenPersonalize,
}: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "dynamics" | "emojis" | "activity">("overview");

  const participants = analytics.participants || [];
  const starterChamp = analytics.starter_champion || "N/A";
  const talkativeChamp = analytics.most_talkative || "N/A";

  return (
    <div className="w-full space-y-6">
      {/* Top Banner Action */}
      <div className="relative overflow-hidden rounded-3xl border border-pink-500/30 bg-gradient-to-r from-pink-950/40 via-purple-950/40 to-slate-950 p-6 shadow-2xl shadow-purple-500/10">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 rounded-full bg-pink-500/10 px-3 py-1 text-xs font-bold text-pink-400 border border-pink-500/20 mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Chat Coach Ready</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Want personalized recommendations or flirty lines?
            </h2>
            <p className="text-xs text-slate-300 max-w-xl mt-1">
              Select your goal (Crush, Rekindle, Banter, Fight Resolution, Ask Out) and get exact reply suggestions using Gemini AI!
            </p>
          </div>

          <button
            onClick={onOpenPersonalize}
            className="w-full sm:w-auto shrink-0 flex items-center justify-center space-x-2 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-pink-500/30 hover:scale-105 transition transform active:scale-95"
          >
            <Sparkles className="h-4 w-4" />
            <span>Personalize Chats & Get AI Advice</span>
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold transition whitespace-nowrap ${
            activeTab === "overview"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Overview & Leaderboard</span>
        </button>

        <button
          onClick={() => setActiveTab("dynamics")}
          className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold transition whitespace-nowrap ${
            activeTab === "dynamics"
              ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
              : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>AI Relationship Vibe</span>
        </button>

        <button
          onClick={() => setActiveTab("emojis")}
          className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold transition whitespace-nowrap ${
            activeTab === "emojis"
              ? "bg-pink-600 text-white shadow-md shadow-pink-500/20"
              : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <Smile className="h-4 w-4" />
          <span>Emoji Insights</span>
        </button>

        <button
          onClick={() => setActiveTab("activity")}
          className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold transition whitespace-nowrap ${
            activeTab === "activity"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
              : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Activity & Peak Hours</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & LEADERBOARD */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold">Total Messages</span>
                <MessageSquare className="h-4 w-4 text-blue-400" />
              </div>
              <div className="text-2xl font-black text-white">{analytics.total_messages}</div>
              <div className="text-[10px] text-slate-400 mt-1">Across all participants</div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold">Convo Starter</span>
                <Crown className="h-4 w-4 text-amber-400" />
              </div>
              <div className="text-lg font-black text-amber-300 truncate">{starterChamp}</div>
              <div className="text-[10px] text-slate-400 mt-1">Starts most chat threads</div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold">Most Talkative</span>
                <Flame className="h-4 w-4 text-pink-400" />
              </div>
              <div className="text-lg font-black text-pink-300 truncate">{talkativeChamp}</div>
              <div className="text-[10px] text-slate-400 mt-1">Highest message volume</div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold">Total Emojis</span>
                <Smile className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white">{analytics.total_emojis_count}</div>
              <div className="text-[10px] text-slate-400 mt-1">Emojis sent in total</div>
            </div>
          </div>

          {/* Participant Breakdown Cards */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-400" />
              Participant Leaderboard & Talkativeness Ratio
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {participants.map((p, idx) => (
                <div
                  key={p.name}
                  className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white ${
                          idx === 0
                            ? "bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-md shadow-blue-500/20"
                            : "bg-gradient-to-tr from-purple-600 to-pink-600 shadow-md shadow-purple-500/20"
                        }`}
                      >
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white flex items-center gap-1.5">
                          {p.name}
                          {p.name === starterChamp && (
                            <span title="Conversation Starter Champion" className="text-amber-400 text-xs">
                              👑
                            </span>
                          )}
                        </h4>
                        <div className="text-xs text-slate-400">
                          {p.message_count} msgs ({p.message_percentage}%)
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-semibold text-slate-300">Avg Response</div>
                      <div className="text-sm font-bold text-blue-400">
                        {p.avg_response_time_minutes !== "N/A"
                          ? `${p.avg_response_time_minutes} min`
                          : "N/A"}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={`h-full rounded-full ${
                          idx === 0 ? "bg-blue-500" : "bg-purple-500"
                        }`}
                        style={{ width: `${p.message_percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Detailed Metric Badges */}
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-2">
                      <div className="text-[10px] text-slate-400">Word Count</div>
                      <div className="text-xs font-bold text-white">{p.word_count}</div>
                      <div className="text-[9px] text-slate-500">~{p.avg_words_per_msg} w/msg</div>
                    </div>

                    <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-2">
                      <div className="text-[10px] text-slate-400">Convo Starters</div>
                      <div className="text-xs font-bold text-amber-300">{p.conversation_starts}</div>
                      <div className="text-[9px] text-slate-500">Initiations</div>
                    </div>

                    <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-2">
                      <div className="text-[10px] text-slate-400">Media / Files</div>
                      <div className="text-xs font-bold text-pink-300">{p.media_count}</div>
                      <div className="text-[9px] text-slate-500">{p.deleted_count} deleted</div>
                    </div>
                  </div>

                  {/* Top Emojis row */}
                  {p.top_emojis?.length > 0 && (
                    <div className="flex items-center space-x-2 pt-1 border-t border-slate-800/60">
                      <span className="text-[10px] text-slate-400">Favorite emojis:</span>
                      <div className="flex items-center space-x-1.5">
                        {p.top_emojis.map((e: any, i: number) => (
                          <span
                            key={i}
                            className="rounded-lg bg-slate-950 px-2 py-0.5 text-xs font-medium border border-slate-800"
                            title={`${e.count} times`}
                          >
                            {e.emoji} <span className="text-[9px] text-slate-500">{e.count}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI RELATIONSHIP VIBE */}
      {activeTab === "dynamics" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {aiInsights ? (
            <div className="space-y-6">
              {/* Relationship Score Banner */}
              <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/50 via-slate-900 to-slate-950 p-6 shadow-2xl">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-bold text-purple-300 border border-purple-500/30 uppercase tracking-wider">
                      Dynamic Relationship Diagnosis
                    </span>
                    <h3 className="text-2xl font-black text-white">
                      {aiInsights.relationship_title || "Dynamic Connection"}
                    </h3>
                    <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                      {aiInsights.relationship_summary}
                    </p>
                  </div>

                  <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-950/80 border border-purple-500/30 p-5 min-w-[140px]">
                    <div className="text-3xl font-black bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                      {aiInsights.vibe_score || 88}%
                    </div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">
                      Vibe Score
                    </div>
                  </div>
                </div>
              </div>

              {/* Roles & Archetypes */}
              {aiInsights.roles?.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Participant Chat Personality Roles
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {aiInsights.roles.map((role: any, idx: number) => (
                      <div
                        key={idx}
                        className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white">{role.name}</span>
                          <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-500/20">
                            {role.archetype}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {role.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Green & Red Flags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {aiInsights.green_flags?.length > 0 && (
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4" />
                      Green Flags & Healthy Dynamics
                    </h5>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {aiInsights.green_flags.map((flag: string, i: number) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-400">✓</span> {flag}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiInsights.red_flags?.length > 0 && (
                  <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 space-y-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                      <ShieldAlert className="h-4 w-4" />
                      Red Flags & Friction Points
                    </h5>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {aiInsights.red_flags.map((flag: string, i: number) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-rose-400">!</span> {flag}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center space-y-3">
              <Sparkles className="h-8 w-8 text-purple-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">Unlock Deep Gemini AI Insights</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Add your Gemini API Key in the top header settings to enable AI Relationship Ratings, Personality Archetypes, and Flag Analysis!
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: EMOJIS */}
      {activeTab === "emojis" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Smile className="h-4 w-4 text-pink-400" />
              Most Frequent Emojis in Conversation
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {analytics.overall_top_emojis?.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3"
                >
                  <span className="text-2xl">{item.emoji}</span>
                  <div className="text-right">
                    <div className="text-xs font-bold text-white">{item.count}</div>
                    <div className="text-[9px] text-slate-500">times</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ACTIVITY & PEAK HOURS */}
      {activeTab === "activity" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-400" />
              Hourly Chat Frequency Heatmap (24 Hours)
            </h3>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {analytics.hourly_distribution?.map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-950 p-2 text-center"
                >
                  <span className="text-[10px] text-slate-400 font-mono">{item.hour}</span>
                  <span className="text-sm font-bold text-emerald-400 mt-1">{item.count}</span>
                  <span className="text-[8px] text-slate-500">msgs</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-400" />
              Weekly Activity Breakdown
            </h3>

            <div className="grid grid-cols-7 gap-2">
              {analytics.day_distribution?.map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-950 p-3 text-center"
                >
                  <span className="text-xs font-bold text-white">{item.day}</span>
                  <span className="text-sm font-black text-blue-400 mt-1">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React from "react";
import { MessageSquareHeart, Key, Zap } from "lucide-react";

interface HeaderProps {
  apiKey: string;
  onOpenKeyModal: () => void;
  onLoadExample: () => void;
}

export default function Header({ apiKey, onOpenKeyModal, onLoadExample }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-pink-500 shadow-lg shadow-blue-500/20">
            <MessageSquareHeart className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black tracking-tight text-white">
                ChatPulse<span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">AI</span>
              </h1>
              <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-500/20">
                v2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              WhatsApp Analytics, Relationship Dynamics & AI Chat Coach
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={onLoadExample}
            className="flex items-center space-x-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-300 hover:bg-blue-500/20 transition shadow-sm"
          >
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span>Load Example Chat</span>
          </button>

          <button
            onClick={onOpenKeyModal}
            className="flex items-center space-x-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
          >
            <Key className="h-3.5 w-3.5 text-blue-400" />
            <span className="hidden sm:inline">
              {apiKey ? "Custom Key Set" : "API Key Settings"}
            </span>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" title="Server .env API Key is active by default"></span>
          </button>
        </div>
      </div>
    </header>
  );
}

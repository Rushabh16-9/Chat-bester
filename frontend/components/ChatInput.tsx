"use client";

import React, { useRef } from "react";
import { Upload, Sparkles, Zap, FileText, Trash2 } from "lucide-react";

interface ChatInputProps {
  chatText: string;
  setChatText: (text: string) => void;
  onAnalyze: () => void;
  onLoadExample: () => void;
  isLoading: boolean;
}

export default function ChatInput({
  chatText,
  setChatText,
  onAnalyze,
  onLoadExample,
  isLoading,
}: ChatInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          setChatText(text);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Import WhatsApp Chat Log
          </h2>
          <p className="text-xs text-slate-400">
            Paste your exported WhatsApp text chat or click &apos;Load Example Chat&apos; to test
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onLoadExample}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition"
          >
            <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            <span>Load Example Chat</span>
          </button>

          <input
            type="file"
            accept=".txt"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Upload .txt</span>
          </button>
        </div>
      </div>

      <div className="relative">
        <textarea
          value={chatText}
          onChange={(e) => setChatText(e.target.value)}
          placeholder={`Paste your exported WhatsApp chat text here...\n\nExample format:\n9/2/23, 23:20 - Messages and calls are end-to-end encrypted...\n2/5/24, 18:57 - Kushlo: Hey bro\n2/5/24, 19:00 - Rushabh Shah: Bol bhai`}
          rows={7}
          className="w-full rounded-xl border border-slate-800 bg-slate-950/80 p-4 text-xs font-mono text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition shadow-inner"
        />

        {chatText && (
          <button
            onClick={() => setChatText("")}
            title="Clear text"
            className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <FileText className="h-4 w-4 text-blue-400 shrink-0" />
          <span>
            {chatText ? `${chatText.split(/\r?\n/).length} lines detected` : "Ready for export text input"}
          </span>
        </div>

        <button
          onClick={onAnalyze}
          disabled={!chatText.trim() || isLoading}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:opacity-95 disabled:opacity-50 transition transform active:scale-95"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
              <span>Analyzing Chat Dynamics...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Analyze Chat & Insights</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

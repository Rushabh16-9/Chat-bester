"use client";

import React, { useState, useEffect } from "react";
import { Key, X, Check, ShieldAlert, Sparkles } from "lucide-react";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
}

export default function ApiKeyModal({ isOpen, onClose, apiKey, onSaveApiKey }: ApiKeyModalProps) {
  const [inputKey, setInputKey] = useState(apiKey);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setInputKey(apiKey);
  }, [apiKey]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveApiKey(inputKey.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl shadow-blue-500/10">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Key className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Gemini API Key
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Optional / Recommended
              </span>
            </h3>
            <p className="text-xs text-slate-400">Powers deep AI chat psychological insights & personalize coach</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Enter your Google Gemini API Key
            </label>
            <input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3 text-xs text-slate-400 flex items-start space-x-2">
            <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              Your key is saved locally in your browser. Get a free API key at{" "}
              <a
                href="https://aistudio.google.com/"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 underline hover:text-blue-300"
              >
                aistudio.google.com
              </a>
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 transition"
            >
              {saved ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Save Key</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

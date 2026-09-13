import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ChatPulse AI - WhatsApp Analytics & AI Chat Coach",
  description: "Analyze exported WhatsApp chat logs, discover emoji insights, conversation initiators, talkativeness ratios, relationship dynamics, and get personalized AI chat recommendations powered by Gemini API.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}

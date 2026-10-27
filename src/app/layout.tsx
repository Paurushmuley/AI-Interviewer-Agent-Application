import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { Bot, User, LayoutDashboard, LogIn, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI Interviewer - Realistic Hybrid NLP + LLM Interview Platform',
  description: 'AI-powered realistic technical, behavioral, and coding interviews with live avatar lip-sync, camera feed, and BYOK multi-LLM support.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 antialiased selection:bg-blue-600/30">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  AI Interviewer
                </span>
                <span className="text-[10px] text-blue-400 font-medium tracking-wider uppercase -mt-0.5">
                  NLP + LLM Platform
                </span>
              </div>
            </Link>

            <nav className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-400" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

              <Link
                href="/setup"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>New Interview</span>
              </Link>

              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-md shadow-blue-600/20"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col">{children}</main>

        {/* Subtle Footer */}
        <footer className="border-t border-slate-900 bg-slate-950/40 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4">
            AI Interviewer • Multi-LLM BYOK • Hybrid NLP Speech Analytics • Powered by Vercel & PostgreSQL
          </div>
        </footer>
      </body>
    </html>
  );
}

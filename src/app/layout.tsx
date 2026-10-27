import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/navigation/Navbar';

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
        {/* Dynamic Navigation Bar (Login vs Logout & User Name) */}
        <Navbar />

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

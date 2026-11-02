import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/navigation/Navbar';
import { Logo } from '@/components/brand/Logo';

export const metadata: Metadata = {
  title: 'AI Interviewer - Realistic Hybrid NLP + LLM Interview Platform',
  description: 'AI-powered realistic technical, behavioral, and coding interviews with live avatar lip-sync, camera feed, and BYOK multi-LLM support.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '32x32' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
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

        {/* Subtle Footer with Brand Logo */}
        <footer className="border-t border-slate-900 bg-slate-950/40 py-6 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Logo href="/" iconSize={24} showSubtitle={false} />
            </div>
            <div className="text-center sm:text-right">
              AI Interviewer • Multi-LLM BYOK • Hybrid NLP Speech Analytics • Powered by Vercel & PostgreSQL
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

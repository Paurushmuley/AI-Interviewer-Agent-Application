'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, LogIn, LogOut, Sparkles, User, Menu, X } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email: string; name?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
    setMobileMenuOpen(false); // Close mobile drawer on route navigation
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setMobileMenuOpen(false);
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Logo href="/" iconSize={36} />

        {/* Desktop Navigation Items (Hidden on small mobile) */}
        <nav className="hidden sm:flex items-center gap-3 sm:gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-slate-400" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/setup"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>New Interview</span>
          </Link>

          {!loading && user ? (
            /* Logged In State */
            <div className="flex items-center gap-2.5">
              <span className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-medium max-w-[140px] truncate">{user.name || user.email}</span>
              </span>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-900 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-800 hover:border-rose-800/50 rounded-lg transition-colors shadow-sm"
                title="Sign out of your account"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Logout</span>
              </button>
            </div>
          ) : !loading ? (
            /* Logged Out State */
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-md shadow-blue-600/20"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </Link>
          ) : null}
        </nav>

        {/* Mobile Hamburger Button */}
        <div className="flex sm:hidden items-center gap-2">
          {!loading && !user && (
            <Link
              href="/login"
              className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
              Login
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-slate-800 bg-slate-950/95 backdrop-blur-2xl px-4 py-4 space-y-3 animate-fadeIn">
          {user && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200">
              <User className="w-4 h-4 text-blue-400 shrink-0" />
              <div className="truncate">
                <span className="font-semibold block truncate">{user.name || 'Candidate'}</span>
                <span className="text-[10px] text-slate-400 truncate block">{user.email}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-medium text-slate-200 hover:bg-slate-800"
            >
              <LayoutDashboard className="w-4 h-4 text-blue-400" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/setup"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-3 rounded-xl bg-blue-600/15 border border-blue-500/30 text-xs font-semibold text-blue-300 hover:bg-blue-600/25"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>New Interview</span>
            </Link>
          </div>

          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white text-center"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In</span>
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center p-2.5 rounded-xl bg-blue-600 text-xs font-semibold text-white text-center shadow-md shadow-blue-600/20"
              >
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

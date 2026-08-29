import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { Sliders, Calendar, FileText, Settings, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: '演出技術會議需求管理系統 | Event Technical Requirement Management System',
  description: '由資料驅動的演出技術需求管理平台，提供音響、錄影音、INTERCOM、投影器材等規格總表與匯出功能。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="font-bold text-base tracking-wide text-slate-100 group-hover:text-sky-400 transition">
                    演出技術會議需求管理系統
                  </h1>
                  <p className="text-[10px] text-slate-400 font-mono tracking-wider">
                    EVENT TECH REQUIREMENT SYSTEM
                  </p>
                </div>
              </Link>
            </div>

            <nav className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800 transition"
              >
                <Calendar className="w-4 h-4 text-sky-400" />
                <span>演出列表</span>
              </Link>

              <Link
                href="/summary/evt_2026_001"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800 transition"
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>需求總表 (PAGE 03)</span>
              </Link>

              <Link
                href="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition"
              >
                <Settings className="w-4 h-4 text-amber-400" />
                <span>題目管理 (PAGE 02)</span>
              </Link>

              <div className="ml-2 pl-2 border-l border-slate-800 hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <Shield className="w-3.5 h-3.5 text-sky-400" />
                <span>ROLE: ADMIN</span>
              </div>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-600 font-mono">
          <p>© 2026 Event Technical Requirement Management System | Data-Driven Architecture</p>
        </footer>
      </body>
    </html>
  );
}

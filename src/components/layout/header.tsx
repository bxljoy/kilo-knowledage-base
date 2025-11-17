'use client';

import Link from 'next/link';
import { UserMenu } from './user-menu';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/dashboard" className="flex items-center space-x-2 group">
          <span className="font-display text-2xl font-extrabold text-white tracking-tight group-hover:text-blue-400 transition-colors">Kilo Knowledge Base</span>
        </Link>
        <nav className="flex items-center space-x-4">
          <UserMenu />
        </nav>
      </div>
    </header>
  );
}

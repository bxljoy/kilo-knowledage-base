'use client';

import Link from 'next/link';
import { UserMenu } from './user-menu';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <span className="font-display text-2xl font-bold text-gray-900 tracking-tight">Kilo Knowledge Base</span>
        </Link>
        <nav className="flex items-center space-x-4">
          <UserMenu />
        </nav>
      </div>
    </header>
  );
}

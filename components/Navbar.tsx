'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-[#0065f0]">
                Avature Games
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button 
                variant={pathname === '/' ? 'default' : 'ghost'}
                className={pathname === '/' ? 'bg-[#0065f0]' : ''}
              >
                首页
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button 
                variant={pathname === '/leaderboard' ? 'default' : 'ghost'}
                className={pathname === '/leaderboard' ? 'bg-[#0065f0]' : ''}
              >
                排行榜
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 
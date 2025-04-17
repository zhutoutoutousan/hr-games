'use client';

import { useEffect, useState } from 'react';
import { Leaderboard } from '@/components/Leaderboard';
import { getLeaderboard, LeaderboardEntry } from '@/utils/leaderboard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    setEntries(getLeaderboard());
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-[#0065f0]">排行榜</h1>
          <div className="space-x-4">
            <Link href="/">
              <Button variant="outline">返回首页</Button>
            </Link>
            <Button 
              variant="destructive"
              onClick={() => {
                localStorage.removeItem('fake-cv-leaderboard');
                setEntries([]);
              }}
            >
              清空排行榜
            </Button>
          </div>
        </div>
        <Leaderboard entries={entries} />
      </div>
    </div>
  );
} 
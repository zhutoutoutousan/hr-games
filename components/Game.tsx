'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Leaderboard } from '@/components/Leaderboard';
import { addToLeaderboard, getLeaderboard } from '@/utils/leaderboard';
import Link from 'next/link';

interface PlayerInfo {
  name: string;
  avatar: string;
}

export function Game() {
  const [playerInfo, setPlayerInfo] = useState<PlayerInfo | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const handleGameEnd = (score: number, time: number) => {
    if (playerInfo) {
      addToLeaderboard({
        name: playerInfo.name,
        avatar: playerInfo.avatar,
        score,
        time,
        date: new Date().toISOString(),
      });
    }
    setShowLeaderboard(true);
  };

  if (showLeaderboard) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-[#0065f0]">游戏结束</h1>
            <div className="space-x-4">
              <Button onClick={() => setShowLeaderboard(false)} variant="outline">
                返回游戏
              </Button>
              <Link href="/leaderboard">
                <Button>查看完整排行榜</Button>
              </Link>
            </div>
          </div>
          <Leaderboard entries={getLeaderboard()} />
        </div>
      </div>
    );
  }

  // ... rest of the existing code ...
} 
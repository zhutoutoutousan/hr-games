'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';

interface LeaderboardEntry {
  name: string;
  avatar: string;
  score: number;
  time: number;
  date: string;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
}

export function Leaderboard({ entries }: LeaderboardProps) {
  const sortedEntries = [...entries].sort((a, b) => {
    // First sort by score
    if (b.score !== a.score) return b.score - a.score;
    // Then by time (faster is better)
    return a.time - b.time;
  });

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-[#0065f0]">排行榜</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedEntries.map((entry, index) => (
            <div
              key={`${entry.name}-${entry.date}`}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
            >
              <div className="text-2xl font-bold text-[#0065f0] w-8">
                {index + 1}
              </div>
              <div className="relative w-12 h-12 rounded-full overflow-hidden">
                <Image
                  src={entry.avatar}
                  alt={entry.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-lg">{entry.name}</div>
                <div className="text-gray-500 text-sm">
                  {new Date(entry.date).toLocaleDateString()}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg text-[#0065f0]">
                  {entry.score}分
                </div>
                <div className="text-gray-500 text-sm">
                  {Math.floor(entry.time / 60)}:{String(Math.floor(entry.time % 60)).padStart(2, '0')}
                </div>
              </div>
            </div>
          ))}

          {entries.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              还没有人玩过游戏哦，快来成为第一名吧！
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 
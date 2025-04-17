'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MatchingGame from '@/components/MatchingGame';
import { GameNav } from '@/components/GameNav';

export default function MatchingGamePage() {
  const router = useRouter();
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'result'>('playing');

  const handleComplete = (finalScore: number) => {
    setScore(finalScore);
    setGameState('result');
  };

  if (gameState === 'result') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold mb-2">Game Results</CardTitle>
            <p className="text-gray-600">People Matching Challenge</p>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-[#0065f0]/5 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-[#0065f0]">{score}</div>
                <div className="text-gray-600">Total Matches</div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={() => router.push('/')}
              >
                Back to Games
              </Button>
              <Button
                size="lg"
                className="flex-1 bg-[#0065f0] hover:bg-[#0065f0]/90"
                onClick={() => {
                  setGameState('playing');
                  setScore(0);
                }}
              >
                Play Again
              </Button>
            </div>
          </CardContent>
        </Card>
        <GameNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <MatchingGame onComplete={handleComplete} />
      <GameNav />
    </div>
  );
} 
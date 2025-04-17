'use client';

import { useState } from 'react';
import { GameNav } from '@/components/GameNav';
import GameScreen from '@/components/game-screen';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Clock, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CVGame() {
  const [gameState, setGameState] = useState<'playing' | 'result'>('playing');
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [endTime, setEndTime] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const totalRounds = 5;
  const router = useRouter();

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setScore(score + 1);
    }
    setAnswers([...answers, isCorrect]);
    
    if (currentRound + 1 >= totalRounds) {
      setEndTime(Date.now());
      setGameState('result');
    } else {
      setCurrentRound(currentRound + 1);
    }
  };

  const restartGame = () => {
    setGameState('playing');
    setCurrentRound(0);
    setScore(0);
    setAnswers([]);
    setStartTime(Date.now());
  };

  if (gameState === 'result') {
    const timeTaken = (endTime - startTime) / 1000;
    const minutes = Math.floor(timeTaken / 60);
    const seconds = Math.floor(timeTaken % 60);

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold mb-2">Game Results</CardTitle>
            <p className="text-gray-600">CV Identification Challenge</p>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-[#0065f0]/5 rounded-xl p-6 text-center">
                <Trophy className="h-8 w-8 text-[#0065f0] mx-auto mb-2" />
                <div className="text-3xl font-bold text-[#0065f0]">{score}/{totalRounds}</div>
                <div className="text-gray-600">Correct Answers</div>
              </div>
              <div className="bg-[#0065f0]/5 rounded-xl p-6 text-center">
                <Clock className="h-8 w-8 text-[#0065f0] mx-auto mb-2" />
                <div className="text-3xl font-bold text-[#0065f0]">
                  {minutes}:{seconds.toString().padStart(2, '0')}
                </div>
                <div className="text-gray-600">Time Taken</div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="font-semibold text-lg mb-2">Your Answers:</h3>
              {answers.map((correct, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg flex items-center justify-between ${
                    correct ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}
                >
                  <span>Round {index + 1}</span>
                  <span>{correct ? 'Correct' : 'Incorrect'}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={() => router.push('/')}
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Games
              </Button>
              <Button
                size="lg"
                className="flex-1 bg-[#0065f0] hover:bg-[#0065f0]/90"
                onClick={restartGame}
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
      <GameScreen
        position="HR Manager"
        round={currentRound}
        totalRounds={totalRounds}
        onAnswer={handleAnswer}
      />
      <GameNav />
    </div>
  );
} 
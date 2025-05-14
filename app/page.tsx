"use client"

import { useState } from "react"
import GameScreen from "@/components/game-screen"
import MatchingGame from "@/components/matching-game"
import ResultScreen from "@/components/result-screen"
import { FileText, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { GameNav } from '@/components/GameNav';

type GameType = 'cv' | 'matching' | null;

export default function HomePage() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'selection' | 'playing' | 'result'>('selection');
  const [selectedGame, setSelectedGame] = useState<GameType>(null);
  const [currentRound, setCurrentRound] = useState(0)
  const [score, setScore] = useState(0)
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(0)
  const [answers, setAnswers] = useState<boolean[]>([])
  const totalRounds = 5

  const startGame = (game: GameType) => {
    setSelectedGame(game)
    setGameState("playing")
    setCurrentRound(0)
    setScore(0)
    setAnswers([])
    setStartTime(Date.now())
  }

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setScore(score + 1)
    }
    setAnswers([...answers, isCorrect])
    
    if (currentRound + 1 >= totalRounds) {
      setEndTime(Date.now())
      setGameState("result")
    } else {
      setCurrentRound(currentRound + 1)
    }
  }

  const backToGames = () => {
    setGameState("selection")
    setSelectedGame(null)
  }

  if (gameState === 'selection') {
    return (
      <main className="h-screen w-screen overflow-hidden bg-gray-50 flex items-center justify-center p-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full h-[calc(100vh-1rem)] max-w-[1920px]">
          <button
            onClick={() => router.push('/games/true-false-cv')}
            className="group flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-[#0065f0] space-y-2 aspect-[4/3] md:aspect-square"
          >
            <div className="h-16 w-16 md:h-24 md:w-24 bg-[#0065f0]/10 rounded-xl flex items-center justify-center group-hover:bg-[#0065f0] transition-colors duration-300">
              <FileText className="h-10 w-10 md:h-16 md:w-16 text-[#0065f0] group-hover:text-white transition-colors duration-300" />
            </div>
            <div className="text-center overflow-hidden px-2">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900 truncate">Fake CV Identification</h2>
              <p className="text-sm md:text-lg text-gray-600 line-clamp-2 mt-1">Test your ability to identify AI-generated resumes</p>
            </div>
          </button>

          <button
            onClick={() => router.push('/games/matching')}
            className="group flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-[#0065f0] space-y-2 aspect-[4/3] md:aspect-square"
          >
            <div className="h-16 w-16 md:h-24 md:w-24 bg-[#0065f0]/10 rounded-xl flex items-center justify-center group-hover:bg-[#0065f0] transition-colors duration-300">
              <Users className="h-10 w-10 md:h-16 md:w-16 text-[#0065f0] group-hover:text-white transition-colors duration-300" />
            </div>
            <div className="text-center overflow-hidden px-2">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900 truncate">Conference Matching</h2>
              <p className="text-sm md:text-lg text-gray-600 line-clamp-2 mt-1">Match attendees based on interests and goals</p>
            </div>
          </button>
        </div>
        <GameNav />
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      {gameState === "playing" && (
        <>
          {selectedGame === 'cv' && (
            <GameScreen
              position="HR Manager"
              round={currentRound}
              totalRounds={totalRounds}
              onAnswer={handleAnswer}
            />
          )}
          {selectedGame === 'matching' && (
            <MatchingGame
              round={currentRound}
              totalRounds={totalRounds}
              onAnswer={handleAnswer}
              onBack={backToGames}
            />
          )}
        </>
      )}

      {gameState === "result" && (
        <div className="relative">
          <ResultScreen
            score={score}
            totalRounds={totalRounds}
            timeTaken={(endTime - startTime) / 1000}
            answers={answers}
            onRestart={backToGames}
          />
        </div>
      )}
    </main>
  )
}

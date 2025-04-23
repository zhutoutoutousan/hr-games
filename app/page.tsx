"use client"

import { useState } from "react"
import GameScreen from "@/components/game-screen"
import MatchingGame from "@/components/matching-game"
import StoryGame from "@/components/story-game"
import ResultScreen from "@/components/result-screen"
import { FileText, Users, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { GameNav } from '@/components/GameNav';

type GameType = 'cv' | 'matching' | 'story' | null;

export default function Home() {
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
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="grid grid-cols-3 gap-8 max-w-7xl w-full">
          <button
            onClick={() => router.push('/games/true-false-cv')}
            className="group flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-[#0065f0] space-y-6"
          >
            <div className="h-24 w-24 bg-[#0065f0]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#0065f0] transition-colors duration-300">
              <FileText className="h-12 w-12 text-[#0065f0] group-hover:text-white transition-colors duration-300" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-3 text-gray-900">Fake CV Identification</h2>
              <p className="text-gray-600">Test your ability to identify AI-generated resumes</p>
            </div>
          </button>

          <button
            onClick={() => router.push('/games/matching')}
            className="group flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-[#0065f0] space-y-6"
          >
            <div className="h-24 w-24 bg-[#0065f0]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#0065f0] transition-colors duration-300">
              <Users className="h-12 w-12 text-[#0065f0] group-hover:text-white transition-colors duration-300" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-3 text-gray-900">Conference Matching</h2>
              <p className="text-gray-600">Match attendees based on interests and goals</p>
            </div>
          </button>

          <button
            onClick={() => router.push('/games/story')}
            className="group flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-[#0065f0] space-y-6"
          >
            <div className="h-24 w-24 bg-[#0065f0]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#0065f0] transition-colors duration-300">
              <MessageSquare className="h-12 w-12 text-[#0065f0] group-hover:text-white transition-colors duration-300" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-3 text-gray-900">AI Story Collaboration</h2>
              <p className="text-gray-600">Create stories together with AI assistance</p>
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
          {selectedGame === 'story' && (
            <StoryGame
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

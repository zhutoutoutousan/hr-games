'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
import { Player } from '@/types';

interface LeaderboardContextType {
  scores: Player[];
  addScore: (player: Player) => void;
}

const LeaderboardContext = createContext<LeaderboardContextType | undefined>(undefined);

export function LeaderboardProvider({ children }: { children: ReactNode }) {
  const [scores, setScores] = useState<Player[]>([]);

  const addScore = (player: Player) => {
    setScores(prev => [...prev, player].sort((a, b) => b.score - a.score));
  };

  return (
    <LeaderboardContext.Provider value={{ scores, addScore }}>
      {children}
    </LeaderboardContext.Provider>
  );
}

export function useLeaderboard() {
  const context = useContext(LeaderboardContext);
  if (context === undefined) {
    throw new Error('useLeaderboard must be used within a LeaderboardProvider');
  }
  return context;
} 
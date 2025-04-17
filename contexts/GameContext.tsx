'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
import { Person } from '@/types';

interface GameContextType {
  score: number;
  setScore: (score: number) => void;
  people: Person[];
  loading: boolean;
  error: string | null;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [score, setScore] = useState(0);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <GameContext.Provider value={{ score, setScore, people, loading, error }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
} 
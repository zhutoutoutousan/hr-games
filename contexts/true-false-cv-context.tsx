'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';

type GameStage = 'idle' | 'showing' | 'challenge' | 'survey' | 'result';

interface Position {
  id: number;
  title: string;
  description: string;
}

interface Resume {
  id: number;
  position_id: number;
  content: string;
  is_ai: boolean;
  matching_score: number;
}

interface Judgment {
  resume_id: number;
  is_ai_guess: boolean;
  agree_score: boolean;
}

interface Survey {
  position_id: number;
  user_opinion: string;
  attitude_id: number;
}

interface Attitude {
  id: number;
  name: string;
  value: number;
}

interface GameState {
  currentStage: GameStage;
  currentPositionIndex: number;
  currentResumeIndex: number;
  positions: Position[];
  resumes: Resume[];
  attitudes: Attitude[];
  surveyData: {
    [key: number]: number;
  };
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const TrueFalseCVContext = createContext<{
  gameState: GameState;
  startGame: () => Promise<void>;
  submitJudgment: (judgment: Judgment) => Promise<void>;
  submitSurvey: (survey: Survey) => Promise<void>;
  nextRound: () => Promise<void>;
  positions: Position[];
  addPosition: (position: Omit<Position, 'id'>) => Promise<void>;
  addResume: (resume: Omit<Resume, 'id'>) => Promise<void>;
}>({
  gameState: {
    currentStage: 'idle',
    currentPositionIndex: 0,
    currentResumeIndex: 0,
    positions: [],
    resumes: [],
    attitudes: [],
    surveyData: {},
  },
  startGame: async () => {},
  submitJudgment: async () => {},
  submitSurvey: async () => {},
  nextRound: async () => {},
  positions: [],
  addPosition: async () => {},
  addResume: async () => {},
});

export function TrueFalseCVProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState>({
    currentStage: 'idle',
    currentPositionIndex: 0,
    currentResumeIndex: 0,
    positions: [],
    resumes: [],
    attitudes: [],
    surveyData: {},
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Load positions
      const { data: positions } = await supabase
        .from('positions')
        .select('*')
        .order('id');

      // Load attitudes
      const { data: attitudes } = await supabase
        .from('attitudes')
        .select('*')
        .order('value');

      // Load survey data
      const { data: surveys } = await supabase
        .from('surveys')
        .select('attitude_id');

      const surveyData = surveys?.reduce((acc, survey) => {
        acc[survey.attitude_id] = (acc[survey.attitude_id] || 0) + 1;
        return acc;
      }, {} as { [key: number]: number }) || {};

      setGameState(prev => ({
        ...prev,
        positions: positions || [],
        attitudes: attitudes || [],
        surveyData,
      }));
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const startGame = async () => {
    try {
      const positionId = gameState.positions[gameState.currentPositionIndex]?.id;
      if (!positionId) return;

      const { data: resumes } = await supabase
        .from('resumes')
        .select('*')
        .eq('position_id', positionId)
        .order('id');

      setGameState(prev => ({
        ...prev,
        currentStage: 'showing',
        resumes: resumes || [],
      }));
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const submitJudgment = async (judgment: Judgment) => {
    try {
      await supabase.from('judgments').insert([judgment]);

      setGameState(prev => {
        const nextResumeIndex = prev.currentResumeIndex + 1;
        const nextStage = nextResumeIndex >= prev.resumes.length ? 'survey' : 'challenge';
        
        return {
          ...prev,
          currentStage: nextStage,
          currentResumeIndex: nextResumeIndex,
        };
      });
    } catch (error) {
      console.error('Error submitting judgment:', error);
    }
  };

  const submitSurvey = async (survey: Survey) => {
    try {
      await supabase.from('surveys').insert([survey]);

      // Update survey data
      const { data: surveys } = await supabase
        .from('surveys')
        .select('attitude_id');

      const surveyData = surveys?.reduce((acc, survey) => {
        acc[survey.attitude_id] = (acc[survey.attitude_id] || 0) + 1;
        return acc;
      }, {} as { [key: number]: number }) || {};

      setGameState(prev => ({
        ...prev,
        currentStage: 'result',
        surveyData,
      }));
    } catch (error) {
      console.error('Error submitting survey:', error);
    }
  };

  const nextRound = async () => {
    setGameState(prev => {
      const nextPositionIndex = (prev.currentPositionIndex + 1) % prev.positions.length;
      return {
        ...prev,
        currentStage: 'idle',
        currentPositionIndex: nextPositionIndex,
        currentResumeIndex: 0,
        resumes: [],
      };
    });
  };

  const addPosition = async (position: Omit<Position, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('positions')
        .insert([position])
        .select()
        .single();

      if (error) throw error;

      setGameState(prev => ({
        ...prev,
        positions: [...prev.positions, data],
      }));
    } catch (error) {
      console.error('Error adding position:', error);
    }
  };

  const addResume = async (resume: Omit<Resume, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('resumes')
        .insert([resume])
        .select()
        .single();

      if (error) throw error;

      setGameState(prev => ({
        ...prev,
        resumes: [...prev.resumes, data],
      }));
    } catch (error) {
      console.error('Error adding resume:', error);
    }
  };

  return (
    <TrueFalseCVContext.Provider
      value={{
        gameState,
        startGame,
        submitJudgment,
        submitSurvey,
        nextRound,
        positions: gameState.positions,
        addPosition,
        addResume,
      }}
    >
      {children}
    </TrueFalseCVContext.Provider>
  );
}

export const useTrueFalseCV = () => useContext(TrueFalseCVContext);
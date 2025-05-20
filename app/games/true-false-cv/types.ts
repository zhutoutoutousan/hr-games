export interface Resume {
  id: string;
  content: string;
  aiScore: number;
  isAIGenerated: boolean;
  jobPositionId: string;
  createdAt: string;
  updatedAt: string;
}

export type GameState = 'idle' | 'playing' | 'result' | 'survey';

export interface SurveyResult {
  aiLeadership: string;
  aiImpactAreas: string;
}

export interface LeadershipResult {
  aiLeadership: string;
}

export interface ImpactResult {
  aiImpactAreas: string;
}

export interface Answer {
  isAI: boolean;
  agreeScore: boolean;
}

export interface Person {
  id: string;
  name: string;
  email: string;
  profile: string;
}

export interface Match {
  id: string;
  personId: string;
  score: number;
  createdAt: string;
}

export interface GameStateProps {
  onStartGame: () => void;
  isLoading: boolean;
}

export interface PlayingStateProps {
  currentPosition: JobPosition;
  currentResume: Resume;
  currentResumeIndex: number;
  isAIAnswer: boolean | null;
  agreeScoreAnswer: boolean | null;
  setIsAIAnswer: (value: boolean) => void;
  setAgreeScoreAnswer: (value: boolean) => void;
  handleConfirm: () => void;
  showFeedback: boolean;
  isCorrect: boolean;
  isMobile: boolean;
}

export interface SurveyStateProps {
  surveyAnswers: {
    aiUsageOpinion: string;
    aiLeadership: string;
    aiImpactAreas: string[];
    otherImpactArea: string;
  };
  setSurveyAnswers: (answers: any) => void;
  handleSurveySubmit: () => void;
  isMobile: boolean;
}

export interface ResultStateProps {
  isMobile: boolean;
}

export interface JobPosition {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
} 
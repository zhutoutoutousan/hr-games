'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSurveyData, submitSurveyAnswer } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { IdleState } from './components/IdleState';
import { PlayingState } from './components/PlayingState';
import { SurveyState } from './components/SurveyState';
import { ResultState } from './components/ResultState';
import { JOB_POSITIONS, RESUMES_GROUP_1, RESUMES_GROUP_2 } from './data';
import { 
  Resume, 
  GameState, 
  SurveyResult, 
  LeadershipResult, 
  ImpactResult, 
  Answer, 
  Person, 
  Match,
  JobPosition
} from './types';
import { v4 as uuidv4 } from 'uuid';

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];

const DEFAULT_SURVEY_DATA = [
  { name: '可以接受，只要确保提供的信息真实可靠', value: 0 },
  { name: '可以接受，这是求职者掌握和运用现代科技能力的一部分', value: 0 },
  { name: '可以接受，但应有所限制，过度依赖AI可能会掩盖候选人的真实技能和创造力。', value: 0 },
  { name: '不接受，因为可能导致信息失真或不公平竞争', value: 0 },
  { name: '不接受，这可能会削弱求职过程中应有的个人努力和真实性', value: 0 },
  { name: '不确定/需要进一步观察', value: 0 },
];

// Custom hook for mobile detection
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

export default function TrueFalseCVGame() {
  const router = useRouter();
  const { toast } = useToast();
  const [gameState, setGameState] = useState<GameState>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<JobPosition | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [currentResumeIndex, setCurrentResumeIndex] = useState(0);
  const [isAIAnswer, setIsAIAnswer] = useState<boolean | null>(null);
  const [agreeScoreAnswer, setAgreeScoreAnswer] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [surveyAnswers, setSurveyAnswers] = useState({
    aiUsageOpinion: '',
    aiLeadership: '',
    aiImpactAreas: [] as string[],
    otherImpactArea: ''
  });
  const [surveyData, setSurveyData] = useState<any[]>([]);
  const [leadershipData, setLeadershipData] = useState<any[]>([]);
  const [impactData, setImpactData] = useState<any[]>([]);
  const [countdown, setCountdown] = useState(60);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchSurveyData();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'result') {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setGameState('idle');
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameState]);

  const fetchSurveyData = async () => {
    try {
      console.log('Starting fetchSurveyData...');
      
      const data = await getSurveyData();
      console.log('Raw survey data:', data);
      setSurveyData(data.length > 0 ? data : DEFAULT_SURVEY_DATA);
      
      // Fetch leadership data
      console.log('Fetching leadership data...');
      const { data: leadershipResults } = await supabase
        .from('SurveyAnswer')
        .select('aiLeadership');
      
      console.log('Raw leadership results:', leadershipResults);
      
      const leadershipCounts = {
        '由科技部门主导': 0,
        '由业务部门主导': 0,
        '由公司高层管理（C-Suite）主导': 0
      };
      
      leadershipResults?.forEach((result: LeadershipResult) => {
        console.log('Processing leadership result:', result);
        if (result.aiLeadership in leadershipCounts) {
          leadershipCounts[result.aiLeadership as keyof typeof leadershipCounts]++;
        }
      });
      
      console.log('Processed leadership counts:', leadershipCounts);
      
      setLeadershipData(Object.entries(leadershipCounts).map(([name, value]) => ({
        name,
        value
      })));

      // Fetch impact areas data
      console.log('Fetching impact areas data...');
      const { data: impactResults } = await supabase
        .from('SurveyAnswer')
        .select('aiImpactAreas');
      
      console.log('Raw impact results:', impactResults);
      
      const impactCounts = {
        '简历筛选与评估': 0,
        '安排面试': 0,
        '知识库查询': 0,
        '自动生成JD': 0,
        '自动生成招聘沟通内容': 0,
        '会议纪要/面试记录': 0
      };
      
      impactResults?.forEach((result: ImpactResult) => {
        console.log('Processing impact result:', result);
        try {
          const areas = JSON.parse(result.aiImpactAreas);
          console.log('Parsed impact areas:', areas);
          areas.forEach((area: string) => {
            if (area in impactCounts) {
              impactCounts[area as keyof typeof impactCounts]++;
            }
          });
        } catch (error) {
          console.error('Error parsing impact areas:', error, 'Raw data:', result.aiImpactAreas);
        }
      });
      
      console.log('Processed impact counts:', impactCounts);
      
      setImpactData(Object.entries(impactCounts).map(([name, value]) => ({
        name,
        value
      })));
      
      console.log('Survey data fetch completed successfully');
    } catch (error) {
      console.error('Error fetching survey data:', error);
      setSurveyData(DEFAULT_SURVEY_DATA);
    }
  };

  const handleStartGame = async () => {
    try {
      setIsLoading(true);
      // Initialize game state
      setCurrentResumeIndex(0);
      setAnswers([]);
      setIsAIAnswer(null);
      setAgreeScoreAnswer(null);
      
      // Randomly select between position 0 and 1
      const randomIndex = Math.random() < 0.5 ? 0 : 1;
      
      // Set job position and corresponding resume group
      setCurrentPosition(JOB_POSITIONS[randomIndex]);
      setResumes(randomIndex === 0 ? RESUMES_GROUP_1 : RESUMES_GROUP_2);
      
      setGameState('playing');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start game. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (isAIAnswer === null || agreeScoreAnswer === null) return;

    setAnswers(prev => [...prev, { isAI: isAIAnswer, agreeScore: agreeScoreAnswer }]);

    if (currentResumeIndex < resumes.length - 1) {
      setCurrentResumeIndex(prev => prev + 1);
      setIsAIAnswer(null);
      setAgreeScoreAnswer(null);
    } else {
      setGameState('survey');
    }
  };

  const handleSurveySubmit = async () => {
    try {
      console.log('Submitting survey answers:', surveyAnswers);
      
      const { error } = await supabase
        .from('SurveyAnswer')
        .insert([{
          id: uuidv4(),
          participantId: uuidv4(),
          aiUsageOpinion: surveyAnswers.aiUsageOpinion,
          aiLeadership: surveyAnswers.aiLeadership,
          aiImpactAreas: JSON.stringify(surveyAnswers.aiImpactAreas),
          otherImpactArea: surveyAnswers.otherImpactArea,
          createdAt: new Date().toISOString()
        }]);

      if (error) {
        console.error('Error submitting survey:', error);
        toast({
          title: "Error",
          description: "Failed to submit survey. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Survey submitted successfully');
      setGameState('result');
    } catch (error) {
      console.error('Error in handleSurveySubmit:', error);
      toast({
        title: "Error",
        description: "Failed to submit survey. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (gameState === 'idle') {
    return <IdleState onStartGame={handleStartGame} isLoading={isLoading} />;
  }

  if (gameState === 'playing' && currentPosition && resumes.length > 0) {
    return (
      <PlayingState
        currentPosition={currentPosition}
        currentResume={resumes[currentResumeIndex]}
        currentResumeIndex={currentResumeIndex}
        isAIAnswer={isAIAnswer}
        agreeScoreAnswer={agreeScoreAnswer}
        setIsAIAnswer={setIsAIAnswer}
        setAgreeScoreAnswer={setAgreeScoreAnswer}
        handleConfirm={handleConfirm}
        showFeedback={showFeedback}
        isCorrect={isCorrect}
        isMobile={isMobile}
      />
    );
  }

  if (gameState === 'survey') {
    return (
      <SurveyState
        surveyAnswers={surveyAnswers}
        setSurveyAnswers={setSurveyAnswers}
        handleSurveySubmit={handleSurveySubmit}
        isMobile={isMobile}
      />
    );
  }

  if (gameState === 'result') {
    return (
      <ResultState
        isMobile={isMobile}
      />
    );
  }

  return null;
}
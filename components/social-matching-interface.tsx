'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import dynamic from 'next/dynamic';
import { Progress } from '@/components/ui/progress';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Dynamically import QRCodeSVG with no SSR
const QRCodeSVG = dynamic(() => import('qrcode.react').then(mod => mod.QRCodeSVG), {
  ssr: false
});

interface Person {
  id: number;
  name: string;
  email: string;
  gender: string;
  industry: string;
  position: string;
  hobbies: string;
  hrConcern: string;
  socialPreference: string;
  avatarRequest: string;
}

interface Match {
  id: string;
  match_score: number;
  person: Person;
  reasoning: string;
  reasoning_steps: string[];
}

type GameStage = 'email' | 'profile' | 'matching' | 'result' | 'matchSuccess';

interface MatchingStep {
  candidate: Person;
  score: number;
  reasoning: string;
  reasoning_steps: string[];
}

type MatchingViewStage = 'all-participants' | 'shuffle' | 'analysis' | 'results' | 'countdown';

// Add loading animation component
const LoadingAnimation = () => (
  <div className="flex flex-col items-center justify-center space-y-4">
    <div className="relative w-24 h-24">
      <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
    </div>
    <div className="text-xl font-semibold text-blue-600">AI 正在分析匹配...</div>
    <div className="text-gray-500">正在寻找最合适的 5 位匹配对象</div>
  </div>
);

// Add function to randomly select people
const getRandomPeople = (people: Person[], count: number = 5): Person[] => {
  const shuffled = [...people].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Add helper functions for rule-based matching
const findCommonWords = (str1: string, str2: string): string[] => {
  const words1 = str1.toLowerCase().split(/[\s,，]+/);
  const words2 = str2.toLowerCase().split(/[\s,，]+/);
  return words1.filter(word => words2.includes(word));
};

const calculateRuleBasedScore = (user: Person, candidate: Person): number => {
  let score = 0;
  
  // Check industry overlap
  const industryOverlap = findCommonWords(user.industry, candidate.industry);
  if (industryOverlap.length > 0) {
    score += 30;
  }
  
  // Check position overlap
  const positionOverlap = findCommonWords(user.position, candidate.position);
  if (positionOverlap.length > 0) {
    score += 20;
  }
  
  // Check hobbies overlap
  const hobbiesOverlap = findCommonWords(user.hobbies, candidate.hobbies);
  if (hobbiesOverlap.length > 0) {
    score += 25;
  }
  
  // Check social preference match
  if (user.socialPreference === candidate.socialPreference) {
    score += 25;
  }
  
  return score;
};

// Add type for Supabase match response
interface SupabaseMatch {
  id: string;
  score: number;
  createdAt: string;
  updatedAt: string;
  participantId: string;
  matchedWithId: string;
  isActive: boolean;
  People: {
    id: number;
    name: string;
    email: string;
    gender: string;
    industry: string;
    position: string;
    hobbies: string;
    hrConcern: string;
    socialPreference: string;
    avatarRequest: string;
  };
}

export function SocialMatchingInterface() {
  const [stage, setStage] = useState<GameStage>('email');
  const [email, setEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [userProfile, setUserProfile] = useState<Person | null>(null);
  const [myMatches, setMyMatches] = useState<Match[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isLoadingPeople, setIsLoadingPeople] = useState(false);
  const [hasLoadedPeople, setHasLoadedPeople] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    industry: '',
    position: '',
    hobbies: '',
    avatarRequest: ''
  });

  const [matchingSteps, setMatchingSteps] = useState<MatchingStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedMatches, setStreamedMatches] = useState<Match[]>([]);

  // Add new state for match success
  const [showMatchSuccess, setShowMatchSuccess] = useState(false);
  const [successfulMatch, setSuccessfulMatch] = useState<Match | null>(null);

  // Add search state
  const [searchQuery, setSearchQuery] = useState('');

  // Add search filter function
  const filteredPeople = people.filter(person => 
    person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.hobbies.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add new state for email error
  const [emailError, setEmailError] = useState<string | null>(null);

  // Add new state for matching view stage
  const [matchingViewStage, setMatchingViewStage] = useState<MatchingViewStage>('all-participants');
  const [selectedPeople, setSelectedPeople] = useState<Person[]>([]);
  const [countdown, setCountdown] = useState(3);

  // Add useEffect to load matches when profile view is active
  useEffect(() => {
    const loadMatches = async () => {
      if (stage !== 'profile' || !userProfile) return;

      try {
        // Load user's matches from the database using ID
        const { data: matchesAsParticipant, error: matchesAsParticipantError } = await supabase
          .from('Match')
          .select(`
            id,
            score,
            createdAt,
            updatedAt,
            participantId,
            matchedWithId,
            isActive,
            People!Match_matchedWithId_fkey (
              id,
              name,
              email,
              gender,
              industry,
              position,
              hobbies,
              hrConcern,
              socialPreference,
              avatarRequest
            )
          `)
          .eq('participantId', userProfile.id)
          .eq('isActive', true)
          .returns<SupabaseMatch[]>();

        const { data: matchesAsMatched, error: matchesAsMatchedError } = await supabase
          .from('Match')
          .select(`
            id,
            score,
            createdAt,
            updatedAt,
            participantId,
            matchedWithId,
            isActive,
            People!Match_participantId_fkey (
              id,
              name,
              email,
              gender,
              industry,
              position,
              hobbies,
              hrConcern,
              socialPreference,
              avatarRequest
            )
          `)
          .eq('matchedWithId', userProfile.id)
          .eq('isActive', true)
          .returns<SupabaseMatch[]>();

        if (matchesAsParticipantError || matchesAsMatchedError) {
          throw matchesAsParticipantError || matchesAsMatchedError;
        }

        // Combine both types of matches
        const matches = [
          ...(matchesAsParticipant || []).map(match => ({
            id: match.id,
            match_score: match.score,
            person: match.People,
            reasoning: '基于AI匹配算法',
            reasoning_steps: ['匹配度分析', '兴趣相似度', '行业背景'],
            createdAt: match.createdAt,
            updatedAt: match.updatedAt,
            participantId: match.participantId,
            matchedWithId: match.matchedWithId,
            isActive: match.isActive
          })),
          ...(matchesAsMatched || []).map(match => ({
            id: match.id,
            match_score: match.score,
            person: match.People,
            reasoning: '基于AI匹配算法',
            reasoning_steps: ['匹配度分析', '兴趣相似度', '行业背景'],
            createdAt: match.createdAt,
            updatedAt: match.updatedAt,
            participantId: match.participantId,
            matchedWithId: match.matchedWithId,
            isActive: match.isActive
          }))
        ].filter(match => match.person); // Remove any undefined persons

        setMyMatches(matches);
      } catch (error) {
        console.error('Error loading matches:', error);
        toast({
          title: "加载失败",
          description: "加载匹配记录失败，请重试",
          variant: "destructive"
        });
      }
    };

    loadMatches();
  }, [stage, userProfile]);

  // Load people when form stage is active
  useEffect(() => {
    const loadPeople = async () => {
      if (stage !== 'matching' || hasLoadedPeople) return;
      
      setIsLoadingPeople(true);
      try {
        const response = await fetch('/api/people');
        if (!response.ok) {
          throw new Error('Failed to fetch people');
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        const newPeople: Person[] = [];

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'person') {
                  newPeople.push(data.data);
                }
              }
            }
          }
        }

        setPeople(newPeople);
        setHasLoadedPeople(true);
      } catch (error) {
        console.error('Error loading people:', error);
        toast({
          title: "加载失败",
          description: "加载用户列表失败，请重试",
          variant: "destructive"
        });
      } finally {
        setIsLoadingPeople(false);
      }
    };

    loadPeople();
  }, [stage, hasLoadedPeople]);

  const getDeepSeekMatch = async (userData: typeof formData) => {
    try {
      const response = await fetch('/api/deepseek/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get match');
      }

      const data = await response.json();
      return data.matches;
    } catch (error) {
      console.error('Error getting match:', error);
      throw error;
    }
  };

  const getRandomCatImage = () => {
    const randomId = Math.floor(Math.random() * 1000);
    return `https://cataas.com/cat?${randomId}`;
  };

  const handleEmailVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setEmailError(null);

    try {
      // Always load people data first
      const response = await fetch('/api/people');
      if (!response.ok) {
        throw new Error('Failed to fetch people');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      const allPeople: Person[] = [];
      let emailFound = false;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'person') {
                allPeople.push(data.data);
                // Check if the email matches
                if (data.data.email === email) {
                  emailFound = true;
                  // Set user profile immediately when found
                  setUserProfile({
                    id: data.data.id,
                    name: data.data.name,
                    email: data.data.email,
                    gender: data.data.gender,
                    industry: data.data.industry,
                    position: data.data.position,
                    hobbies: data.data.hobbies,
                    hrConcern: data.data.hrConcern,
                    socialPreference: data.data.socialPreference,
                    avatarRequest: data.data.avatarRequest
                  });
                }
              }
            }
          }
        }
      }

      setPeople(allPeople);
      setHasLoadedPeople(true);

      if (!emailFound) {
        setEmailError('邮箱未注册或尚未同步，请稍等');
        return;
      }

      // After successful verification, directly go to matching stage
      setStage('matching');
      setMatchingViewStage('all-participants');
      setIsStreaming(true);
      setStreamedMatches([]);
      
      // Get current user's ID
      const currentUser = allPeople.find(person => person.email === email);
      if (!currentUser) {
        throw new Error('User not found');
      }

      // Get all available people excluding the current user
      const availablePeople = allPeople.filter(person => 
        person.email !== email
      );

      // Calculate rule-based scores for all available people
      const scoredPeople = availablePeople.map(person => ({
        person,
        score: calculateRuleBasedScore(currentUser, person)
      }));

      // Sort by score and take top matches (up to 5)
      const ruleBasedMatches = scoredPeople
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(item => item.person);

      // If we have less than 5 matches, add random unmatched people
      let finalCandidates = [...ruleBasedMatches];
      if (finalCandidates.length < 5) {
        const remainingSlots = 5 - finalCandidates.length;
        const unmatchedPeople = availablePeople.filter(
          person => !finalCandidates.some(candidate => candidate.id === person.id)
        );
        const randomPeople = getRandomPeople(unmatchedPeople, remainingSlots);
        finalCandidates = [...finalCandidates, ...randomPeople];
      }

      setSelectedPeople(finalCandidates);
      
      // Create initial matches with placeholder scores
      const initialMatches = finalCandidates.map(person => ({
        id: person.id.toString(),
        match_score: 0,
        person,
        reasoning: 'AI分析中...',
        reasoning_steps: ['正在分析匹配度...']
      }));

      setMatches(initialMatches);
      setStreamedMatches(initialMatches);
      
      // Start the cinematic sequence
      setTimeout(() => setMatchingViewStage('shuffle'), 2000);
      setTimeout(() => setMatchingViewStage('analysis'), 4000);
      
      const matchResponse = await fetch('/api/deepseek/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userData: currentUser,
          candidates: finalCandidates
        }),
      });

      if (!matchResponse.ok) {
        throw new Error('Failed to get match');
      }

      const matchReader = matchResponse.body?.getReader();
      const matchDecoder = new TextDecoder();
      const newMatches: Match[] = [];

      if (matchReader) {
        while (true) {
          const { done, value } = await matchReader.read();
          if (done) break;

          const chunk = matchDecoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'match') {
                  if (data.data.person.name !== currentUser.name && newMatches.length < 5) {
                    const existingIndex = newMatches.findIndex(m => m.person.id === data.data.person.id);
                    if (existingIndex === -1) {
                      newMatches.push(data.data);
                      // Immediately update streamed matches
                      setStreamedMatches(prev => {
                        const updated = [...prev];
                        const index = updated.findIndex(m => m.person.id === data.data.person.id);
                        if (index !== -1) {
                          updated[index] = data.data;
                        }
                        return updated;
                      });
                      // Show results stage as soon as we get the first match
                      if (newMatches.length === 1) {
                        setMatchingViewStage('results');
                      }
                    }
                  }
                } else if (data.type === 'error') {
                  throw new Error(data.error);
                }
              } catch (error) {
                console.error('Error parsing match data:', error);
              }
            }
          }
        }
      }

      if (newMatches.length > 0) {
        setMatches(newMatches);
        
        // Start countdown after all results are shown
        setTimeout(() => {
          setMatchingViewStage('countdown');
          let count = 3;
          const countdownInterval = setInterval(() => {
            count--;
            setCountdown(count);
            if (count === 0) {
              clearInterval(countdownInterval);
              setStage('result');
            }
          }, 1000);
        }, 2000);
      }

    } catch (error) {
      console.error('Error in verification process:', error);
      setEmailError('邮箱验证失败，请重试');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userProfile) {
      toast({
        title: "匹配失败",
        description: "用户信息不完整，请重试",
        variant: "destructive"
      });
      return;
    }

    setStage('matching');
    setMatchingViewStage('all-participants');
    setIsStreaming(true);
    setStreamedMatches([]);
    
    try {
      // First, get all available people excluding the current user
      const availablePeople = people.filter(person => 
        person.email !== email && 
        !myMatches.some(match => match.person.email === person.email)
      );

      // Calculate rule-based scores for all available people
      const scoredPeople = availablePeople.map(person => ({
        person,
        score: calculateRuleBasedScore(userProfile, person)
      }));

      // Sort by score and take top matches (up to 5)
      const ruleBasedMatches = scoredPeople
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(item => item.person);

      // If we have less than 5 matches, add random unmatched people
      let finalCandidates = [...ruleBasedMatches];
      if (finalCandidates.length < 5) {
        const remainingSlots = 5 - finalCandidates.length;
        const unmatchedPeople = availablePeople.filter(
          person => !finalCandidates.some(candidate => candidate.id === person.id)
        );
        const randomPeople = getRandomPeople(unmatchedPeople, remainingSlots);
        finalCandidates = [...finalCandidates, ...randomPeople];
      }

      setSelectedPeople(finalCandidates);
      
      // Create initial matches with placeholder scores
      const initialMatches = finalCandidates.map(person => ({
        id: person.id.toString(),
        match_score: 0,
        person,
        reasoning: 'AI分析中...',
        reasoning_steps: ['正在分析匹配度...']
      }));

      setMatches(initialMatches);
      setStreamedMatches(initialMatches);
      
      // Start the cinematic sequence
      setTimeout(() => setMatchingViewStage('shuffle'), 2000);
      setTimeout(() => setMatchingViewStage('analysis'), 4000);
      
      const response = await fetch('/api/deepseek/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userData: userProfile,
          candidates: finalCandidates
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get match');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      const newMatches: Match[] = [];

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'match') {
                  if (data.data.person.name !== userProfile.name && newMatches.length < 5) {
                    const existingIndex = newMatches.findIndex(m => m.person.id === data.data.person.id);
                    if (existingIndex === -1) {
                      newMatches.push(data.data);
                      // Immediately update streamed matches
                      setStreamedMatches(prev => {
                        const updated = [...prev];
                        const index = updated.findIndex(m => m.person.id === data.data.person.id);
                        if (index !== -1) {
                          updated[index] = data.data;
                        }
                        return updated;
                      });
                      // Show results stage as soon as we get the first match
                      if (newMatches.length === 1) {
                        setMatchingViewStage('results');
                      }
                    }
                  }
                } else if (data.type === 'error') {
                  throw new Error(data.error);
                }
              } catch (error) {
                console.error('Error parsing match data:', error);
              }
            }
          }
        }
      }

      if (newMatches.length > 0) {
        setMatches(newMatches);
        
        // Start countdown after all results are shown
        setTimeout(() => {
          setMatchingViewStage('countdown');
          let count = 3;
          const countdownInterval = setInterval(() => {
            count--;
            setCountdown(count);
            if (count === 0) {
              clearInterval(countdownInterval);
              setStage('result');
            }
          }, 1000);
        }, 2000); // Reduced delay to 2 seconds
      }
    } catch (error) {
      console.error('Error in matching process:', error);
      toast({
        title: "匹配失败",
        description: "获取匹配结果失败，请重试",
        variant: "destructive"
      });
      setStage('profile');
    } finally {
      setIsStreaming(false);
    }
  };

  const handleRefresh = async () => {
    setStage('matching');
    try {
      const matches = await getDeepSeekMatch(formData);
      setMatches(matches);
      setStage('result');
    } catch (error) {
      console.error('Error refreshing match:', error);
      toast({
        title: "刷新失败",
        description: "获取新匹配结果失败，请重试",
        variant: "destructive"
      });
      setStage('result');
    }
  };

  // Function to calculate line positions and opacity based on match scores
  const getLineStyle = (score: number) => {
    const opacity = score / 100;
    return {
      opacity,
      strokeWidth: 1 + (opacity * 2),
    };
  };

  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    const offset = info.offset.x;
    
    if (Math.abs(offset) > threshold) {
      if (offset > 0) {
        // Get the current match from the matches array
        const currentMatch = matches[currentCardIndex];
        if (!currentMatch) return;

        // Get current user's ID from people array
        const currentUser = people.find(person => person.email === email);
        if (!currentUser) {
          toast({
            title: "匹配失败",
            description: "用户信息不完整，请重试",
            variant: "destructive"
          });
          return;
        }

        // Prevent self-matching
        if (currentMatch.person.id === currentUser.id) {
          toast({
            title: "无法匹配",
            description: "不能与自己匹配",
            variant: "destructive"
          });
          return;
        }

        // Swiped right (like) - Update match using Supabase
        try {
          // First check if the match already exists
          const { data: existingMatch, error: checkError } = await supabase
            .from('Match')
            .select('id')
            .eq('participantId', currentUser.id)
            .eq('matchedWithId', currentMatch.person.id)
            .maybeSingle();

          if (checkError) {
            console.error('Check error:', checkError);
            throw checkError;
          }

          // If match doesn't exist, create it
          if (!existingMatch) {
            const matchId = uuidv4(); // Generate a new UUID for the match
            const { error: insertError } = await supabase
              .from('Match')
              .insert([
                {
                  id: matchId,
                  participantId: currentUser.id,
                  matchedWithId: currentMatch.person.id,
                  score: currentMatch.match_score,
                  isActive: true,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }
              ]);

            if (insertError) {
              console.error('Insert error:', insertError);
              throw insertError;
            }

            // Show match success view
            setSuccessfulMatch(currentMatch);
            setShowMatchSuccess(true);
          } else {
            toast({
              title: "已经匹配过",
              description: `您已经和 ${currentMatch.person.name} 匹配过了`,
            });
          }
        } catch (error) {
          console.error('Error updating match:', error);
          toast({
            title: "匹配失败",
            description: error instanceof Error ? error.message : "更新匹配状态失败，请重试",
            variant: "destructive"
          });
        }
      }
      
      // Move to next card
      if (currentCardIndex < matches.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
      } else {
        // No more cards
        toast({
          title: "匹配完成",
          description: "您已经浏览完所有匹配结果！",
        });
      }
    }
    
    setDirection(0);
    setIsDragging(false);
  };

  // Update the handleStartMatching function
  const handleStartMatching = () => {
    setStage('matching');
  };

  // Update the handleBack function
  const handleBack = () => {
    if (stage === 'matching') {
      setStage('email');
    } else if (stage === 'result') {
      setStage('matching');
    } else if (stage === 'matchSuccess') {
      setStage('result');
    }
  };

  // Update the handleRetry function
  const handleRetry = () => {
    setStage('matching');
  };

  // Update the handleContinue function
  const handleContinue = () => {
    setStage('matching');
  };

  // Update the handleMatchSuccess function
  const handleMatchSuccess = () => {
    setStage('matchSuccess');
  };

  // Update the handleMatchError function
  const handleMatchError = () => {
    setStage('email');
  };

  // Update the handleMatchCancel function
  const handleMatchCancel = () => {
    setStage('email');
  };

  // Update the handleMatchRetry function
  const handleMatchRetry = () => {
    setStage('matching');
  };

  // Add this useEffect near the other useEffect hooks
  useEffect(() => {
    if (stage === 'result' && matches[currentCardIndex]?.reasoning_steps?.length > 0) {
      const totalSteps = matches[currentCardIndex].reasoning_steps.length;
      let currentIndex = 0;
      
      // Set initial step
      setCurrentStep(currentIndex);
      
      const interval = setInterval(() => {
        currentIndex = (currentIndex + 1) % totalSteps;
        setCurrentStep(currentIndex);
      }, 3000); // Change step every 3 seconds

      return () => clearInterval(interval);
    }
  }, [stage, matches, currentCardIndex]);

  // Add this useEffect to reset currentStep when card changes
  useEffect(() => {
    setCurrentStep(0);
  }, [currentCardIndex]);

  if (stage === 'email') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-blue-50 to-white">
        <Card className="w-full max-w-md p-8 text-center">
          <h1 className="text-3xl font-bold mb-4 text-blue-600">AI智能匹配</h1>
          <p className="text-gray-600 mb-6">请输入您的邮箱开始匹配之旅</p>
          
          <form onSubmit={handleEmailVerification} className="space-y-4">
            <div className="relative">
              <Input
                type="email"
                placeholder="请输入邮箱"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(null);
                }}
                className="w-full"
                required
              />
              {emailError && (
                <p className="text-red-500 text-sm mt-2 text-left">{emailError}</p>
              )}
            </div>
            
            <Button 
              type="submit"
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isVerifying}
            >
              {isVerifying ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  验证中...
                </div>
              ) : (
                '开始匹配'
              )}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  if (stage === 'profile') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - My Matches */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">我的匹配</h2>
                {myMatches.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">还没有匹配记录</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myMatches.map((match) => (
                      <Card key={match.id} className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={match.person.avatarRequest} />
                            <AvatarFallback>{match.person.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold">{match.person.name}</h3>
                            <p className="text-gray-600">{match.person.position} @ {match.person.industry}</p>
                            <div className="mt-2 flex items-center gap-2">
                              <div className="text-sm font-medium text-blue-600">{match.match_score}% 匹配度</div>
                              <div className="text-sm text-gray-500">· {match.person.hobbies}</div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Right Column - Start Matching Button */}
            <div className="lg:col-span-1">
              <Card className="p-6 h-full flex flex-col">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">开始匹配</h2>
                  <p className="text-gray-600 mb-6">
                    点击下方按钮开始AI智能匹配，找到最适合的合作伙伴
                  </p>
                </div>
                <Button
                  size="lg"
                  className="w-full h-16 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  onClick={handleFormSubmit}
                >
                  开始匹配
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'matching') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-4">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {matchingViewStage === 'all-participants' && (
              <motion.div
                key="all-participants"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-white mb-2">所有参与者</h1>
                  <p className="text-gray-400 text-sm">正在筛选最佳匹配...</p>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {people
                    .filter(person => person.email !== email)
                    .map((person) => (
                      <motion.div
                        key={person.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-800/50 rounded-lg p-4"
                      >
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={person.avatarRequest} />
                            <AvatarFallback>{person.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white">{person.name}</h3>
                            <p className="text-sm text-gray-400">{person.position} @ {person.industry}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </motion.div>
            )}

            {matchingViewStage === 'shuffle' && (
              <motion.div
                key="shuffle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-white mb-2">正在筛选</h1>
                  <p className="text-gray-400 text-sm">寻找最合适的匹配对象...</p>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {selectedPeople.map((person, index) => (
                    <motion.div
                      key={person.id}
                      initial={{ opacity: 0, x: -100 }}
                      animate={{ 
                        opacity: 1, 
                        x: 0,
                        transition: { delay: index * 0.2 }
                      }}
                      className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4"
                    >
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={person.avatarRequest} />
                          <AvatarFallback>{person.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white">{person.name}</h3>
                          <p className="text-sm text-gray-300">{person.position} @ {person.industry}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {matchingViewStage === 'analysis' && (
              <motion.div
                key="analysis"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center min-h-[60vh]"
              >
                <div className="relative w-24 h-24 mb-8">
                  <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">AI 分析生成中</h2>
                <p className="text-gray-400 text-center max-w-md">
                  正在分析匹配度、兴趣爱好、行业背景等多维度数据...
                </p>
              </motion.div>
            )}

            {matchingViewStage === 'results' && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-screen flex flex-col"
              >
                {/* Fixed Header */}
                <div className="text-center py-6 bg-gradient-to-b from-gray-900 to-transparent">
                  <h1 className="text-2xl font-bold text-white mb-2">匹配结果</h1>
                  <p className="text-gray-400 text-sm">为您找到的最佳匹配</p>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-4 pb-4">
                  <div className="max-w-7xl mx-auto space-y-4">
                    {streamedMatches
                      .sort((a, b) => b.match_score - a.match_score)
                      .map((match, index) => (
                        <motion.div
                          key={match.person.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ 
                            opacity: 1, 
                            y: 0,
                            transition: { delay: index * 0.2 }
                          }}
                          className="bg-gray-800/50 rounded-lg p-4"
                        >
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={match.person.avatarRequest} />
                              <AvatarFallback>{match.person.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-white">{match.person.name}</h3>
                              <p className="text-sm text-gray-400">{match.person.position} @ {match.person.industry}</p>
                              <p className="text-sm text-gray-400 mt-1">{match.person.hobbies}</p>
                            </div>
                            <div className="text-2xl font-bold text-blue-400">
                              {match.match_score}%
                            </div>
                          </div>
                          {match.reasoning_steps && (
                            <div className="mt-4 pt-4 border-t border-gray-700">
                              <div className="space-y-2">
                                {match.reasoning_steps.map((step, stepIndex) => (
                                  <motion.div
                                    key={stepIndex}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ 
                                      opacity: 1, 
                                      x: 0,
                                      transition: { delay: index * 0.2 + stepIndex * 0.1 }
                                    }}
                                    className="flex items-start gap-2"
                                  >
                                    <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm">
                                      {stepIndex + 1}
                                    </div>
                                    <p className="text-sm text-gray-300">{step}</p>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                  </div>
                </div>
              </motion.div>
            )}

            {matchingViewStage === 'countdown' && (
              <motion.div
                key="countdown"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/90 flex items-center justify-center"
              >
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center"
                >
                  <div className="text-8xl font-bold text-white mb-4">{countdown}</div>
                  <p className="text-xl text-gray-400">准备开始滑动匹配</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  if (stage === 'result') {
    const currentMatch = matches[currentCardIndex];
    if (!currentMatch) return null;

    // Add match success view component
    const MatchSuccessView = ({ match, onClose }: { match: Match; onClose: () => void }) => (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden"
        >
          <div className="relative">
            <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <div className="text-center text-white">
                <h2 className="text-4xl font-bold mb-2">匹配成功！</h2>
                <p className="text-xl">你们有 {match.match_score}% 的匹配度</p>
              </div>
            </div>
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                <AvatarImage src={match.person.avatarRequest} />
                <AvatarFallback>{match.person.name[0]}</AvatarFallback>
              </Avatar>
            </div>
          </div>
          
          <div className="pt-20 pb-6 px-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold">{match.person.name}</h3>
              <p className="text-gray-600">{match.person.position} @ {match.person.industry}</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-700">兴趣爱好</h4>
                <p className="text-gray-600">{match.person.hobbies}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-700">基本信息</h4>
                <p className="text-gray-600">
                  行业: {match.person.industry}
                  <br />
                  职位: {match.person.position}
                </p>
              </div>
            </div>
            
            <div className="mt-8 flex flex-col gap-4">
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={onClose}
              >
                返回首页
              </Button>
              <Button
                className="w-full bg-[#0065f0] hover:bg-[#0065f0]/90"
                onClick={() => {
                  toast({
                    title: "联系会议人员",
                    description: "请前往会议服务台，工作人员将协助您与匹配对象建立联系",
                    duration: 5000,
                  });
                }}
              >
                联系会议人员
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );

    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-center mb-4 md:mb-8">匹配结果</h1>
          
          <div className="relative h-[600px] md:h-[800px]">
            <AnimatePresence>
              {showMatchSuccess && successfulMatch && (
                <MatchSuccessView
                  match={successfulMatch}
                  onClose={() => {
                    setShowMatchSuccess(false);
                    setSuccessfulMatch(null);
                  }}
                />
              )}
              
              <motion.div
                key={currentCardIndex}
                className="absolute w-full"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  x: direction,
                  rotate: direction * 0.1
                }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={handleDragEnd}
                onDrag={(event, info) => {
                  setDirection(info.offset.x);
                }}
              >
                <Card className="bg-white shadow-lg">
                  <div className="relative h-[300px] md:h-[500px]">
                    <Avatar className="absolute inset-0 w-full h-full rounded-none">
                      <AvatarImage src={currentMatch.person.avatarRequest || getRandomCatImage()} />
                      <AvatarFallback>
                        {currentMatch.person.name ? currentMatch.person.name[0] : '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                      <h2 className="text-3xl font-bold text-white">
                        {currentMatch.person.name || '未知用户'}
                        <span className="ml-2 text-xl font-normal">
                          {currentMatch.person.position ? `(${currentMatch.person.position})` : ''}
                        </span>
                      </h2>
                      <p className="text-white/80 text-lg">{currentMatch.person.industry}</p>
                    </div>
                  </div>
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="text-3xl font-bold text-[#0065f0]">
                        {currentMatch.match_score}%
                      </div>
                      <div className="text-lg text-gray-500">
                        匹配度
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-gray-700 mb-2 text-lg">兴趣爱好</h3>
                        <p className="text-gray-600 text-lg">{currentMatch.person.hobbies}</p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-700 mb-2 text-lg">基本信息</h3>
                        <p className="text-gray-600 text-lg">
                          行业: {currentMatch.person.industry}
                          <br />
                          职位: {currentMatch.person.position}
                        </p>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-700 mb-2 text-lg">AI分析</h3>
                        <div className="bg-gray-50 p-6 rounded-lg">
                          {currentMatch.reasoning_steps && currentMatch.reasoning_steps.length > 0 ? (
                            <div className="h-[120px] relative">
                              <AnimatePresence mode="wait">
                                {currentMatch.reasoning_steps[currentStep] && (
                                  <motion.div
                                    key={currentStep}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{
                                      duration: 0.5
                                    }}
                                    className="absolute inset-0 flex items-start gap-3"
                                  >
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{ duration: 0.3 }}
                                      className="w-8 h-8 rounded-full bg-[#0065f0] text-white flex items-center justify-center text-lg font-bold"
                                    >
                                      {currentStep + 1}
                                    </motion.div>
                                    <motion.p
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ duration: 0.5 }}
                                      className="text-gray-700 text-lg"
                                    >
                                      {currentMatch.reasoning_steps[currentStep]}
                                    </motion.p>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ) : (
                            <p className="text-gray-700 text-lg">{currentMatch.reasoning}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
            
            {/* Swipe Tutorial */}
            <div className="absolute top-4 left-0 right-0 flex justify-center gap-4 md:gap-8">
              <div className="bg-white/90 backdrop-blur-sm px-4 md:px-6 py-2 md:py-3 rounded-lg shadow-lg">
                <p className="text-sm md:text-lg text-gray-700">
                  <span className="text-red-500 font-bold">← 左滑</span> 跳过 | 
                  <span className="text-green-500 font-bold"> 右滑 →</span> 匹配
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2 md:gap-4">
              <Button
                variant="outline"
                size="lg"
                className="w-32 md:w-40 h-10 md:h-12 text-sm md:text-lg"
                onClick={() => setStage('matching')}
              >
                重新匹配
              </Button>
              <Button
                variant="outline"
                onClick={() => setStage('email')}
              >
                返回首页
              </Button>
              <Button 
                size="lg"
                className="w-32 md:w-40 h-10 md:h-12 text-sm md:text-lg bg-[#0065f0] hover:bg-[#0065f0]/90"
                onClick={handleRefresh}
              >
                刷新结果
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'matchSuccess') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-blue-50 to-white">
        <Card className="w-full max-w-md overflow-hidden">
          <div className="relative h-64 bg-gray-100">
            <Avatar className="absolute inset-0 w-full h-full">
              <AvatarImage src={matches[currentIndex].person.avatarRequest} alt={matches[currentIndex].person.name} />
              <AvatarFallback>{matches[currentIndex].person.name?.[0] || '?'}</AvatarFallback>
            </Avatar>
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-bold">{matches[currentIndex].person.name}</h2>
            <p className="text-gray-600">{matches[currentIndex].person.position} @ {matches[currentIndex].person.industry}</p>
            <div className="mt-4">
              <h3 className="font-semibold">匹配度</h3>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${matches[currentIndex].match_score}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-1">{matches[currentIndex].match_score}%</p>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold">兴趣爱好</h3>
              <p className="text-gray-600">{matches[currentIndex].person.hobbies}</p>
            </div>
            <div className="mt-6 flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStage('profile')}
              >
                返回首页
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleRefresh}
              >
                刷新查看新匹配
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-blue-50 to-white">
      <Card className="w-full max-w-md overflow-hidden">
        <div className="relative h-64 bg-gray-100">
          <Avatar className="absolute inset-0 w-full h-full">
            <AvatarImage src={matches[currentIndex].person.avatarRequest} alt={matches[currentIndex].person.name} />
            <AvatarFallback>{matches[currentIndex].person.name?.[0] || '?'}</AvatarFallback>
          </Avatar>
        </div>
        <div className="p-6">
          <h2 className="text-2xl font-bold">{matches[currentIndex].person.name}</h2>
          <p className="text-gray-600">{matches[currentIndex].person.position} @ {matches[currentIndex].person.industry}</p>
          <div className="mt-4">
            <h3 className="font-semibold">匹配度</h3>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${matches[currentIndex].match_score}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-1">{matches[currentIndex].match_score}%</p>
          </div>
          <div className="mt-4">
            <h3 className="font-semibold">兴趣爱好</h3>
            <p className="text-gray-600">{matches[currentIndex].person.hobbies}</p>
          </div>
          <div className="mt-6 flex justify-between">
            <Button
              variant="outline"
              onClick={() => setStage('profile')}
            >
              返回首页
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleRefresh}
            >
              刷新查看新匹配
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
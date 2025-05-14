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
  gender: string;
  industry: string;
  position: string;
  hobbies: string;
  favoriteFood: string;
  leastFavoriteFood: string;
  hrConcern: string;
  weekendActivity: string;
  socialPreference: string;
  avatarRequest: string;
}

interface Match {
  id: number;
  match_score: number;
  person: Person;
  reasoning: string;
  reasoning_steps: string[];
}

type GameStage = 'qr' | 'form' | 'matching' | 'result' | 'matchSuccess';

interface MatchingStep {
  candidate: Person;
  score: number;
  reasoning: string;
  reasoning_steps: string[];
}

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

export function SocialMatchingInterface() {
  const [stage, setStage] = useState<GameStage>('qr');
  const [people, setPeople] = useState<Person[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isLoadingPeople, setIsLoadingPeople] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    industry: '',
    position: '',
    hobbies: '',
    favoriteFood: '',
    leastFavoriteFood: '',
    hrConcern: '',
    weekendActivity: '',
    socialPreference: '',
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

  // Load people when form stage is active
  useEffect(() => {
    const loadPeople = async () => {
      if (stage !== 'form') return;
      
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
  }, [stage]);

  const loadPeople = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/people');
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Failed to get reader');

      const decoder = new TextDecoder();
      let buffer = '';
      const newPeople: Person[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'person') {
              newPeople.push(data.data);
            }
          }
        }
      }

      setPeople(newPeople);
    } catch (error) {
      console.error('Error loading people:', error);
      toast({
        title: "加载失败",
        description: "加载匹配结果失败",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStage('matching');
    setMatchingSteps([]);
    setCurrentStep(0);
    setIsAnalyzing(true);
    setIsStreaming(true);
    setStreamedMatches([]);
    
    try {
      // Get random people from the pool
      const randomPeople = getRandomPeople(people);
      
      const response = await fetch('/api/deepseek/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userData: {
            ...formData,
            participantId: formData.name
          },
          candidates: randomPeople // Send the randomly selected people to the API
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
              const data = JSON.parse(line.slice(6));
              if (data.type === 'match') {
                // Filter out self-matches and limit to 5 matches
                if (data.data.person.name !== formData.name && newMatches.length < 5) {
                  newMatches.push(data.data);
                  setStreamedMatches(prev => [...prev, data.data]);
                  // Update loading state as soon as we get the first match
                  if (newMatches.length === 1) {
                    setIsAnalyzing(false);
                  }
                }
              } else if (data.type === 'error') {
                throw new Error(data.error);
              }
            }
          }
        }
      }

      // Update the final matches state after streaming is complete
      setMatches(newMatches);
      setStage('result');
    } catch (error) {
      console.error('Error in matching process:', error);
      toast({
        title: "匹配失败",
        description: "获取匹配结果失败，请重试",
        variant: "destructive"
      });
      setStage('form');
    } finally {
      setIsAnalyzing(false);
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

        // Prevent self-matching
        if (currentMatch.person.name === formData.name) {
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
            .eq('participantId', formData.name)
            .eq('matchedWithId', currentMatch.person.name)
            .maybeSingle();

          if (checkError) {
            console.error('Check error:', checkError);
            throw checkError;
          }

          // If match doesn't exist, create it
          if (!existingMatch) {
            const { error: insertError } = await supabase
              .from('Match')
              .insert([
                {
                  id: uuidv4(), // Generate a unique UUID for the match
                  participantId: formData.name,
                  matchedWithId: currentMatch.person.name,
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

  if (stage === 'qr') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-blue-50 to-white">
        <Card className="w-full max-w-md p-8 text-center">
          <h1 className="text-3xl font-bold mb-4 text-blue-600">认识新朋友，一起玩点新鲜的！</h1>
          <p className="text-gray-600 mb-6">扫码填写信息，体验AI智能配对。</p>
          <div className="mb-6 p-4 bg-white rounded-lg flex items-center justify-center">
            {typeof window !== 'undefined' && (
            <QRCodeSVG 
              value={`${window.location.origin}/games/matching/form`}
              size={200}
              level="H"
              includeMargin
            />
            )}
          </div>
          <Button 
            size="lg"
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={() => setStage('form')}
          >
            立即参与！
          </Button>
        </Card>
      </div>
    );
  }

  if (stage === 'form') {
    return (
      <div className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center">选择已有用户</h2>
          <Card className="p-4 md:p-6 h-[calc(100vh-200px)] md:h-[calc(100vh-250px)] flex flex-col">
            <div className="mb-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="搜索用户 (姓名、行业、职位、爱好)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {isLoadingPeople ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredPeople.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  {searchQuery ? '没有找到匹配的用户' : '暂无用户数据'}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPeople.map((person) => (
                    <Card 
                      key={person.id} 
                      className="p-3 md:p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => {
                        setFormData({
                          name: person.name,
                          gender: person.gender,
                          industry: person.industry,
                          position: person.position,
                          hobbies: person.hobbies,
                          favoriteFood: person.favoriteFood,
                          leastFavoriteFood: person.leastFavoriteFood,
                          hrConcern: person.hrConcern,
                          weekendActivity: person.weekendActivity,
                          socialPreference: person.socialPreference,
                          avatarRequest: person.avatarRequest
                        });
                        handleFormSubmit(new Event('submit') as any);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 md:h-12 md:w-12">
                          <AvatarImage src={person.avatarRequest || getRandomCatImage()} />
                          <AvatarFallback>
                            {person.name ? person.name[0] : '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm md:text-base truncate">{person.name}</h4>
                          <p className="text-xs md:text-sm text-gray-500 truncate">
                            {person.position} @ {person.industry}
                          </p>
                          <p className="text-xs text-gray-400 truncate mt-1">
                            {person.hobbies}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Add custom scrollbar styles */}
        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.05);
            border-radius: 3px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 3px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(0, 0, 0, 0.3);
          }
          
          /* Firefox scrollbar styles */
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0.05);
          }
        `}</style>
      </div>
    );
  }

  if (stage === 'matching') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl md:text-4xl font-bold text-white mb-2"
            >
              AI 匹配分析中
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 text-sm md:text-base"
            >
              正在寻找最合适的 5 位匹配对象
            </motion.p>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Loading Animation */}
            {isAnalyzing && streamedMatches.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <div className="relative w-24 h-24 mb-8">
                  <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div className="text-blue-400 text-lg font-medium">AI 正在分析中...</div>
              </motion.div>
            )}

            {/* Matches Grid with Fixed Height and Scrollbar */}
            <div className="h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-2">
                {streamedMatches.map((match, index) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 overflow-hidden">
                      <div className="relative">
                        {/* Match Score Badge */}
                        <div className="absolute top-4 right-4 z-10">
                          <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            {match.match_score}% 匹配
                          </div>
                        </div>

                        {/* Avatar Section */}
                        <div className="relative h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Avatar className="h-32 w-32 border-4 border-white/10">
                              <AvatarImage src={match.person.avatarRequest || getRandomCatImage()} />
                              <AvatarFallback className="bg-gray-700 text-white text-4xl">
                                {match.person.name?.[0] || '?'}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        </div>

                        {/* Info Section */}
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-xl font-bold text-white">
                                {match.person.name}
                              </h3>
                              <p className="text-gray-400">
                                {match.person.position} @ {match.person.industry}
                              </p>
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-gray-300">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <span className="text-sm">{match.person.hobbies}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-300">
                                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                <span className="text-sm">{match.person.hrConcern}</span>
                              </div>
                            </div>

                            {/* Match Analysis */}
                            {match.reasoning_steps && match.reasoning_steps.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-gray-700/50">
                                <div className="space-y-2">
                                  {match.reasoning_steps.map((step, stepIndex) => (
                                    <motion.div
                                      key={stepIndex}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: stepIndex * 0.1 }}
                                      className="flex items-start gap-2"
                                    >
                                      <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold">
                                        {stepIndex + 1}
                                      </div>
                                      <p className="text-sm text-gray-400">{step}</p>
                                    </motion.div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Progress Indicator */}
            {streamedMatches.length > 0 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0.8, opacity: 0.5 }}
                      animate={{ 
                        scale: i < streamedMatches.length ? 1 : 0.8,
                        opacity: i < streamedMatches.length ? 1 : 0.5
                      }}
                      className={`w-3 h-3 rounded-full ${
                        i < streamedMatches.length ? 'bg-blue-500' : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add custom scrollbar styles */}
        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 4px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
          }
          
          /* Firefox scrollbar styles */
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.1);
          }
        `}</style>
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
                <AvatarImage src={match.person.avatarRequest || getRandomCatImage()} />
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
                <h4 className="font-semibold text-gray-700">HR关注点</h4>
                <p className="text-gray-600">{match.person.hrConcern}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-700">社交偏好</h4>
                <p className="text-gray-600">
                  {match.person.weekendActivity}
                  <br />
                  {match.person.socialPreference}
                </p>
              </div>
            </div>
            
            <div className="mt-8 flex flex-col gap-4">
              <Button
                variant="outline"
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
                        <h3 className="font-semibold text-gray-700 mb-2 text-lg">食物偏好</h3>
                        <p className="text-gray-600 text-lg">
                          喜欢: {currentMatch.person.favoriteFood}
                          <br />
                          不喜欢: {currentMatch.person.leastFavoriteFood}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-700 mb-2 text-lg">HR关注点</h3>
                        <p className="text-gray-600 text-lg">{currentMatch.person.hrConcern}</p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-700 mb-2 text-lg">社交偏好</h3>
                        <p className="text-gray-600 text-lg">
                          周末活动: {currentMatch.person.weekendActivity}
                          <br />
                          社交场合: {currentMatch.person.socialPreference}
                        </p>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-700 mb-2 text-lg">AI分析</h3>
                        <div className="bg-gray-50 p-6 rounded-lg">
                          {currentMatch.reasoning_steps && currentMatch.reasoning_steps.length > 0 ? (
                            <div className="space-y-3">
                              {currentMatch.reasoning_steps.map((stepText, stepIndex) => (
                                <div key={stepIndex} className="flex items-start gap-3">
                                  <div className="w-8 h-8 rounded-full bg-[#0065f0] text-white flex items-center justify-center text-lg font-bold">
                                    {stepIndex + 1}
                                  </div>
                                  <p className="text-gray-700 text-lg">{stepText}</p>
                                </div>
                              ))}
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
                onClick={() => setStage('form')}
              >
                重新匹配
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
              onClick={() => setStage('qr')}
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
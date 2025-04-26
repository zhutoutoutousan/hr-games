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

type GameStage = 'qr' | 'form' | 'matching' | 'result';

interface MatchingStep {
  candidate: Person;
  score: number;
  reasoning: string;
  reasoning_steps: string[];
}

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
      const response = await fetch('/api/deepseek/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userData: formData,
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
                newMatches.push(data.data);
                setStreamedMatches(prev => [...prev, data.data]);
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
      <div className="min-h-screen p-8 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">填写信息</h2>
          <div className="grid grid-cols-2 gap-8">
            {/* Form Section */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">新用户注册</h3>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">我们如何称呼您？</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="gender">性别</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({...formData, gender: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择性别" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="男">男</SelectItem>
                      <SelectItem value="女">女</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="industry">您所在行业是？</Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => setFormData({...formData, industry: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="position">您的职位</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="hobbies">您的爱好是？</Label>
                  <Input
                    id="hobbies"
                    value={formData.hobbies}
                    onChange={(e) => setFormData({...formData, hobbies: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="favoriteFood">您最喜欢吃的东西？</Label>
                  <Input
                    id="favoriteFood"
                    value={formData.favoriteFood}
                    onChange={(e) => setFormData({...formData, favoriteFood: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="leastFavoriteFood">您最讨厌吃的东西？</Label>
                  <Input
                    id="leastFavoriteFood"
                    value={formData.leastFavoriteFood}
                    onChange={(e) => setFormData({...formData, leastFavoriteFood: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="hrConcern">您现在在HR领域最关心的一个问题是？</Label>
                  <Input
                    id="hrConcern"
                    value={formData.hrConcern}
                    onChange={(e) => setFormData({...formData, hrConcern: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="weekendActivity">你和朋友一起度过周末时，通常会：</Label>
                  <Input
                    id="weekendActivity"
                    value={formData.weekendActivity}
                    onChange={(e) => setFormData({...formData, weekendActivity: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="socialPreference">你更喜欢哪种社交场合？</Label>
                  <Input
                    id="socialPreference"
                    value={formData.socialPreference}
                    onChange={(e) => setFormData({...formData, socialPreference: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="avatarRequest">想知道您匹配度最高的新朋友是谁吗？与我们分享您的头像，方便TA找到你</Label>
                  <Input
                    id="avatarRequest"
                    value={formData.avatarRequest}
                    onChange={(e) => setFormData({...formData, avatarRequest: e.target.value})}
                    required
                  />
                </div>
                <Button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  提交信息
                </Button>
              </form>
            </Card>

            {/* User Selection Section */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">选择已有用户</h3>
              <p className="text-gray-600 mb-4">如果您已经在用户池中，请选择您的身份：</p>
              {isLoadingPeople ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : people.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  暂无用户数据
                </div>
              ) : (
                <div className="space-y-4">
                  {people.map((person) => (
                    <Card 
                      key={person.id} 
                      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
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
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={person.avatarRequest || getRandomCatImage()} />
                          <AvatarFallback>
                            {person.name ? person.name[0] : '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{person.name}</h4>
                          <p className="text-sm text-gray-500">
                            {person.position} @ {person.industry}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'matching') {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">AI 匹配分析中...</h1>
          
          <div className="grid grid-cols-2 gap-8">
            {/* Network Graph */}
            <div className="relative h-[600px] bg-white rounded-lg shadow-lg p-4">
              <svg className="absolute inset-0 w-full h-full">
                {/* Draw connections between all participants */}
                {matchingSteps.slice(0, currentStep + 1).map((step, index) => {
                  const currentCard = cardRefs.current[index];
                  if (!currentCard) return null;

                  const currentRect = currentCard.getBoundingClientRect();
                  const centerX = currentRect.left + currentRect.width / 2;
                  const centerY = currentRect.top + currentRect.height / 2;

                  // Draw connections to all other participants
                  return matchingSteps.slice(0, currentStep + 1).map((otherStep, otherIndex) => {
                    if (index >= otherIndex) return null; // Avoid duplicate connections

                    const otherCard = cardRefs.current[otherIndex];
                    if (!otherCard) return null;

                    const otherRect = otherCard.getBoundingClientRect();
                    const otherCenterX = otherRect.left + otherRect.width / 2;
                    const otherCenterY = otherRect.top + otherRect.height / 2;

                    // Calculate average score for the connection
                    const avgScore = (step.score + otherStep.score) / 2;
                    const style = getLineStyle(avgScore);

                    return (
                      <line
                        key={`connection-${index}-${otherIndex}`}
                        x1={centerX}
                        y1={centerY}
                        x2={otherCenterX}
                        y2={otherCenterY}
                        stroke="#0065f0"
                        strokeWidth={style.strokeWidth}
                        opacity={style.opacity}
                        className="transition-all duration-300"
                      />
                    );
                  });
                })}
              </svg>

              {/* Participant nodes */}
              <div className="grid grid-cols-2 gap-4">
                {streamedMatches.map((match, index) => (
                  <div
                    key={match.id}
                    ref={el => {
                      cardRefs.current[index] = el;
                    }}
                    className="relative"
                  >
                    <Card className="bg-white hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={match.person.avatarRequest || getRandomCatImage()} />
                            <AvatarFallback>
                              {match.person.name ? match.person.name[0] : '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">
                              {match.person.name || '未知用户'}
                              {match.person.position && (
                                <span className="ml-2 text-sm font-normal text-gray-500">
                                  ({match.person.position})
                                </span>
                              )}
                            </CardTitle>
                            {match.person.industry && (
                              <div className="text-sm text-gray-500">
                                {match.person.industry}
                              </div>
                            )}
                          </div>
                          <div className="ml-auto text-xl font-bold text-[#0065f0]">
                            {match.match_score}%
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {match.person.hobbies && (
                          <div className="text-sm text-gray-600">
                            <div className="font-medium">兴趣爱好:</div>
                            <div>{match.person.hobbies}</div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {/* Analysis Steps */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">匹配分析过程</h2>
              {streamedMatches.map((match, index) => (
                <Card key={match.id} className="bg-white">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{match.person.name}</h3>
                      <div className="text-[#0065f0] font-bold">{match.match_score}%</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {match.reasoning_steps && match.reasoning_steps.length > 0 ? (
                        <div className="space-y-2">
                          {match.reasoning_steps.map((stepText, stepIndex) => (
                            <div key={stepIndex} className="flex items-start gap-2">
                              <div className="w-6 h-6 rounded-full bg-[#0065f0] text-white flex items-center justify-center text-sm font-bold">
                                {stepIndex + 1}
                              </div>
                              <p className="text-gray-700">{stepText}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-700">{match.reasoning}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'result') {
    const currentMatch = matches[currentCardIndex];
    if (!currentMatch) return null;

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const threshold = 100;
      const offset = info.offset.x;
      
      if (Math.abs(offset) > threshold) {
        if (offset > 0) {
          // Swiped right (like)
          toast({
            title: "匹配成功！",
            description: `您和 ${currentMatch.person.name} 匹配成功！`,
          });
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

    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">匹配结果</h1>
          
          <div className="relative h-[800px]">
            <AnimatePresence>
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
                  <div className="relative h-[500px]">
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
                  <CardContent className="p-6">
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
            <div className="absolute top-4 left-0 right-0 flex justify-center gap-8">
              <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-lg shadow-lg">
                <p className="text-gray-700 text-lg">
                  <span className="text-red-500 font-bold">← 左滑</span> 跳过 | 
                  <span className="text-green-500 font-bold"> 右滑 →</span> 匹配
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-4">
              <Button
                variant="outline"
                size="lg"
                className="w-40 h-12 text-lg"
                onClick={() => setStage('form')}
              >
                重新匹配
              </Button>
          <Button 
                size="lg"
                className="w-40 h-12 text-lg bg-[#0065f0] hover:bg-[#0065f0]/90"
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
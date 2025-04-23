'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QRCodeSVG } from 'qrcode.react';

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
}

type GameStage = 'qr' | 'form' | 'matching' | 'result';

export function SocialMatchingInterface() {
  const [stage, setStage] = useState<GameStage>('qr');
  const [people, setPeople] = useState<Person[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
          candidates: people
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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStage('matching');
    
    try {
      // First load all people data
      await loadPeople();
      
      // Then get matches from DeepSeek
      const matches = await getDeepSeekMatch(formData);
      setMatches(matches);
      
      // Show results
      setStage('result');
    } catch (error) {
      console.error('Error in matching process:', error);
      toast({
        title: "匹配失败",
        description: "获取匹配结果失败，请重试",
        variant: "destructive"
      });
      setStage('form');
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

  if (stage === 'qr') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-blue-50 to-white">
        <Card className="w-full max-w-md p-8 text-center">
          <h1 className="text-3xl font-bold mb-4 text-blue-600">认识新朋友，一起玩点新鲜的！</h1>
          <p className="text-gray-600 mb-6">扫码填写信息，体验AI智能配对。</p>
          <div className="mb-6 p-4 bg-white rounded-lg">
            <QRCodeSVG 
              value={`${window.location.origin}/games/matching/form`}
              size={200}
              level="H"
              includeMargin
            />
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
        <Card className="w-full max-w-md mx-auto p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">填写信息</h2>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">姓名</Label>
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
              <Label htmlFor="industry">行业</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => setFormData({...formData, industry: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="position">职位</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData({...formData, position: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="hobbies">兴趣爱好</Label>
              <Input
                id="hobbies"
                value={formData.hobbies}
                onChange={(e) => setFormData({...formData, hobbies: e.target.value})}
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
      </div>
    );
  }

  if (stage === 'matching') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-blue-50 to-white">
        <div className="relative w-full max-w-md h-96">
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-4">AI 匹配中…</div>
              <div className="w-16 h-16 border-4 border-blue-600 rounded-full animate-spin mx-auto"></div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (stage === 'result') {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">匹配结果</h1>
          
          <div className="space-y-6">
            {matches.map((match, index) => (
              <Card key={match.id} className="bg-white">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">
                      {match.person.name}
                      <span className="ml-2 text-sm font-normal text-gray-500">
                        ({match.person.position} - {match.person.industry})
                      </span>
                    </CardTitle>
                    <div className="text-2xl font-bold text-[#0065f0]">
                      {match.match_score}%
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">基本信息</h3>
                      <div className="space-y-2">
                        <p><span className="text-gray-600">性别: </span>{match.person.gender}</p>
                        <p><span className="text-gray-600">职位: </span>{match.person.position}</p>
                        <p><span className="text-gray-600">行业: </span>{match.person.industry}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">兴趣爱好</h3>
                      <div className="space-y-2">
                        <p><span className="text-gray-600">爱好: </span>{match.person.hobbies}</p>
                        <p><span className="text-gray-600">喜欢的食物: </span>{match.person.favoriteFood}</p>
                        <p><span className="text-gray-600">不喜欢的食物: </span>{match.person.leastFavoriteFood}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-700 mb-2">HR关注点</h3>
                    <p>{match.person.hrConcern}</p>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-700 mb-2">社交偏好</h3>
                    <div className="space-y-2">
                      <p><span className="text-gray-600">周末活动: </span>{match.person.weekendActivity}</p>
                      <p><span className="text-gray-600">社交偏好: </span>{match.person.socialPreference}</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-700 mb-2">匹配分析</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700">{match.reasoning}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setStage('form')}
            >
              重新匹配
            </Button>
            <Button
              size="lg"
              className="bg-[#0065f0] hover:bg-[#0065f0]/90"
              onClick={handleRefresh}
            >
              刷新结果
            </Button>
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
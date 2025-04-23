'use client';

import { useState } from 'react';
import { useTrueFalseCV } from '@/contexts/true-false-cv-context';
import { useAdmin } from '@/contexts/admin-context';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];

export function TrueFalseCVGame() {
  const { gameState, startGame, submitJudgment, submitSurvey, nextRound } = useTrueFalseCV();
  const { isAdmin, login } = useAdmin();
  const router = useRouter();
  const [selectedAttitude, setSelectedAttitude] = useState<number | null>(null);
  const [userOpinion, setUserOpinion] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const currentPosition = gameState.positions[gameState.currentPositionIndex];
  const currentResume = gameState.resumes[gameState.currentResumeIndex];

  const surveyData = gameState.attitudes.map(attitude => ({
    name: attitude.name,
    value: gameState.surveyData[attitude.id] || 0,
  }));

  const handleStartGame = () => {
    startGame();
  };

  const handleSubmitJudgment = (isAiGuess: boolean, agreeScore: boolean) => {
    if (!currentResume) return;
    submitJudgment({
      resume_id: currentResume.id,
      is_ai_guess: isAiGuess,
      agree_score: agreeScore,
    });
  };

  const handleSubmitSurvey = () => {
    if (!currentPosition || !selectedAttitude) return;
    submitSurvey({
      position_id: currentPosition.id,
      user_opinion: userOpinion,
      attitude_id: selectedAttitude,
    });
  };

  const handleAdminLogin = () => {
    if (login(adminPassword)) {
      router.push('/games/true-false-cv/admin');
    } else {
      alert('密码错误');
    }
    setShowAdminLogin(false);
    setAdminPassword('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="absolute top-4 right-4">
        {!isAdmin && (
          <Button
            variant="outline"
            onClick={() => setShowAdminLogin(true)}
            className="bg-white"
          >
            管理员登录
          </Button>
        )}
      </div>

      {showAdminLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 bg-white w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">管理员登录</h3>
            <Input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="输入密码"
              className="mb-4"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAdminLogin();
                }
              }}
            />
            <div className="flex gap-4">
              <Button onClick={handleAdminLogin} className="flex-1">
                登录
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAdminLogin(false);
                  setAdminPassword('');
                }}
                className="flex-1"
              >
                取消
              </Button>
            </div>
          </Card>
        </div>
      )}

      <AnimatePresence mode="wait">
        {gameState.currentStage === 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="p-8 bg-white shadow-lg">
              <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">
                真假CV - AI简历识别挑战
              </h1>
              <div className="h-96 mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={surveyData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {surveyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center">
                <Button
                  onClick={handleStartGame}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
                >
                  开始游戏
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {gameState.currentStage === 'showing' && currentPosition && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="p-8 bg-white shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-blue-600">{currentPosition.title}</h2>
              <p className="text-gray-600 mb-8">{currentPosition.description}</p>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">AI匹配分数: {currentResume?.matching_score}%</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                  {currentResume?.content}
                </p>
                <Button
                  onClick={() => handleSubmitJudgment(false, true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                >
                  开始判断
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {gameState.currentStage === 'challenge' && currentResume && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="p-8 bg-white shadow-lg">
              <Progress
                value={(gameState.currentResumeIndex / gameState.resumes.length) * 100}
                className="mb-4"
              />
              <h3 className="text-xl font-semibold mb-4">请判断这份简历：</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">这份简历是AI生成的吗？</h4>
                  <RadioGroup
                    onValueChange={(value) => handleSubmitJudgment(value === 'true', true)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="ai-true" />
                      <Label htmlFor="ai-true">是</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="ai-false" />
                      <Label htmlFor="ai-false">否</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div>
                  <h4 className="font-medium mb-2">你同意AI的匹配分数吗？</h4>
                  <RadioGroup
                    onValueChange={(value) => handleSubmitJudgment(true, value === 'true')}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="score-true" />
                      <Label htmlFor="score-true">同意</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="score-false" />
                      <Label htmlFor="score-false">不同意</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {gameState.currentStage === 'survey' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="p-8 bg-white shadow-lg">
              <h3 className="text-xl font-semibold mb-4">你对AI生成简历的态度是？</h3>
              <RadioGroup
                onValueChange={(value) => setSelectedAttitude(Number(value))}
                className="space-y-4 mb-6"
              >
                {gameState.attitudes.map((attitude) => (
                  <div key={attitude.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={attitude.id.toString()} id={`attitude-${attitude.id}`} />
                    <Label htmlFor={`attitude-${attitude.id}`}>{attitude.name}</Label>
                  </div>
                ))}
              </RadioGroup>
              <div className="mb-6">
                <Label htmlFor="opinion">你的想法（选填）</Label>
                <textarea
                  id="opinion"
                  value={userOpinion}
                  onChange={(e) => setUserOpinion(e.target.value)}
                  className="w-full p-2 border rounded-md mt-2"
                  rows={4}
                />
              </div>
              <Button
                onClick={handleSubmitSurvey}
                disabled={!selectedAttitude}
                className={cn(
                  "w-full bg-blue-600 hover:bg-blue-700 text-white",
                  !selectedAttitude && "opacity-50 cursor-not-allowed"
                )}
              >
                提交
              </Button>
            </Card>
          </motion.div>
        )}

        {gameState.currentStage === 'result' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="p-8 bg-white shadow-lg">
              <h3 className="text-xl font-semibold mb-8 text-center">调查结果</h3>
              <div className="h-96 mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={surveyData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {surveyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center">
                <Button
                  onClick={nextRound}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
                >
                  下一轮
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
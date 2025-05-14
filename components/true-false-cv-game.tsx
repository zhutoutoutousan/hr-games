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
    if (adminPassword === '123456') {
      router.push('/games/true-false-cv/admin');
    } else {
      alert('密码错误');
    }
    setShowAdminLogin(false);
    setAdminPassword('');
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-b from-blue-50 to-white p-4">
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
            className="h-full flex flex-col items-center justify-center"
          >
            <Card className="w-full max-w-4xl p-8 bg-white shadow-lg">
              <h1 className="text-4xl font-bold text-center mb-8 text-blue-600">
                真假CV - AI简历识别挑战
              </h1>
              <div className="h-[60vh] mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={surveyData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={200}
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
                  className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 text-2xl rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  开始游戏
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {gameState.currentStage === 'showing' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full flex flex-col items-center justify-center"
          >
            <Card className="w-full max-w-4xl p-8 bg-white shadow-lg">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-blue-600 mb-4">{currentPosition.title}</h2>
                <p className="text-xl text-gray-600">{currentPosition.description}</p>
              </div>
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h3 className="text-2xl font-semibold mb-4">AI匹配分数: {currentResume?.matching_score}%</h3>
                  <div className="bg-white p-6 rounded-lg shadow-inner">
                    <p className="text-lg text-gray-700 whitespace-pre-wrap">{currentResume?.content}</p>
                  </div>
                </div>
                <Button
                  onClick={() => handleSubmitJudgment(false, true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-xl rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  开始判断
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {gameState.currentStage === 'challenge' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="h-full flex flex-col items-center justify-center"
          >
            <Card className="w-full max-w-4xl p-8 bg-white shadow-lg">
              <Progress
                value={(gameState.currentResumeIndex / gameState.resumes.length) * 100}
                className="h-3 mb-8"
              />
              <h3 className="text-3xl font-semibold mb-8 text-center text-blue-600">请判断这份简历</h3>
              <div className="space-y-8">
                <div className="bg-blue-50 p-6 rounded-xl">
                  <h4 className="text-2xl font-medium mb-4">这份简历是AI生成的吗？</h4>
                  <RadioGroup
                    onValueChange={(value) => handleSubmitJudgment(value === 'true', true)}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className="flex items-center justify-center">
                      <RadioGroupItem value="true" id="ai-true" className="h-6 w-6" />
                      <Label htmlFor="ai-true" className="text-xl ml-2">是</Label>
                    </div>
                    <div className="flex items-center justify-center">
                      <RadioGroupItem value="false" id="ai-false" className="h-6 w-6" />
                      <Label htmlFor="ai-false" className="text-xl ml-2">否</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-xl">
                  <h4 className="text-2xl font-medium mb-4">你同意AI的匹配分数吗？</h4>
                  <RadioGroup
                    onValueChange={(value) => handleSubmitJudgment(true, value === 'true')}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className="flex items-center justify-center">
                      <RadioGroupItem value="true" id="score-true" className="h-6 w-6" />
                      <Label htmlFor="score-true" className="text-xl ml-2">同意</Label>
                    </div>
                    <div className="flex items-center justify-center">
                      <RadioGroupItem value="false" id="score-false" className="h-6 w-6" />
                      <Label htmlFor="score-false" className="text-xl ml-2">不同意</Label>
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
            className="h-full flex flex-col items-center justify-center"
          >
            <Card className="w-full max-w-4xl p-8 bg-white shadow-lg">
              <h3 className="text-3xl font-semibold mb-8 text-center text-blue-600">你对AI生成简历的态度是？</h3>
              <RadioGroup
                onValueChange={(value) => setSelectedAttitude(Number(value))}
                className="space-y-6 mb-8"
              >
                {gameState.attitudes.map((attitude) => (
                  <div key={attitude.id} className="flex items-center space-x-4 bg-blue-50 p-4 rounded-xl">
                    <RadioGroupItem value={attitude.id.toString()} id={`attitude-${attitude.id}`} className="h-6 w-6" />
                    <Label htmlFor={`attitude-${attitude.id}`} className="text-xl">{attitude.name}</Label>
                  </div>
                ))}
              </RadioGroup>
              <div className="mb-8">
                <Label htmlFor="opinion" className="text-xl block mb-4">你的想法（选填）</Label>
                <textarea
                  id="opinion"
                  value={userOpinion}
                  onChange={(e) => setUserOpinion(e.target.value)}
                  className="w-full p-4 border rounded-xl text-lg min-h-[120px] resize-none"
                  placeholder="请输入你的想法..."
                />
              </div>
              <Button
                onClick={handleSubmitSurvey}
                disabled={!selectedAttitude}
                className={cn(
                  "w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-xl rounded-xl shadow-lg hover:shadow-xl transition-all duration-300",
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
            className="h-full flex flex-col items-center justify-center"
          >
            <Card className="w-full max-w-4xl p-8 bg-white shadow-lg">
              <h3 className="text-3xl font-semibold mb-8 text-center text-blue-600">调查结果</h3>
              <div className="h-[60vh] mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={surveyData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={200}
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
                  className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 text-2xl rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
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
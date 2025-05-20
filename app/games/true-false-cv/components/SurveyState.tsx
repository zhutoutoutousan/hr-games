import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SurveyStateProps } from '../types';
import { useState, useEffect } from 'react';

interface SurveyAnswer {
  aiUsageOpinion: string;
  aiLeadership: string;
  aiImpactAreas: string[];
  otherImpactArea: string;
}

const questions = [
  {
    id: 'aiUsageOpinion',
    title: '你认为候选人在求职中可以使用AI吗？',
    options: [
      '可以接受，只要确保提供的信息真实可靠',
      '可以接受，这是求职者掌握和运用现代科技能力的一部分',
      '可以接受，但应有所限制，过度依赖AI可能会掩盖候选人的真实技能和创造力',
      '不接受，因为可能导致信息失真或不公平竞争',
      '不接受，这可能会削弱求职过程中应有的个人努力和真实性',
      '不确定/需要进一步观察'
    ],
    mobileOptions: [
      '可以接受（信息真实）',
      '可以接受（科技能力）',
      '可以接受（有限制）',
      '不接受（信息失真）',
      '不接受（削弱努力）',
      '不确定'
    ]
  },
  {
    id: 'aiLeadership',
    title: '企业内部推动人工智能在人力资源管理中的应用应该：',
    options: [
      '由科技部门主导',
      '由业务部门主导',
      '由公司高层管理（C-Suite）主导'
    ],
    mobileOptions: [
      'IT部门主导',
      'HR部门主导',
      '高层管理主导'
    ]
  },
  {
    id: 'aiImpactAreas',
    title: '在贵公司的招聘工作中，您认为人工智能在以下哪些方面的影响最大？（可多选，最多选3项）',
    options: [
      '简历筛选与评估',
      '安排面试',
      '知识库查询',
      '自动生成JD',
      '自动生成招聘沟通内容',
      '会议纪要/面试记录',
      '其他'
    ],
    mobileOptions: [
      '简历筛选',
      '面试安排',
      '知识查询',
      '生成JD',
      '沟通内容',
      '会议记录',
      '其他'
    ],
    isMultiSelect: true
  }
];

export function SurveyState({
  surveyAnswers,
  setSurveyAnswers,
  handleSurveySubmit,
  isMobile
}: SurveyStateProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleOptionSelect = (questionId: string, option: string) => {
    if (questionId === 'aiImpactAreas') {
      setSurveyAnswers((prev: SurveyAnswer) => ({
        ...prev,
        aiImpactAreas: prev.aiImpactAreas.includes(option)
          ? prev.aiImpactAreas.filter((a: string) => a !== option)
          : prev.aiImpactAreas.length < 3
            ? [...prev.aiImpactAreas, option]
            : prev.aiImpactAreas
      }));
    } else {
      setSurveyAnswers((prev: SurveyAnswer) => ({ ...prev, [questionId]: option }));
    }
  };

  const handleNext = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentQuestion(prev => prev + 1);
      setIsTransitioning(false);
    }, 500);
  };

  const handlePrevious = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentQuestion(prev => prev - 1);
      setIsTransitioning(false);
    }, 500);
  };

  const isQuestionAnswered = (questionId: string) => {
    if (questionId === 'aiImpactAreas') {
      return surveyAnswers.aiImpactAreas.length > 0;
    }
    return !!surveyAnswers[questionId as keyof SurveyAnswer];
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="relative p-4 pb-32">
            {/* Progress Bar */}
            <div className="sticky top-0 bg-white/90 backdrop-blur-sm py-4 z-10">
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[rgb(0,101,240)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="text-center mt-2 text-sm text-gray-600">
                {Math.round(progress)}%
              </div>
            </div>

            {/* Question Container */}
            <div className="relative mt-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4"
                >
                  <h2 className="text-xl font-bold mb-6 text-center bg-gradient-to-r from-[rgb(0,101,240)] to-blue-400 bg-clip-text text-transparent">
                    {questions[currentQuestion].title}
                  </h2>

                  <div className="space-y-3">
                    {questions[currentQuestion].options.map((option, index) => {
                      const mobileOption = questions[currentQuestion].mobileOptions[index];
                      const isSelected = questions[currentQuestion].id === 'aiImpactAreas'
                        ? surveyAnswers.aiImpactAreas.includes(option)
                        : surveyAnswers[questions[currentQuestion].id as keyof SurveyAnswer] === option;

                      return (
                        <motion.div
                          key={option}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Button
                            variant={isSelected ? 'default' : 'outline'}
                            onClick={() => handleOptionSelect(questions[currentQuestion].id, option)}
                            className={`w-full justify-start text-left h-auto py-3 px-4 rounded-xl
                              ${isSelected ? 'bg-[rgb(0,101,240)] hover:bg-[rgb(0,101,240)]/90' : 'hover:bg-blue-50'}
                              transition-all duration-200`}
                          >
                            <span className="text-base">{mobileOption}</span>
                          </Button>
                        </motion.div>
                      );
                    })}
                  </div>

                  {questions[currentQuestion].id === 'aiImpactAreas' && 
                   surveyAnswers.aiImpactAreas.includes('其他') && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4"
                    >
                      <Input
                        type="text"
                        placeholder="请详细说明..."
                        value={surveyAnswers.otherImpactArea}
                        onChange={(e) => setSurveyAnswers((prev: SurveyAnswer) => ({ 
                          ...prev, 
                          otherImpactArea: e.target.value 
                        }))}
                        className="w-full p-3 rounded-xl border-2 border-[rgb(0,101,240)]/20 focus:border-[rgb(0,101,240)]"
                      />
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Navigation Buttons - Fixed at bottom */}
          <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 p-4">
            <div className="flex justify-between items-center max-w-md mx-auto">
              <Button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                variant="outline"
                className={`px-4 py-2 rounded-lg
                  ${currentQuestion === 0 ? 'opacity-50' : 'hover:bg-blue-50'}`}
              >
                上一步
              </Button>

              {currentQuestion < questions.length - 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={!isQuestionAnswered(questions[currentQuestion].id)}
                  className={`px-6 py-2 rounded-lg bg-[rgb(0,101,240)] hover:bg-[rgb(0,101,240)]/90
                    ${!isQuestionAnswered(questions[currentQuestion].id) ? 'opacity-50' : ''}`}
                >
                  下一步
                </Button>
              ) : (
                <Button
                  onClick={handleSurveySubmit}
                  disabled={!isQuestionAnswered(questions[currentQuestion].id)}
                  className={`px-6 py-2 rounded-lg bg-[rgb(0,101,240)] hover:bg-[rgb(0,101,240)]/90
                    ${!isQuestionAnswered(questions[currentQuestion].id) ? 'opacity-50' : ''}`}
                >
                  提交
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white overflow-hidden relative">
      <div className="absolute inset-0">
        {/* Animated background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-[rgb(0,101,240)] to-blue-400 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-400 to-[rgb(0,101,240)] rounded-full filter blur-3xl opacity-20 animate-pulse delay-300"></div>
          <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-gradient-to-r from-[rgb(0,101,240)] to-blue-300 rounded-full filter blur-3xl opacity-20 animate-pulse delay-700"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-white/50"></div>
        </div>

        {/* Content */}
        <div className="relative h-full flex items-center justify-center p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl"
          >
            {/* Progress Circle */}
            <div className="relative w-24 h-24 mx-auto mb-8">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  className="text-gray-200"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="44"
                  cx="50"
                  cy="50"
                />
                <motion.circle
                  className="text-[rgb(0,101,240)]"
                  strokeWidth="8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="44"
                  cx="50"
                  cy="50"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: progress / 100 }}
                  transition={{ duration: 0.5 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-[rgb(0,101,240)]">
                {Math.round(progress)}%
              </div>
            </div>

            {/* Question Container */}
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8 mb-24"
                >
                  <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center bg-gradient-to-r from-[rgb(0,101,240)] to-blue-400 bg-clip-text text-transparent">
                    {questions[currentQuestion].title}
                  </h2>

                  <div className="space-y-4">
                    {questions[currentQuestion].options.map((option, index) => {
                      const isSelected = questions[currentQuestion].id === 'aiImpactAreas'
                        ? surveyAnswers.aiImpactAreas.includes(option)
                        : surveyAnswers[questions[currentQuestion].id as keyof SurveyAnswer] === option;

                      return (
                        <motion.div
                          key={option}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Button
                            variant={isSelected ? 'default' : 'outline'}
                            onClick={() => handleOptionSelect(questions[currentQuestion].id, option)}
                            className={`w-full justify-start text-left h-auto py-4 px-6 rounded-xl
                              ${isSelected ? 'bg-[rgb(0,101,240)] hover:bg-[rgb(0,101,240)]/90' : 'hover:bg-blue-50'}
                              transition-all duration-300 transform hover:scale-[1.02]`}
                          >
                            <span className="text-lg">{option}</span>
                          </Button>
                        </motion.div>
                      );
                    })}
                  </div>

                  {questions[currentQuestion].id === 'aiImpactAreas' && 
                   surveyAnswers.aiImpactAreas.includes('其他') && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4"
                    >
                      <Input
                        type="text"
                        placeholder="请详细说明..."
                        value={surveyAnswers.otherImpactArea}
                        onChange={(e) => setSurveyAnswers((prev: SurveyAnswer) => ({ 
                          ...prev, 
                          otherImpactArea: e.target.value 
                        }))}
                        className="w-full p-4 rounded-xl border-2 border-[rgb(0,101,240)]/20 focus:border-[rgb(0,101,240)]"
                      />
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            <div className="fixed bottom-8 left-0 right-0 flex justify-between px-8 md:px-16">
              {/* Previous Button - Left Side */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  variant="outline"
                  className={`px-6 py-4 rounded-xl hover:bg-blue-50 transition-all duration-300
                    ${currentQuestion === 0 ? 'opacity-50' : 'hover:scale-105'}`}
                >
                  <span className="text-lg">← 上一步</span>
                </Button>
              </motion.div>

              {/* Next/Submit Button - Right Side */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {currentQuestion < questions.length - 1 ? (
                  <Button
                    onClick={handleNext}
                    disabled={!isQuestionAnswered(questions[currentQuestion].id)}
                    className={`px-12 py-6 rounded-xl bg-[rgb(0,101,240)] hover:bg-[rgb(0,101,240)]/90
                      transition-all duration-300 transform hover:scale-110 hover:shadow-lg
                      ${!isQuestionAnswered(questions[currentQuestion].id) ? 'opacity-50' : ''}`}
                  >
                    <span className="text-xl font-semibold">下一步 →</span>
                  </Button>
                ) : (
                  <Button
                    onClick={handleSurveySubmit}
                    disabled={!isQuestionAnswered(questions[currentQuestion].id)}
                    className={`px-12 py-6 rounded-xl bg-[rgb(0,101,240)] hover:bg-[rgb(0,101,240)]/90
                      transition-all duration-300 transform hover:scale-110 hover:shadow-lg
                      ${!isQuestionAnswered(questions[currentQuestion].id) ? 'opacity-50' : ''}`}
                  >
                    <span className="text-xl font-semibold">提交 →</span>
                  </Button>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 
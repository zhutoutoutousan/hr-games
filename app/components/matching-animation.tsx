import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MatchingAnimationProps {
  onComplete: () => void;
}

export function MatchingAnimation({ onComplete }: MatchingAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const totalSteps = 5;

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          onComplete();
          return 100;
        }
        return prev + 1;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [onComplete]);

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= totalSteps - 1) {
          clearInterval(stepTimer);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(stepTimer);
  }, []);

  const steps = [
    {
      title: "分析兴趣爱好",
      description: "正在分析您的兴趣爱好和生活方式",
      icon: "🎯"
    },
    {
      title: "匹配社交偏好",
      description: "根据您的社交偏好寻找合适的伙伴",
      icon: "🤝"
    },
    {
      title: "评估行业背景",
      description: "分析行业背景和职业发展",
      icon: "💼"
    },
    {
      title: "计算性格契合度",
      description: "评估性格特征和沟通方式",
      icon: "🧠"
    },
    {
      title: "生成最佳匹配",
      description: "正在生成最适合的匹配结果",
      icon: "✨"
    }
  ];

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-blue-900 to-black z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-3xl p-6 space-y-6 border border-white/20">
        <div className="space-y-2">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-center text-white"
          >
            AI 匹配分析中
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-blue-200 text-center"
          >
            正在寻找最合适的 5 位匹配对象
          </motion.p>
        </div>

        {/* Progress Bar */}
        <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: currentStep >= index ? 1 : 0.5,
                x: currentStep >= index ? 0 : -20,
              }}
              className={cn(
                "flex items-center space-x-4 p-4 rounded-xl transition-all duration-300",
                currentStep >= index 
                  ? "bg-white/10 border border-white/20" 
                  : "bg-white/5"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center text-2xl",
                currentStep > index ? "bg-green-500/20 text-green-400" :
                currentStep === index ? "bg-blue-500/20 text-blue-400" :
                "bg-white/10 text-white/50"
              )}>
                {step.icon}
              </div>
              <div className="flex-1">
                <h3 className={cn(
                  "text-sm font-medium",
                  currentStep >= index ? "text-white" : "text-white/50"
                )}>
                  {step.title}
                </h3>
                <p className={cn(
                  "text-xs",
                  currentStep >= index ? "text-blue-200" : "text-white/30"
                )}>
                  {step.description}
                </p>
              </div>
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium",
                currentStep > index ? "bg-green-500 text-white" :
                currentStep === index ? "bg-blue-500 text-white" :
                "bg-white/10 text-white/50"
              )}>
                {currentStep > index ? "✓" : index + 1}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Percentage */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <span className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {progress}%
          </span>
        </motion.div>
      </div>
    </div>
  );
} 
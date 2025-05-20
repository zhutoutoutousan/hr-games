import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { GameStateProps } from '../types';

export function IdleState({ onStartGame, isLoading }: GameStateProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white overflow-hidden relative">
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-100 rounded-full filter blur-3xl opacity-30 animate-pulse delay-300"></div>
          <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-pink-100 rounded-full filter blur-3xl opacity-30 animate-pulse delay-700"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-7xl font-bold mb-8">
              <motion.span
                className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                候选人用 AI 写简历，
              </motion.span>
              <motion.span
                className="block bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                你能看得出吗？
              </motion.span>
            </h1>

            <motion.p
              className="text-2xl md:text-3xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              参与趣味小测验，猜猜哪些简历是
              <span className="text-blue-600 font-medium">"真人写的"</span>，
              哪些是
              <span className="text-purple-600 font-medium">AI 的产物</span>。
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full filter blur-xl opacity-50 animate-pulse"></div>
              <Button
                size="lg"
                onClick={onStartGame}
                className="relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xl px-16 py-8 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    加载中...
                  </span>
                ) : (
                  '挑战开始！'
                )}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import { PlayingStateProps } from '../types';
import { ComponentPropsWithoutRef, ElementType, useEffect, useRef, useState } from 'react';
import { ChevronUp } from 'lucide-react';

type MarkdownComponentProps<T extends ElementType> = {
  node?: any;
} & ComponentPropsWithoutRef<T>;

const markdownComponents = {
  h1: ({ node, ...props }: MarkdownComponentProps<'h1'>) => (
    <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-[rgb(0,101,240)] to-blue-400 bg-clip-text text-transparent" {...props} />
  ),
  h2: ({ node, ...props }: MarkdownComponentProps<'h2'>) => (
    <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-[rgb(0,101,240)] to-blue-400 bg-clip-text text-transparent" {...props} />
  ),
  h3: ({ node, ...props }: MarkdownComponentProps<'h3'>) => (
    <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-[rgb(0,101,240)] to-blue-400 bg-clip-text text-transparent" {...props} />
  ),
  p: ({ node, ...props }: MarkdownComponentProps<'p'>) => (
    <p className="text-gray-700 mb-4 leading-relaxed" {...props} />
  ),
  ul: ({ node, ...props }: MarkdownComponentProps<'ul'>) => (
    <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />
  ),
  ol: ({ node, ...props }: MarkdownComponentProps<'ol'>) => (
    <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />
  ),
  li: ({ node, ...props }: MarkdownComponentProps<'li'>) => (
    <li className="text-gray-700" {...props} />
  ),
  strong: ({ node, ...props }: MarkdownComponentProps<'strong'>) => (
    <strong className="font-bold text-[rgb(0,101,240)]" {...props} />
  ),
  em: ({ node, ...props }: MarkdownComponentProps<'em'>) => (
    <em className="italic text-[rgb(0,101,240)]" {...props} />
  ),
  a: ({ node, ...props }: MarkdownComponentProps<'a'>) => (
    <a className="text-[rgb(0,101,240)] hover:underline" {...props} />
  ),
  blockquote: ({ node, ...props }: MarkdownComponentProps<'blockquote'>) => (
    <blockquote className="border-l-4 border-[rgb(0,101,240)] pl-4 italic bg-blue-50 py-2 rounded-r-lg" {...props} />
  ),
  code: ({ node, ...props }: MarkdownComponentProps<'code'>) => (
    <code className="bg-blue-50 text-[rgb(0,101,240)] rounded px-1 font-mono" {...props} />
  ),
  pre: ({ node, ...props }: MarkdownComponentProps<'pre'>) => (
    <pre className="bg-blue-50 rounded p-4 overflow-x-auto font-mono" {...props} />
  ),
};

// Update the scrollbar class to hide default scrollbar
const scrollbarClass = `
  [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
  relative
`;

// Add a wrapper class for the scrollbar indicator
const scrollbarWrapperClass = `
  sticky top-0 left-0 right-0 h-1 bg-transparent
  z-10
`;

const scrollbarIndicatorClass = `
  h-1 pointer-events-none
  bg-[rgb(0,101,240)]
  transition-all duration-100 -translate-x-[23px] -translate-y-[32px]
`;

export function PlayingState({
  currentPosition,
  currentResume,
  currentResumeIndex,
  isAIAnswer,
  agreeScoreAnswer,
  setIsAIAnswer,
  setAgreeScoreAnswer,
  handleConfirm,
  showFeedback,
  isCorrect,
  isMobile
}: PlayingStateProps) {
  const jobDescRef = useRef<HTMLDivElement>(null);
  const resumeRef = useRef<HTMLDivElement>(null);
  const [showJobIndicator, setShowJobIndicator] = useState(false);
  const [showResumeIndicator, setShowResumeIndicator] = useState(false);
  const [jobIndicatorStyle, setJobIndicatorStyle] = useState({});
  const [resumeIndicatorStyle, setResumeIndicatorStyle] = useState({});
  const [isJudgmentPanelOpen, setIsJudgmentPanelOpen] = useState(false);

  const calculateScrollProgress = (element: HTMLDivElement | null) => {
    if (!element) return 0;
    const { scrollTop, scrollHeight, clientHeight } = element;
    return (scrollTop / (scrollHeight - clientHeight)) * 100;
  };

  const updateIndicatorPosition = () => {
    if (jobDescRef.current) {
      const progress = calculateScrollProgress(jobDescRef.current);
      setJobIndicatorStyle({
        width: `${progress}%`
      });
    }
    if (resumeRef.current) {
      const progress = calculateScrollProgress(resumeRef.current);
      setResumeIndicatorStyle({
        width: `${progress}%`
      });
    }
  };

  const checkScroll = (element: HTMLDivElement | null, setShowIndicator: (show: boolean) => void) => {
    if (!element) return;
    const { scrollTop, scrollHeight, clientHeight } = element;
    const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 1;
    setShowIndicator(!isAtBottom);
  };

  useEffect(() => {
    const jobDescElement = jobDescRef.current;
    const resumeElement = resumeRef.current;

    const handleScroll = () => {
      checkScroll(jobDescElement, setShowJobIndicator);
      checkScroll(resumeElement, setShowResumeIndicator);
      updateIndicatorPosition();
    };

    const handleResize = () => {
      updateIndicatorPosition();
    };

    jobDescElement?.addEventListener('scroll', handleScroll);
    resumeElement?.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    // Initial setup
    handleScroll();
    updateIndicatorPosition();

    return () => {
      jobDescElement?.removeEventListener('scroll', handleScroll);
      resumeElement?.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white overflow-hidden relative">
        <div className="absolute inset-0">
          {/* Background effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-[rgb(0,101,240)] to-blue-400 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-400 to-[rgb(0,101,240)] rounded-full filter blur-3xl opacity-20 animate-pulse delay-300"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-white/50"></div>
          </div>

          {/* Content */}
          <div className="relative h-full flex flex-col p-4 space-y-4">
            {/* AI Score Display */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="absolute top-4 right-4 z-20">
                <div className="absolute inset-0 bg-gradient-to-r from-[rgb(0,101,240)] to-blue-400 rounded-full blur-lg opacity-50 animate-pulse"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-xl">
                  <span className="text-base font-medium text-gray-600">AI 匹配分数</span>
                  <div className="text-4xl font-bold bg-gradient-to-r from-[rgb(0,101,240)] to-blue-400 bg-clip-text text-transparent animate-gradient">
                    {currentResume.aiScore}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Job Description Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 flex-1 overflow-y-auto ${scrollbarClass}`}
              ref={jobDescRef}
            >
              <div className={scrollbarWrapperClass}>
                {showJobIndicator && <div className={scrollbarIndicatorClass} style={jobIndicatorStyle} />}
              </div>
              <div className="prose max-w-none pb-4">
                <ReactMarkdown components={markdownComponents}>
                  {currentPosition?.description || ''}
                </ReactMarkdown>
              </div>
            </motion.div>

            {/* Resume Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 flex-1 overflow-y-auto ${scrollbarClass}`}
              ref={resumeRef}
            >
              <div className={scrollbarWrapperClass}>
                {showResumeIndicator && <div className={scrollbarIndicatorClass} style={resumeIndicatorStyle} />}
              </div>
              <div className="prose max-w-none pb-4">
                <ReactMarkdown components={markdownComponents}>
                  {currentResume?.content || ''}
                </ReactMarkdown>
              </div>
            </motion.div>

            {/* Floating Judgment Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onClick={() => setIsJudgmentPanelOpen(true)}
              className="fixed bottom-4 right-4 bg-[rgb(0,101,240)] text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 z-50"
            >
              <ChevronUp className="w-6 h-6" />
            </motion.button>

            {/* Judgment Panel Slide-out */}
            <AnimatePresence>
              {isJudgmentPanelOpen && (
                <>
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsJudgmentPanelOpen(false)}
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                  />
                  
                  {/* Panel */}
                  <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm rounded-t-2xl shadow-xl p-6 z-50"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-[rgb(0,101,240)]">你的判断</h2>
                      <button
                        onClick={() => setIsJudgmentPanelOpen(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <ChevronUp className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <p className="text-base font-medium mb-3">这份简历是 AI 写的吗？</p>
                        <div className="flex gap-3">
                          <Button
                            variant={isAIAnswer === true ? 'default' : 'outline'}
                            onClick={() => setIsAIAnswer(true)}
                            className="flex-1"
                          >
                            是
                          </Button>
                          <Button
                            variant={isAIAnswer === false ? 'default' : 'outline'}
                            onClick={() => setIsAIAnswer(false)}
                            className="flex-1"
                          >
                            否
                          </Button>
                        </div>
                      </div>

                      <div>
                        <p className="text-base font-medium mb-3">你同意 AI 的匹配分数吗？</p>
                        <div className="flex gap-3">
                          <Button
                            variant={agreeScoreAnswer === true ? 'default' : 'outline'}
                            onClick={() => setAgreeScoreAnswer(true)}
                            className="flex-1"
                          >
                            同意
                          </Button>
                          <Button
                            variant={agreeScoreAnswer === false ? 'default' : 'outline'}
                            onClick={() => setAgreeScoreAnswer(false)}
                            className="flex-1"
                          >
                            不同意
                          </Button>
                        </div>
                      </div>

                      <Button
                        onClick={() => {
                          handleConfirm();
                          setIsJudgmentPanelOpen(false);
                        }}
                        disabled={isAIAnswer === null || agreeScoreAnswer === null}
                        className="w-full"
                      >
                        确认
                      </Button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="h-[calc(100vh-4rem)] bg-gradient-to-b from-blue-50 to-white overflow-hidden relative">
      <div className="absolute inset-0">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-[rgb(0,101,240)] to-blue-400 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-400 to-[rgb(0,101,240)] rounded-full filter blur-3xl opacity-20 animate-pulse delay-300"></div>
          <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-gradient-to-r from-[rgb(0,101,240)] to-blue-300 rounded-full filter blur-3xl opacity-20 animate-pulse delay-700"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-white/50"></div>
        </div>

        {/* Content */}
        <div className="relative h-full flex items-center justify-center p-8">
          {/* AI Score Display */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 right-4 -translate-x-1/2 z-20"
          >
            <div className="inline-block relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[rgb(0,101,240)] to-blue-400 rounded-full blur-lg opacity-50 animate-pulse"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-full px-8 py-4 shadow-xl">
                <span className="text-lg font-medium text-gray-600">AI 匹配分数</span>
                <div className="text-5xl font-bold bg-gradient-to-r from-[rgb(0,101,240)] to-blue-400 bg-clip-text text-transparent animate-gradient">
                  {currentResume.aiScore}
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-12 w-full max-w-8xl h-[80vh] p-5">
            {/* Job Description Panel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 overflow-y-auto hover:shadow-2xl transition-shadow duration-300 ${scrollbarClass}`}
              ref={jobDescRef}
            >
              <div className={scrollbarWrapperClass}>
                {showJobIndicator && <div className={scrollbarIndicatorClass} style={jobIndicatorStyle} />}
              </div>
              <div className="prose max-w-none pb-4">
                <ReactMarkdown components={markdownComponents}>
                  {currentPosition?.description || ''}
                </ReactMarkdown>
              </div>
            </motion.div>

            {/* Resume Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 overflow-y-auto hover:shadow-2xl transition-shadow duration-300 ${scrollbarClass}`}
              ref={resumeRef}
            >
              <div className={scrollbarWrapperClass}>
                {showResumeIndicator && <div className={scrollbarIndicatorClass} style={resumeIndicatorStyle} />}
              </div>
              <div className="prose max-w-none pb-4">
                <ReactMarkdown components={markdownComponents}>
                  {currentResume?.content || ''}
                </ReactMarkdown>
              </div>
            </motion.div>
          </div>

          {/* Floating Judgment Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="absolute bottom-8 right-5 -translate-x-1/2 w-full max-w-3xl bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-[rgb(0,101,240)]">你的判断</h2>
              <div className="flex gap-4">
                <p className="text-lg font-medium mr-4">这份简历是 AI 写的吗？</p>
                <Button
                  variant={isAIAnswer === true ? 'default' : 'outline'}
                  onClick={() => setIsAIAnswer(true)}
                  className="px-8 hover:scale-105 transition-transform"
                >
                  是
                </Button>
                <Button
                  variant={isAIAnswer === false ? 'default' : 'outline'}
                  onClick={() => setIsAIAnswer(false)}
                  className="px-8 hover:scale-105 transition-transform"
                >
                  否
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-lg font-medium">你同意 AI 的匹配分数吗？</p>
              <div className="flex gap-4">
                <Button
                  variant={agreeScoreAnswer === true ? 'default' : 'outline'}
                  onClick={() => setAgreeScoreAnswer(true)}
                  className="px-8 hover:scale-105 transition-transform"
                >
                  同意
                </Button>
                <Button
                  variant={agreeScoreAnswer === false ? 'default' : 'outline'}
                  onClick={() => setAgreeScoreAnswer(false)}
                  className="px-8 hover:scale-105 transition-transform"
                >
                  不同意
                </Button>
              </div>
            </div>

            <Button
              onClick={handleConfirm}
              disabled={isAIAnswer === null || agreeScoreAnswer === null}
              className="w-full mt-8 hover:scale-105 transition-transform"
            >
              确认
            </Button>
          </motion.div>

          {/* Enhanced Feedback */}
          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className={`absolute bottom-32 left-1/2 -translate-x-1/2 p-4 rounded-lg backdrop-blur-sm ${
                  isCorrect 
                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800' 
                    : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800'
                }`}
              >
                <p className="text-center font-medium text-lg">
                  {isCorrect ? '✨ 回答正确！' : '❌ 回答错误！'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
} 
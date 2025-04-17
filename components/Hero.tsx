'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';

export function Hero() {
  return (
    <div className="relative min-h-[85vh] flex items-center overflow-hidden bg-[#0065f0]">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl -top-48 -left-24 animate-pulse" />
        <div className="absolute w-[400px] h-[400px] bg-white/10 rounded-full blur-2xl top-96 right-12 animate-pulse delay-700" />
        <div className="absolute w-[200px] h-[200px] bg-blue-400/10 rounded-full blur-xl bottom-24 left-1/2 animate-pulse delay-500" />
      </div>

      <div className="container mx-auto px-4 z-10">
        <div className="max-w-4xl">
          <motion.div 
            className="inline-block bg-white/10 backdrop-blur-lg rounded-full px-6 py-2 mb-8 border border-white/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-white/90">Transforming HR through Innovation</span>
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            The AI-Powered Platform for Strategic HR Games
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Best-in-class solutions for recruiting and talent management through gamification.
            Transform your HR processes with engaging experiences.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap gap-4"
          >
            <Button size="lg" className="bg-white text-[#0065f0] hover:bg-white/90 text-lg px-8 py-6 h-auto font-semibold">
              Get Started
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10 text-lg px-8 py-6 h-auto font-semibold">
              Learn More
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10" />
    </div>
  );
} 
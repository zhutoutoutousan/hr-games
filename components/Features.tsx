'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Gamepad2, Brain, Trophy, Users } from 'lucide-react';

const features = [
  {
    title: 'Gamified Recruiting',
    description: 'Transform your hiring process with interactive challenges and assessments.',
    icon: Gamepad2,
  },
  {
    title: 'AI-Powered Matching',
    description: 'Match candidates to roles using advanced AI algorithms and game performance.',
    icon: Brain,
  },
  {
    title: 'Performance Analytics',
    description: 'Track and analyze candidate performance through gaming metrics.',
    icon: Trophy,
  },
  {
    title: 'Talent Community',
    description: 'Build an engaged community of candidates through competitive gaming.',
    icon: Users,
  },
];

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
    >
      <div className="h-14 w-14 bg-[#0065f0]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#0065f0] group-hover:text-white transition-colors duration-300">
        <feature.icon className="h-7 w-7 text-[#0065f0] group-hover:text-white transition-colors duration-300" />
      </div>
      <h3 className="text-2xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
      <p className="text-gray-600 leading-relaxed">{feature.description}</p>
    </motion.div>
  );
}

export function Features() {
  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] bg-[#0065f0]/5 rounded-full blur-3xl -top-48 -right-24" />
        <div className="absolute w-[300px] h-[300px] bg-[#0065f0]/5 rounded-full blur-2xl bottom-48 -left-24" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#0065f0] to-blue-600">
            Transform Your HR with Gaming
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our platform combines the power of AI with gamification to create engaging recruitment experiences.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
} 
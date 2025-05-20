'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MatchingAnimation } from '@/components/matching-animation';

export default function MatchingPage() {
  const router = useRouter();
  const [isMatching, setIsMatching] = useState(true);

  const handleMatchingComplete = () => {
    setIsMatching(false);
    router.push('/matches');
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {isMatching && <MatchingAnimation onComplete={handleMatchingComplete} />}
    </main>
  );
} 
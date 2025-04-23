'use client';

import { TrueFalseCVProvider } from '@/contexts/true-false-cv-context';
import { AdminProvider } from '@/contexts/admin-context';
import { TrueFalseCVGame } from '@/components/true-false-cv-game';
import { GameNav } from '@/components/GameNav';

export default function TrueFalseCVPage() {
  return (
    <AdminProvider>
      <TrueFalseCVProvider>
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
          <TrueFalseCVGame />
          <GameNav />
        </div>
      </TrueFalseCVProvider>
    </AdminProvider>
  );
}
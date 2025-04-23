'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function GameNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <Link href="/games">
          <Button variant="ghost">返回游戏列表</Button>
        </Link>
        <div className="text-sm text-gray-500">
          真假CV - AI简历识别挑战
        </div>
      </div>
    </nav>
  );
} 
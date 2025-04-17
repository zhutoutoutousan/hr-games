'use client';

import { useState } from 'react';
import { FileText, Users, MessageSquare, Home, Menu } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from './ui/button';

export function GameNav() {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const games = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/games/cv', icon: FileText, label: 'CV Game' },
    { path: '/games/matching', icon: Users, label: 'Matching' },
    { path: '/games/story', icon: MessageSquare, label: 'Story' },
  ];

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <div className={`flex items-center gap-4 bg-white rounded-full shadow-lg p-4 transition-all duration-300 ${
        isExpanded ? 'pr-8' : ''
      }`}>
        {isExpanded && (
          <div className="flex items-center gap-4 pr-4">
            {games.map((game) => (
              <Button
                key={game.path}
                variant={pathname === game.path ? "default" : "ghost"}
                className={`flex items-center gap-2 text-lg ${
                  pathname === game.path 
                    ? 'bg-[#0065f0] text-white hover:bg-[#0065f0]/90'
                    : 'text-gray-600 hover:text-[#0065f0]'
                }`}
                onClick={() => {
                  router.push(game.path);
                  setIsExpanded(false);
                }}
              >
                <game.icon className="h-6 w-6" />
                <span>{game.label}</span>
              </Button>
            ))}
          </div>
        )}
        
        <Button
          size="lg"
          className="w-16 h-16 rounded-full bg-[#0065f0] hover:bg-[#0065f0]/90 shadow-lg"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Menu className="h-8 w-8 text-white" />
        </Button>
      </div>
    </div>
  );
} 
'use client';

import { useState } from 'react';
import { FileText, Users, MessageSquare, Home, Menu } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export function GameNav() {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const isAdmin = typeof window !== 'undefined' ? localStorage.getItem('isAdmin') === 'true' : false;

  const games = [
    { path: '/', icon: Home, label: '首页' },
    { path: '/games/true-false-cv', icon: FileText, label: '真假简历' },
    { path: '/games/matching', icon: Users, label: '匹配游戏' }
  ];

  const handleAdminLogin = () => {
    if (adminPassword === '123456') {
      localStorage.setItem('isAdmin', 'true');
      setIsAdminDialogOpen(false);
      setAdminPassword('');
      router.push('/games/true-false-cv/admin');
    } else {
      alert('密码错误');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    router.push('/games/true-false-cv');
  };

  if (pathname === '/') return null;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white border-b z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Button
                variant="ghost"
                className="inline-flex items-center px-3 mt-3"
                onClick={() => router.push('/')}
              >
                <Home className="h-5 w-5" />
                <span className="ml-2">返回首页</span>
              </Button>
            </div>
            <div className="flex items-center">
              {isAdmin ? (
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/games/true-false-cv/admin')}
                  >
                    管理面板
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                  >
                    退出管理
                  </Button>
                </div>
              ) : (
                <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">管理员登录</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>管理员登录</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Input
                        type="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="输入密码"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAdminLogin();
                          }
                        }}
                      />
                      <Button onClick={handleAdminLogin}>
                        登录
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>
      </nav>
      <div className="h-16" /> {/* Spacer for fixed navbar */}
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
    </>
  );
} 
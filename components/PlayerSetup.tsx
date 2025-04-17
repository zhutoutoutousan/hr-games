'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

interface PlayerSetupProps {
  onComplete: (playerInfo: { name: string; avatar: string }) => void;
}

const avatars = {
  male: [
    '/avatars/male1.png',
    '/avatars/male2.png',
  ],
  female: [
    '/avatars/female1.png',
    '/avatars/female2.png',
  ]
};

export function PlayerSetup({ onComplete }: PlayerSetupProps) {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');

  const handleSubmit = () => {
    if (name.trim() && selectedAvatar) {
      onComplete({ name: name.trim(), avatar: selectedAvatar });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-[#0065f0]">选择你的角色</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <label className="text-lg font-medium block">你的名字</label>
          <Input
            placeholder="请输入你的名字"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-lg h-12"
          />
        </div>

        <div className="space-y-4">
          <label className="text-lg font-medium block">选择性别</label>
          <div className="flex gap-4">
            <Button
              variant={gender === 'male' ? 'default' : 'outline'}
              className={`flex-1 text-lg h-12 ${
                gender === 'male' ? 'bg-[#0065f0]' : ''
              }`}
              onClick={() => {
                setGender('male');
                setSelectedAvatar('');
              }}
            >
              男生
            </Button>
            <Button
              variant={gender === 'female' ? 'default' : 'outline'}
              className={`flex-1 text-lg h-12 ${
                gender === 'female' ? 'bg-[#0065f0]' : ''
              }`}
              onClick={() => {
                setGender('female');
                setSelectedAvatar('');
              }}
            >
              女生
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-lg font-medium block">选择头像</label>
          <div className="grid grid-cols-2 gap-6">
            {avatars[gender].map((avatar) => (
              <button
                key={avatar}
                onClick={() => setSelectedAvatar(avatar)}
                className={`relative aspect-square rounded-2xl overflow-hidden border-4 transition-all ${
                  selectedAvatar === avatar
                    ? 'border-[#0065f0] shadow-lg scale-105'
                    : 'border-transparent hover:border-[#0065f0]/50'
                }`}
              >
                <Image
                  src={avatar}
                  alt="Avatar"
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <Button
          className="w-full text-lg h-12 bg-[#0065f0] hover:bg-[#0065f0]/90"
          disabled={!name.trim() || !selectedAvatar}
          onClick={handleSubmit}
        >
          开始游戏
        </Button>
      </CardContent>
    </Card>
  );
} 
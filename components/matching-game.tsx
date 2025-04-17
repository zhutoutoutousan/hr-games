'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ClockIcon, ArrowLeftRight } from 'lucide-react';

const generateAttendees = (round: number) => {
  const interests = [
    'AI & Machine Learning', 'Blockchain', 'Cloud Computing', 
    'DevOps', 'Data Science', 'Cybersecurity', 'IoT',
    'Mobile Development', 'Web Development', 'UX/UI Design'
  ];

  const goals = [
    'Networking', 'Learning', 'Partnership', 'Hiring',
    'Investment', 'Mentorship', 'Collaboration'
  ];

  const attendee1 = {
    name: `Attendee ${round * 2 + 1}`,
    role: 'Tech Lead',
    company: 'Innovation Labs',
    interests: [
      interests[Math.floor(Math.random() * interests.length)],
      interests[Math.floor(Math.random() * interests.length)]
    ],
    goals: [
      goals[Math.floor(Math.random() * goals.length)],
      goals[Math.floor(Math.random() * goals.length)]
    ]
  };

  const attendee2 = {
    name: `Attendee ${round * 2 + 2}`,
    role: 'Product Manager',
    company: 'Future Tech',
    interests: [
      interests[Math.floor(Math.random() * interests.length)],
      interests[Math.floor(Math.random() * interests.length)]
    ],
    goals: [
      goals[Math.floor(Math.random() * goals.length)],
      goals[Math.floor(Math.random() * goals.length)]
    ]
  };

  // Calculate match score based on common interests and goals
  const commonInterests = attendee1.interests.filter(i => attendee2.interests.includes(i));
  const commonGoals = attendee1.goals.filter(g => attendee2.goals.includes(g));
  const isGoodMatch = commonInterests.length > 0 && commonGoals.length > 0;

  return {
    attendee1,
    attendee2,
    isGoodMatch
  };
};

interface MatchingGameProps {
  round: number;
  totalRounds: number;
  onAnswer: (isCorrect: boolean) => void;
  onBack: () => void;
}

export default function MatchingGame({ round, totalRounds, onAnswer, onBack }: MatchingGameProps) {
  const [timer, setTimer] = useState(0);
  const [attendees, setAttendees] = useState<any>(null);

  useEffect(() => {
    setAttendees(generateAttendees(round));
    setTimer(0);
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [round]);

  if (!attendees) return <div>Loading...</div>;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChoice = (choice: boolean) => {
    onAnswer(choice === attendees.isGoodMatch);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl w-full mx-auto flex flex-col flex-grow">
        <div className="flex justify-between items-center mb-4">
          <Button variant="ghost" onClick={onBack} className="text-gray-600">
            ← Back to Games
          </Button>
          <div className="flex items-center gap-4">
            <div className="text-lg font-medium">
              Round {round + 1}/{totalRounds}
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5" />
              <span>{formatTime(timer)}</span>
            </div>
          </div>
        </div>

        <Progress value={(round / totalRounds) * 100} className="mb-6" />

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Would these attendees be a good match?</h2>
          <p className="text-gray-600">Analyze their interests and goals to decide</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {[attendees.attendee1, attendees.attendee2].map((attendee, index) => (
            <Card key={index} className="bg-white">
              <CardHeader>
                <CardTitle>{attendee.name}</CardTitle>
                <div className="text-sm text-gray-500">
                  {attendee.role} at {attendee.company}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {attendee.interests.map((interest: string, i: number) => (
                      <span key={i} className="bg-blue-50 text-[#0065f0] px-3 py-1 rounded-full text-sm">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Goals</h3>
                  <div className="flex flex-wrap gap-2">
                    {attendee.goals.map((goal: string, i: number) => (
                      <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                        {goal}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <Button 
            size="lg"
            variant="outline"
            className="w-40 text-lg"
            onClick={() => handleChoice(false)}
          >
            Not a Match
          </Button>
          <Button 
            size="lg"
            className="w-40 text-lg bg-[#0065f0] hover:bg-[#0065f0]/90"
            onClick={() => handleChoice(true)}
          >
            Good Match
          </Button>
        </div>
      </div>
    </div>
  );
} 
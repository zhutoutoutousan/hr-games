'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ClockIcon } from 'lucide-react';

const storyPrompts = [
  {
    scenario: "A mysterious package arrives at the office...",
    options: [
      "It contains a time-traveling device",
      "Inside is an AI that predicts the future",
      "It's filled with ancient artifacts"
    ]
  },
  {
    scenario: "During a virtual meeting, everyone's background suddenly changes to...",
    options: [
      "A tropical paradise",
      "An alien spacecraft",
      "A medieval castle"
    ]
  },
  {
    scenario: "The office coffee machine starts making strange noises and...",
    options: [
      "Brews liquid gold",
      "Creates portals to other dimensions",
      "Speaks in different languages"
    ]
  },
  {
    scenario: "All the computers in the building simultaneously display...",
    options: [
      "A countdown to an unknown event",
      "Messages from the future",
      "Ancient hieroglyphics"
    ]
  },
  {
    scenario: "The new intern reveals they are actually...",
    options: [
      "A time-traveling historian",
      "An AI in human form",
      "A superhero in disguise"
    ]
  }
];

interface StoryGameProps {
  round: number;
  totalRounds: number;
  onAnswer: (isCorrect: boolean) => void;
  onBack: () => void;
}

export default function StoryGame({ round, totalRounds, onAnswer, onBack }: StoryGameProps) {
  const [timer, setTimer] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [story, setStory] = useState(storyPrompts[round % storyPrompts.length]);

  useEffect(() => {
    setTimer(0);
    setSelectedOption(null);
    setStory(storyPrompts[round % storyPrompts.length]);
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [round]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChoice = (optionIndex: number) => {
    setSelectedOption(optionIndex);
    // In this game, any creative choice is "correct"
    onAnswer(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl w-full mx-auto flex flex-col flex-grow">
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

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Continue the Story</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl mb-6">{story.scenario}</p>
            <div className="space-y-4">
              {story.options.map((option, index) => (
                <Button
                  key={index}
                  className={`w-full text-left justify-start text-lg p-6 h-auto ${
                    selectedOption === index 
                      ? 'bg-[#0065f0] text-white hover:bg-[#0065f0]/90'
                      : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-[#0065f0] hover:text-[#0065f0]'
                  }`}
                  disabled={selectedOption !== null}
                  onClick={() => handleChoice(index)}
                >
                  {option}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedOption !== null && (
          <div className="text-center text-lg text-gray-600">
            Great choice! Let's see where the story goes next...
          </div>
        )}
      </div>
    </div>
  );
} 
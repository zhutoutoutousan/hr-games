'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExtendedPerson, Node, Link, GameState } from '../types';
import { useGame } from '@/contexts/GameContext';
import { usePlayer } from '@/contexts/PlayerContext';
import { useLeaderboard } from '@/contexts/LeaderboardContext';
import { calculateSimilarity } from '@/utils/similarity';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import * as d3 from 'd3';
import { forceSimulation, forceLink, forceManyBody, forceCenter } from 'd3-force';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface MatchingGameProps {
  onComplete: (score: number) => void;
}

interface PersonData {
  id: number;
  name: string;
  gender: string;
  industry: string;
  position: string;
  hobbies: string;
  favoriteFood: string;
  leastFavoriteFood: string;
  hrConcern: string;
  weekendActivity: string;
  socialPreference: string;
  avatarRequest: string | null;
}

export default function MatchingGame({ onComplete }: MatchingGameProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { score, setScore } = useGame();
  const { player } = usePlayer();
  const { addScore } = useLeaderboard();
  
  const [people, setPeople] = useState<ExtendedPerson[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<ExtendedPerson | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const simulationRef = useRef<d3.Simulation<Node, Link> | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLink, setSelectedLink] = useState<Link | null>(null);
  const [showPersonModal, setShowPersonModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchExplanation, setMatchExplanation] = useState('');
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    matchedPairs: new Set(),
    selectedPerson: null
  });

  const handlePersonClick = (person: ExtendedPerson) => {
    setSelectedPerson(person);
    setShowPersonModal(true);
  };

  const handleLinkClick = (link: Link) => {
    setSelectedLink(link);
    const similarity = calculateSimilarity(link.source.person, link.target.person);
    const explanation = generateMatchExplanation(link.source.person, link.target.person, similarity);
    setMatchExplanation(explanation);
    setShowMatchModal(true);
  };

  const generateMatchExplanation = (person1: ExtendedPerson, person2: ExtendedPerson, similarity: number): string => {
    const commonSkills = person1.skills.filter(skill => person2.skills.includes(skill));
    const skillExplanation = commonSkills.length > 0 
      ? `Both have skills in ${commonSkills.join(', ')}.`
      : 'They have different skill sets.';

    const expDiff = Math.abs(person1.experience - person2.experience);
    const expExplanation = expDiff <= 2 
      ? 'They have similar levels of experience.'
      : 'They have different levels of experience.';

    const locationExplanation = person1.location === person2.location
      ? `They both prefer ${person1.location} for social interactions.`
      : 'They have different social preferences.';

    return `${skillExplanation} ${expExplanation} ${locationExplanation} Overall similarity: ${Math.floor(similarity * 100)}%`;
  };

  const calculateMatchScore = (person1: ExtendedPerson, person2: ExtendedPerson): number => {
    let score = 0;
    
    // Compare industry
    if (person1.rawData.industry === person2.rawData.industry) {
      score += 2;
    }
    
    // Compare position
    if (person1.rawData.position === person2.rawData.position) {
      score += 2;
    }
    
    // Compare hobbies
    if (person1.rawData.hobbies === person2.rawData.hobbies) {
      score += 2;
    }
    
    // Compare food preferences
    if (person1.rawData.favoriteFood === person2.rawData.favoriteFood) {
      score += 2;
    }
    
    // Compare HR concerns
    if (person1.rawData.hrConcern === person2.rawData.hrConcern) {
      score += 2;
    }
    
    // Compare weekend activities
    if (person1.rawData.weekendActivity === person2.rawData.weekendActivity) {
      score += 2;
    }
    
    // Compare social preferences
    if (person1.rawData.socialPreference === person2.rawData.socialPreference) {
      score += 2;
    }
    
    return score;
  };

  useEffect(() => {
    const people: ExtendedPerson[] = [];
    let totalPeople = 0;

    const eventSource = new EventSource('/api/people');
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'count') {
        totalPeople = data.total;
        console.log(`Expecting ${totalPeople} people`);
      } else if (data.type === 'person') {
        const personData: PersonData = data.data;
        const person: ExtendedPerson = {
          id: personData.id.toString(),
          name: personData.name,
          title: personData.position,
          skills: [
            personData.industry,
            personData.hobbies,
            personData.hrConcern
          ].filter(Boolean),
          experience: Math.floor(Math.random() * 10) + 1,
          location: personData.socialPreference || 'Unknown',
          rawData: personData
        };
        people.push(person);
        console.log(`Added person: ${person.name}`);
      } else if (data.type === 'complete') {
        console.log('All people data received');
        eventSource.close();
        
        // Create nodes
        const newNodes: Node[] = people.map(person => ({
          person,
          x: Math.random() * 800,
          y: Math.random() * 600,
        }));
        console.log('Created nodes:', newNodes);

        // Create links based on similarity
        const newLinks: Link[] = [];
        for (let i = 0; i < newNodes.length; i++) {
          for (let j = i + 1; j < newNodes.length; j++) {
            const similarity = calculateSimilarity(newNodes[i].person, newNodes[j].person);
            if (similarity > 0.3) { // Only create links for significant similarities
              newLinks.push({
                source: newNodes[i],
                target: newNodes[j],
                value: similarity,
              });
            }
          }
        }
        console.log('Created links:', newLinks);

        setNodes(newNodes);
        setLinks(newLinks);

        // Create force simulation
        const simulation = forceSimulation<Node, Link>(newNodes)
          .force('link', forceLink<Node, Link>(newLinks)
            .id(d => d.person.id)
            .distance(d => 200 - (d.value * 150))
            .strength(d => d.value))
          .force('charge', forceManyBody().strength(-100))
          .force('center', forceCenter(400, 300));

        // Add tick handler to update positions
        simulation.on('tick', () => {
          setNodes([...newNodes]);
        });

        simulationRef.current = simulation;
        setLoading(false);
      } else if (data.type === 'error') {
        console.error('Error fetching people:', data.message);
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
        eventSource.close();
        setLoading(false);
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
      toast({
        title: "Error",
        description: "Failed to connect to the server",
        variant: "destructive",
      });
      eventSource.close();
      setLoading(false);
    };

    return () => {
      eventSource.close();
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[100vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading people data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[1200px] bg-white rounded-lg shadow-lg overflow-hidden">
      <svg width="100%" height="100%">
        <g transform="translate(400, 300)">
          {links.map((link, i) => (
            <line
              key={i}
              x1={link.source.x ?? 0}
              y1={link.source.y ?? 0}
              x2={link.target.x ?? 0}
              y2={link.target.y ?? 0}
              stroke="rgba(0,0,0,0.2)"
              strokeWidth={link.value * 2}
              onClick={() => handleLinkClick(link)}
              className="cursor-pointer hover:stroke-blue-500"
            />
          ))}
          {nodes.map((node, i) => (
            <g
              key={i}
              transform={`translate(${node.x ?? 0},${node.y ?? 0})`}
              onClick={() => handlePersonClick(node.person)}
              className="cursor-pointer"
            >
              <circle
                r={20}
                fill={matchedPairs.has(node.person.id) ? '#4CAF50' : '#2196F3'}
                stroke={selectedPerson?.id === node.person.id ? '#FFC107' : 'none'}
                strokeWidth={3}
              />
              <text
                x={0}
                y={30}
                textAnchor="middle"
                fontSize={12}
                fill="#333"
                className="select-none"
              >
                {node.person.rawData.name}
              </text>
              <text
                x={0}
                y={45}
                textAnchor="middle"
                fontSize={10}
                fill="#666"
                className="select-none"
              >
                {node.person.rawData.position}
              </text>
            </g>
          ))}
        </g>
      </svg>

      {/* Person Information Modal */}
      <Dialog open={showPersonModal} onOpenChange={setShowPersonModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedPerson?.rawData.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-700">Basic Information</h3>
                <div className="mt-2 space-y-2">
                  <p><span className="text-gray-600">Gender: </span>{selectedPerson?.rawData.gender}</p>
                  <p><span className="text-gray-600">Position: </span>{selectedPerson?.rawData.position}</p>
                  <p><span className="text-gray-600">Industry: </span>{selectedPerson?.rawData.industry}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Interests</h3>
                <div className="mt-2 space-y-2">
                  <p><span className="text-gray-600">Hobbies: </span>{selectedPerson?.rawData.hobbies}</p>
                  <p><span className="text-gray-600">Favorite Food: </span>{selectedPerson?.rawData.favoriteFood}</p>
                  <p><span className="text-gray-600">Least Favorite Food: </span>{selectedPerson?.rawData.leastFavoriteFood}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-700">HR Focus</h3>
                <div className="mt-2">
                  <p>{selectedPerson?.rawData.hrConcern}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Social Preferences</h3>
                <div className="mt-2 space-y-2">
                  <p><span className="text-gray-600">Weekend Activity: </span>{selectedPerson?.rawData.weekendActivity}</p>
                  <p><span className="text-gray-600">Social Preference: </span>{selectedPerson?.rawData.socialPreference}</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Match Information Modal */}
      <Dialog open={showMatchModal} onOpenChange={setShowMatchModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Match Analysis</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-center">
                <h3 className="font-semibold">{selectedLink?.source.person.rawData.name}</h3>
                <p className="text-sm text-gray-600">{selectedLink?.source.person.rawData.position}</p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold">{selectedLink?.target.person.rawData.name}</h3>
                <p className="text-sm text-gray-600">{selectedLink?.target.person.rawData.position}</p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">{matchExplanation}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
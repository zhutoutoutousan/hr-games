import { Person } from '@/types';

export const calculateSimilarity = (person1: Person, person2: Person): number => {
  // Calculate skill overlap
  const skillOverlap = person1.skills.filter(skill => 
    person2.skills.includes(skill)
  ).length;
  const maxSkills = Math.max(person1.skills.length, person2.skills.length);
  const skillSimilarity = maxSkills > 0 ? skillOverlap / maxSkills : 0;

  // Calculate experience similarity (normalized to 0-1)
  const expDiff = Math.abs(person1.experience - person2.experience);
  const maxExp = Math.max(person1.experience, person2.experience);
  const expSimilarity = maxExp > 0 ? 1 - (expDiff / maxExp) : 0;

  // Calculate location similarity (1 if same, 0 if different)
  const locationSimilarity = person1.location === person2.location ? 1 : 0;

  // Weighted average of similarities
  return (skillSimilarity * 0.5) + (expSimilarity * 0.3) + (locationSimilarity * 0.2);
}; 
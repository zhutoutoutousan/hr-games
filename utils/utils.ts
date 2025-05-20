import { Person } from '@/types/match';
 
export function getRandomPeople(people: Person[], count: number = 5): Person[] {
  const shuffled = [...people].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
} 
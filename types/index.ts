export interface Person {
  id: string;
  name: string;
  title: string;
  skills: string[];
  experience: number;
  location: string;
  avatar?: string;
}

export interface PersonData {
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

export interface ExtendedPerson extends Person {
  rawData: PersonData;
}

export interface Node {
  person: ExtendedPerson;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface Link {
  source: Node;
  target: Node;
  value: number;
}

export interface GameState {
  score: number;
  matchedPairs: Set<string>;
  selectedPerson: ExtendedPerson | null;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  date: string;
} 
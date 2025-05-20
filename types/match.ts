export interface Person {
  id: string;
  name: string;
  email: string;
  gender: string;
  industry: string;
  position: string;
  hobbies: string[];
  hrConcern: string;
  socialPreference: string;
  avatarRequest: string;
}

export interface Match {
  id: string;
  score: number;
  createdAt: string;
  updatedAt: string;
  participantId: string;
  matchedWithId: string;
  isActive: boolean;
  person: Person;
  reasoning: string;
  reasoning_steps: string[];
} 
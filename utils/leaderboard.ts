export interface LeaderboardEntry {
  name: string;
  avatar: string;
  score: number;
  time: number;
  date: string;
}

const STORAGE_KEY = 'fake-cv-leaderboard';

export function getLeaderboard(): LeaderboardEntry[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function addToLeaderboard(entry: LeaderboardEntry) {
  const leaderboard = getLeaderboard();
  leaderboard.push(entry);
  
  // Sort by score (descending) and time (ascending)
  leaderboard.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.time - b.time;
  });
  
  // Keep only top 10 entries
  const top10 = leaderboard.slice(0, 10);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(top10));
  
  return top10;
}

export function clearLeaderboard() {
  localStorage.removeItem(STORAGE_KEY);
} 
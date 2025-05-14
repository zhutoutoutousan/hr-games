import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Position = {
  id: number;
  title: string;
  description: string;
  created_at: string;
};

export type Resume = {
  id: number;
  position_id: number;
  content: string;
  is_ai: boolean;
  matching_score: number;
  created_at: string;
};

export async function getSurveyData() {
  const { data: surveyAnswers, error } = await supabase
    .from('SurveyAnswer')
    .select('rating')
    .order('createdAt', { ascending: false });

  if (error) {
    console.error('Error fetching survey data:', error);
    return [];
  }

  // Count ratings
  const ratingCounts = {
    1: 0, // 强烈反对
    2: 0, // 反对
    3: 0, // 中立
    4: 0, // 支持
    5: 0, // 强烈支持
  };

  surveyAnswers.forEach((answer) => {
    ratingCounts[answer.rating as keyof typeof ratingCounts]++;
  });

  return [
    { name: '强烈反对', value: ratingCounts[1] },
    { name: '反对', value: ratingCounts[2] },
    { name: '中立', value: ratingCounts[3] },
    { name: '支持', value: ratingCounts[4] },
    { name: '强烈支持', value: ratingCounts[5] },
  ];
}

export async function submitSurveyAnswer(rating: number, opinion: string, participantId: string) {
  const { data, error } = await supabase
    .from('SurveyAnswer')
    .insert([
      {
        id: participantId,
        rating,
        opinion,
        participantId
      },
    ])
    .select();

  if (error) {
    console.error('Error submitting survey:', error);
    throw error;
  }

  return data;
} 
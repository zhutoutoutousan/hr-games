import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function submitSurveyAnswer(data: {
  aiUsageOpinion: string;
  aiLeadership: string;
  aiImpactAreas: string;
  otherImpactArea?: string;
  isResumeAI: boolean;
  agreeWithScore: boolean;
  participantId: string;
}) {
  const { data: result, error } = await supabase
    .from('SurveyAnswer')
    .insert([data]);

  if (error) throw error;
  return result;
}

export async function getSurveyData() {
  const { data, error } = await supabase
    .from('SurveyAnswer')
    .select('*');

  if (error) throw error;
  return data;
} 
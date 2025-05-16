import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

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
    .select('aiUsageOpinion')
    .order('createdAt', { ascending: false });

  if (error) {
    console.error('Error fetching survey data:', error);
    return [];
  }

  // Count opinions
  const opinionCounts = {
    '可以接受，只要确保提供的信息真实可靠': 0,
    '可以接受，这是求职者掌握和运用现代科技能力的一部分': 0,
    '可以接受，但应有所限制，过度依赖AI可能会掩盖候选人的真实技能和创造力。': 0,
    '不接受，因为可能导致信息失真或不公平竞争': 0,
    '不接受，这可能会削弱求职过程中应有的个人努力和真实性': 0,
    '不确定/需要进一步观察': 0
  };

  surveyAnswers.forEach((answer) => {
    if (answer.aiUsageOpinion in opinionCounts) {
      opinionCounts[answer.aiUsageOpinion as keyof typeof opinionCounts]++;
    }
  });

  return [
    { name: '强烈支持', value: opinionCounts['可以接受，这是求职者掌握和运用现代科技能力的一部分'] },
    { name: '支持', value: opinionCounts['可以接受，只要确保提供的信息真实可靠'] },
    { name: '中立', value: opinionCounts['可以接受，但应有所限制，过度依赖AI可能会掩盖候选人的真实技能和创造力。'] },
    { name: '反对', value: opinionCounts['不接受，因为可能导致信息失真或不公平竞争'] },
    { name: '强烈反对', value: opinionCounts['不接受，这可能会削弱求职过程中应有的个人努力和真实性'] },
    { name: '不确定', value: opinionCounts['不确定/需要进一步观察'] }
  ];
}

export async function submitSurveyAnswer(data: {
  aiUsageOpinion: string;
  aiLeadership: string;
  aiImpactAreas: string;
  otherImpactArea?: string;
  participantId: string;
}) {
  const { data: result, error } = await supabase
    .from('SurveyAnswer')
    .insert([{
      ...data,
      id: uuidv4()
    }])
    .select();

  if (error) {
    console.error('Error submitting survey:', error);
    throw error;
  }

  return result;
} 
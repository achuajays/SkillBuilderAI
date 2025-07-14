import { supabase } from './supabaseClient';
import { LearningPlan } from '../types/types';

export async function saveLearningPlan(userId: string, plan: LearningPlan): Promise<void> {
  const { error } = await supabase
    .from('learning_plans')
    .upsert({ user_id: userId, plan: JSON.stringify(plan) });

  if (error) throw error;
}

export async function getLearningPlan(userId: string): Promise<LearningPlan | null> {
  const { data, error } = await supabase
    .from('learning_plans')
    .select('plan')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data ? JSON.parse(data.plan) : null;
}

export async function deleteLearningPlan(userId: string): Promise<void> {
  const { error } = await supabase
    .from('learning_plans')
    .delete()
    .eq('user_id', userId);

  if (error) throw error;
}
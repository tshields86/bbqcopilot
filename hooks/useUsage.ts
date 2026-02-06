import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { UsageStatus } from '@/lib/types';

const USAGE_KEY = ['usage'];

// Fetch current usage status
async function fetchUsageStatus(): Promise<UsageStatus> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodStartStr = periodStart.toISOString().split('T')[0];
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // Get subscription tier
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('tier, monthly_recipe_limit')
    .eq('user_id', user.id)
    .single();

  // Default to free tier
  const tier = subscription?.tier || 'free';
  const limit = subscription?.monthly_recipe_limit || 15;

  // Get current usage
  const { data: usage } = await supabase
    .from('user_usage')
    .select('recipes_generated')
    .eq('user_id', user.id)
    .eq('period_start', periodStartStr)
    .single();

  const used = usage?.recipes_generated || 0;
  const remaining = Math.max(0, limit - used);
  const isLimited = tier !== 'unlimited';

  return {
    used,
    limit,
    remaining,
    tier,
    resetDate: nextMonth.toISOString(),
    isLimited,
  };
}

// Hook to fetch usage status
export function useUsage() {
  return useQuery({
    queryKey: USAGE_KEY,
    queryFn: fetchUsageStatus,
    staleTime: 1000 * 60, // 1 minute
  });
}

// Helper to check if user is approaching limit
export function isApproachingLimit(usage: UsageStatus): boolean {
  if (!usage.isLimited) return false;
  return usage.remaining <= 3 && usage.remaining > 0;
}

// Helper to check if user has hit limit
export function hasHitLimit(usage: UsageStatus): boolean {
  if (!usage.isLimited) return false;
  return usage.remaining === 0;
}

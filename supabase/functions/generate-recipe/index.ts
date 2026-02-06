import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Anthropic from 'npm:@anthropic-ai/sdk@0.24.0';
import { corsHeaders } from '../_shared/cors.ts';

interface RecipeRequest {
  equipment: {
    grill: {
      name: string;
      brand: string;
      model: string;
      type: string;
    };
    accessories: Array<{
      name: string;
      type: string;
    }>;
  };
  request: string;
  clarifications: Array<{
    question: string;
    answer: string;
  }>;
  preferences?: {
    skillLevel?: string;
    timeAvailable?: string;
    servings?: number;
    flavorProfile?: string;
  };
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetDate: string;
}

// Check and update rate limits
async function checkRateLimit(
  userId: string,
  supabase: ReturnType<typeof createClient>
): Promise<RateLimitResult> {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodStartStr = periodStart.toISOString().split('T')[0];

  // Get user's subscription tier
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('tier, monthly_recipe_limit, daily_recipe_limit')
    .eq('user_id', userId)
    .single();

  // Default to free tier if no subscription found
  const monthlyLimit = subscription?.monthly_recipe_limit || 15;

  // Get or create usage record for this month
  const { data: usage } = await supabase
    .from('user_usage')
    .select('*')
    .eq('user_id', userId)
    .eq('period_start', periodStartStr)
    .single();

  const currentUsage = usage?.recipes_generated || 0;

  // Calculate next reset date (first of next month)
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  if (currentUsage >= monthlyLimit) {
    return {
      allowed: false,
      remaining: 0,
      limit: monthlyLimit,
      resetDate: nextMonth.toISOString(),
    };
  }

  return {
    allowed: true,
    remaining: monthlyLimit - currentUsage,
    limit: monthlyLimit,
    resetDate: nextMonth.toISOString(),
  };
}

// Increment usage counter
async function incrementUsage(
  userId: string,
  supabase: ReturnType<typeof createClient>
): Promise<void> {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodStartStr = periodStart.toISOString().split('T')[0];

  // Upsert usage record
  await supabase.rpc('increment_recipe_usage', {
    p_user_id: userId,
    p_period_start: periodStartStr,
  });
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role for usage tracking
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify the JWT and get user
    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check rate limit
    const rateLimit = await checkRateLimit(user.id, supabase);

    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: `You've used all ${rateLimit.limit} recipes this month. Limit resets on ${new Date(rateLimit.resetDate).toLocaleDateString()}.`,
          resetDate: rateLimit.resetDate,
          limit: rateLimit.limit,
          remaining: 0,
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': String(rateLimit.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetDate,
          },
        }
      );
    }

    const anthropic = new Anthropic({
      apiKey: Deno.env.get('ANTHROPIC_API_KEY')!,
    });

    const { equipment, request, clarifications, preferences }: RecipeRequest = await req.json();

    // Build the prompt
    const systemPrompt = `You are BBQCopilot, an expert BBQ pitmaster and recipe generator. You create detailed, equipment-specific recipes tailored to the user's exact grill and accessories.

Your responses should be structured as JSON with the following format:
{
  "title": "Recipe title",
  "description": "Brief appetizing description",
  "proteins": [{"name": "brisket", "weight": "12 lbs", "quantity": 1}],
  "servings": 8,
  "totalTimeMinutes": 720,
  "difficulty": "medium",
  "targetEatingTime": "6:00 PM",
  "ingredients": [
    {"item": "ingredient name", "amount": "quantity", "notes": "optional notes"}
  ],
  "equipmentNeeded": ["list of equipment from user's inventory to use"],
  "prepInstructions": [
    {"step": 1, "title": "Step title", "description": "Detailed instructions", "timeMinutes": 30}
  ],
  "cookTimeline": [
    {
      "time": "5:00 AM",
      "relativeHours": -13,
      "action": "Action title",
      "details": "Detailed instructions for this step",
      "temperature": "225°F",
      "duration": "6 hours",
      "checkpoints": ["What to look for"]
    }
  ],
  "tips": ["Pro tips specific to their equipment"],
  "servingSuggestions": ["Side dish ideas", "Beverage pairings"]
}

CRITICAL TIMELINE INSTRUCTIONS:
1. The "relativeHours" field indicates hours relative to the target eating/serving time
   - Negative values = BEFORE eating time (e.g., -12 means 12 hours before serving)
   - Zero = serving time
   - Positive values = after eating time (rare, mainly for cleanup)
2. The "time" field should show the ACTUAL clock time based on the target eating time
3. Work BACKWARDS from the target eating time to calculate all step times
4. Example: If target is 6:00 PM and a step is relativeHours: -12, time should be "6:00 AM"
5. Include the target eating time in the "targetEatingTime" field

Key guidelines:
1. Always tailor instructions to their specific grill type (kamado vs gas vs offset, etc.)
2. Include specific temperature management advice for their grill
3. Account for their available accessories
4. Provide realistic time estimates
5. Include rest times and carryover cooking
6. For long cooks, the first step should have the most negative relativeHours

CRITICAL: You MUST output valid, complete JSON. Do not truncate your response. Ensure all arrays and objects are properly closed. Keep the response focused and concise to ensure completion.`;

    // Extract eating time from clarifications if provided
    const eatingTimeAnswer = clarifications.find(
      (c) => c.question.toLowerCase().includes('time') && c.question.toLowerCase().includes('eat')
    );
    // Parse the eating time from the answer (e.g., "6:00 PM (Recommended)" -> "6:00 PM")
    const targetEatingTime = eatingTimeAnswer
      ? eatingTimeAnswer.answer.replace(/\s*\([^)]*\)/g, '').trim()
      : '6:00 PM';

    const userMessage = `
Equipment Profile:
- Grill: ${equipment.grill.brand} ${equipment.grill.model} (${equipment.grill.type} style)
- Accessories: ${equipment.accessories.map((a) => a.name).join(', ') || 'None specified'}

Cook Request: ${request}

TARGET EATING TIME: ${targetEatingTime}
(Generate all timeline step times working backwards from this target eating time)

${
  clarifications.length > 0
    ? `
Additional Details:
${clarifications.map((c) => `Q: ${c.question}\nA: ${c.answer}`).join('\n\n')}
`
    : ''
}

${
  preferences
    ? `
Preferences:
- Skill Level: ${preferences.skillLevel || 'Not specified'}
- Time Available: ${preferences.timeAvailable || 'Flexible'}
- Servings: ${preferences.servings || 'Not specified'}
- Flavor Profile: ${preferences.flavorProfile || 'Classic BBQ'}
`
    : ''
}

Please generate a detailed, equipment-specific recipe with a complete cook timeline. Remember to set targetEatingTime to "${targetEatingTime}" and calculate all timeline step times working backwards from this target.`;

    // Increment usage BEFORE making the API call (to prevent race conditions)
    await incrementUsage(user.id, supabase);

    // Stream the response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await anthropic.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 8192, // Increased to allow for complete recipe JSON
            stream: true,
            system: systemPrompt,
            messages: [{ role: 'user', content: userMessage }],
          });

          for await (const event of response) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
              );
            }
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (streamError) {
          console.error('Streaming error:', streamError);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: (streamError as Error).message })}\n\n`)
          );
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-RateLimit-Limit': String(rateLimit.limit),
        'X-RateLimit-Remaining': String(rateLimit.remaining - 1),
        'X-RateLimit-Reset': rateLimit.resetDate,
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

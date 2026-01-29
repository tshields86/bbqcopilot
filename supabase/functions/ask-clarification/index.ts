import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Anthropic from 'npm:@anthropic-ai/sdk@0.24.0';
import { corsHeaders } from '../_shared/cors.ts';

interface ClarificationRequest {
  userInput: string;
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
  existingAnswers?: Array<{
    question: string;
    answer: string;
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify auth
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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

    const anthropic = new Anthropic({
      apiKey: Deno.env.get('ANTHROPIC_API_KEY')!,
    });

    const { userInput, equipment, existingAnswers }: ClarificationRequest = await req.json();

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 500,
      system: `You are BBQCopilot's BBQ assistant. Based on the user's cook request, generate 1-4 clarifying questions to help create the perfect recipe.

Return JSON format:
{
  "questions": [
    {
      "id": "skill_level",
      "question": "What's your BBQ experience level?",
      "type": "choice",
      "options": ["Beginner", "Intermediate", "Advanced"]
    },
    {
      "id": "eating_time",
      "question": "What time do you want to eat?",
      "type": "choice",
      "options": ["12:00 PM (Lunch)", "5:00 PM", "6:00 PM (Recommended)", "7:00 PM"]
    }
  ],
  "ready": false
}

Set "ready": true when you have enough information and don't need more questions.

IMPORTANT: For any cook that takes more than 1 hour, you MUST ask about target eating time. This is critical for generating an accurate timeline. Use id "eating_time" for this question.

Common questions to consider (in priority order):
1. Target eating time (REQUIRED for cooks > 1 hour) - this helps plan the cook timeline
2. Skill level (if not obvious)
3. Time available (only if eating time wasn't asked)
4. Number of servings
5. Flavor preferences (sweet, spicy, traditional, etc.)
6. Any dietary restrictions

Don't ask redundant questions if the answer is obvious from context.`,
      messages: [
        {
          role: 'user',
          content: `User's request: "${userInput}"
Equipment: ${equipment.grill.brand} ${equipment.grill.model} (${equipment.grill.type})
Accessories: ${equipment.accessories.map((a) => a.name).join(', ') || 'None'}
${existingAnswers?.length ? `Already answered: ${JSON.stringify(existingAnswers)}` : ''}`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return new Response(content.text, {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Unexpected response format');
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

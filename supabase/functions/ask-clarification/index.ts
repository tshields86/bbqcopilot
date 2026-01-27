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
      system: `You are BBQCopilot's BBQ assistant. Based on the user's cook request, generate 1-3 clarifying questions to help create the perfect recipe.

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
      "id": "time",
      "question": "How much time do you have?",
      "type": "choice",
      "options": ["2-3 hours", "4-6 hours", "Full day (8+ hours)"]
    }
  ],
  "ready": false
}

Set "ready": true when you have enough information and don't need more questions.
Common questions to consider:
- Skill level (if not obvious)
- Time available
- Number of servings
- Flavor preferences (sweet, spicy, traditional, etc.)
- Any dietary restrictions

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

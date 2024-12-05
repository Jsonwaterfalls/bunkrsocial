import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { statement, postId } = await req.json();
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Define models to use for verification
    const models = [
      { name: 'GPT-4o-mini', systemPrompt: 'You are a fact-checking assistant.' },
      { name: 'GPT-4o', systemPrompt: 'You are a thorough fact-checking assistant that provides detailed analysis.' }
    ];

    const verificationResults = [];

    for (const model of models) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model.name === 'GPT-4o-mini' ? 'gpt-4o-mini' : 'gpt-4o',
          messages: [
            { 
              role: 'system', 
              content: `${model.systemPrompt} Analyze the following statement and determine if it's true, false, or uncertain. 
                       Provide your verdict as either "true", "false", or "uncertain", along with your confidence level (0-100) 
                       and detailed reasoning. Format your response as JSON with the following structure:
                       { "verdict": "true|false|uncertain", "confidence": number, "reasoning": "string" }`
            },
            { role: 'user', content: statement }
          ],
        }),
      });

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);

      // Store verification result in database
      const { error: insertError } = await supabase
        .from('verification_results')
        .insert({
          post_id: postId,
          model: model.name,
          confidence: result.confidence,
          reasoning: result.reasoning,
          verdict: result.verdict
        });

      if (insertError) throw insertError;

      verificationResults.push({
        model: model.name,
        ...result
      });
    }

    return new Response(JSON.stringify({ results: verificationResults }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
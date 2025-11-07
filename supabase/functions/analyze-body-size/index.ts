import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const allowedOrigins = [
  'https://dkwhjdhnbwjszvciugzn.lovable.app',
  'http://localhost:5173',
  'http://localhost:8080'
];

const getCorsHeaders = (origin: string | null) => {
  const isAllowed = origin && allowedOrigins.includes(origin);
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
};

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();
    
    // Input validation
    if (!image || typeof image !== 'string' || image.length > 1000000) {
      return new Response(
        JSON.stringify({ error: 'Invalid image data provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Service configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a professional fashion sizing AI assistant. Analyze body proportions from images to recommend clothing sizes (S, M, L, XL). 

Your analysis should consider:
- Overall body frame (small, medium, large)
- Shoulder width relative to body
- Torso proportions
- Height indicators from posture

Return your response in this exact JSON format:
{
  "recommendedSize": "M",
  "confidence": 85,
  "bodyType": "athletic",
  "measurements": {
    "chest": "38-40 inches",
    "shoulders": "medium width"
  },
  "fitAdvice": "Size M will provide a comfortable regular fit. Consider L for a looser style."
}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this person\'s body proportions and recommend the best t-shirt size (S, M, L, or XL). Provide sizing confidence and fit advice.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Service is currently busy. Please try again shortly.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Service temporarily unavailable. Please try again later.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Analysis failed. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    const aiContent = aiResponse.choices?.[0]?.message?.content;

    // Parse the AI response
    let analysis;
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback parsing if no JSON found
        analysis = {
          recommendedSize: 'M',
          confidence: 75,
          bodyType: 'standard',
          measurements: {
            chest: 'standard proportions',
            shoulders: 'medium width'
          },
          fitAdvice: aiContent
        };
      }
    } catch (parseError) {
      analysis = {
        recommendedSize: 'M',
        confidence: 70,
        bodyType: 'standard',
        measurements: {
          chest: 'Unable to determine exact measurements',
          shoulders: 'standard'
        },
        fitAdvice: 'Size M recommended as a safe starting point.'
      };
    }

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred. Please try again.'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
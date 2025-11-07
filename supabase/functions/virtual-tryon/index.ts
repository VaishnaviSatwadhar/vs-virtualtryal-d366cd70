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

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userImage, clothingImage, clothingName, backgroundType = "original" } = await req.json();
    
    // Input validation
    if (!userImage || typeof userImage !== 'string' || userImage.length > 1000000) {
      return new Response(
        JSON.stringify({ error: "Invalid user image data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!clothingImage || typeof clothingImage !== 'string' || clothingImage.length > 1000000) {
      return new Response(
        JSON.stringify({ error: "Invalid clothing image data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (clothingName && (typeof clothingName !== 'string' || clothingName.length > 200)) {
      return new Response(
        JSON.stringify({ error: "Invalid clothing name" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Service configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create a detailed prompt for realistic virtual try-on
    const prompt = `Create a photorealistic virtual try-on image. Take the person from the first image and make them wear the clothing item from the second image (${clothingName || 'clothing item'}). 

CRITICAL REQUIREMENTS:
- Preserve the person's face, body posture, and proportions EXACTLY from the original photo
- Seamlessly blend the clothing onto the person's body with perfect alignment
- Match lighting, shadows, and highlights to the person's environment
- Add realistic fabric wrinkles, folds, and texture that follow body contours naturally
- Ensure the clothing fits the body shape accurately with proper draping
- Maintain consistent color temperature and tone throughout the image
- Add subtle cast shadows where clothing overlaps body
- Keep the ${backgroundType === "original" ? "original background unchanged" : backgroundType === "plain" ? "background as plain white studio" : "background as professional studio setting"}
- Make it look like a real photograph, not a digital composite
- Preserve skin tone, hair, and all facial features exactly as in the original

The result should be indistinguishable from a real photograph of the person wearing these clothes.`;
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: userImage } },
              { type: "image_url", image_url: { url: clothingImage } }
            ]
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Service is currently busy. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "Image generation failed. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const generatedImage = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImage) {
      return new Response(
        JSON.stringify({ error: "Image generation failed. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        image: generatedImage,
        message: "Virtual try-on completed successfully"
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: "An unexpected error occurred. Please try again."
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
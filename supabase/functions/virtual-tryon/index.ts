import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userImage, clothingImage, clothingName, backgroundType = "original" } = await req.json();
    
    if (!userImage || !clothingImage) {
      return new Response(
        JSON.stringify({ error: "Missing required images" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
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

    console.log("Sending virtual try-on request to AI...");
    
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
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits required. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const generatedImage = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImage) {
      throw new Error("No image generated");
    }

    console.log("Virtual try-on image generated successfully");

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
    console.error("Virtual try-on error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

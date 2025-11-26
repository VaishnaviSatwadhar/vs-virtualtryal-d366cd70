import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Virtual try-on request received");
    const { userImage, clothingImage, clothingName, backgroundType = "original" } = await req.json();
    console.log("Request data parsed successfully", { clothingName, backgroundType });
    
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
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Service configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Starting AI image generation...");

    // Create a detailed prompt for realistic virtual try-on
    const prompt = `TASK: Create a photorealistic virtual try-on image. Detect the person in the first image and seamlessly fit the ${clothingName || 'clothing/jewelry item'} from the second image onto them.

PERSON DETECTION & VALIDATION:
- First, verify a clear person is visible in the image with identifiable body, face, and pose
- If no person is detected or the image is too unclear, RESPOND with text "ERROR: No clear person detected. Please provide a clearer image with a visible person."
- The person must be facing the camera with clear shoulders, neck, and torso visible

BODY POSE & ALIGNMENT:
- Accurately detect body pose, shoulder width, neck position, and torso orientation
- Align the clothing/jewelry item to match the exact body angle and perspective
- Preserve the natural body shape and proportions without distortion
- Maintain correct placement on neck, shoulders, chest, or relevant body part

FITTING & PROPORTIONS:
- Fit the item realistically according to body measurements and pose
- For clothing: ensure proper draping, natural fabric flow following body contours
- For jewelry: position precisely on neck, wrists, fingers, or ears with correct scale
- Add realistic fabric wrinkles, folds, and texture that respond to body movement
- Scale the item proportionally to the person's body size

LIGHTING & SHADOWS:
- Match lighting direction, intensity, and color temperature from the original photo
- Add natural shadows where clothing/jewelry overlaps body
- Create realistic highlights on reflective surfaces (jewelry, watches)
- Ensure consistent lighting across the entire composition

QUALITY & REALISM:
- Preserve the person's face, hair, skin tone, and all features EXACTLY
- Do NOT crop the face or any body parts
- Blend seamlessly with no visible edges or compositing artifacts
- Make it indistinguishable from a real photograph
- Keep high resolution and sharp details throughout

BACKGROUND HANDLING:
- ${backgroundType === "transparent" ? "Remove background completely for transparent PNG output" : backgroundType === "plain" ? "Replace with clean white studio background" : backgroundType === "professional" ? "Replace with professional studio setting with soft lighting" : "Preserve the original background exactly as is"}

OUTPUT: A smooth, high-quality, photorealistic image that looks like the person naturally wearing/accessorizing with the item. No distortion, cropping, or artificial appearance.`;
    
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
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      
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
    const aiResponse = data.choices?.[0]?.message?.content;

    // Check if AI detected an error (no person found)
    if (aiResponse && typeof aiResponse === 'string' && aiResponse.includes("ERROR:")) {
      return new Response(
        JSON.stringify({ 
          error: "No clear person detected in the image. Please upload a clearer photo showing your face, shoulders, and torso facing the camera.",
          requiresNewImage: true
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!generatedImage) {
      console.error("No image generated in response");
      return new Response(
        JSON.stringify({ error: "Image generation failed. Please ensure your photo clearly shows a person and try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Virtual try-on completed successfully");
    return new Response(
      JSON.stringify({ 
        success: true, 
        image: generatedImage,
        message: "Virtual try-on completed successfully! The item has been fitted realistically to your body."
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ 
        error: "An unexpected error occurred. Please try again.",
        details: error instanceof Error ? error.message : String(error)
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
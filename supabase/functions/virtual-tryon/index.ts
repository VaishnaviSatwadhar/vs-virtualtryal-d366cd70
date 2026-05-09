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
    const { userImage, clothingImage, clothingName, clothingImages, clothingNames, backgroundType = "original", view = "front", size = "M" } = await req.json();

    // Normalize to arrays (support legacy single-item callers)
    const imagesArr: string[] = Array.isArray(clothingImages) && clothingImages.length > 0
      ? clothingImages
      : (clothingImage ? [clothingImage] : []);
    const namesArr: string[] = Array.isArray(clothingNames) && clothingNames.length > 0
      ? clothingNames
      : (clothingName ? [clothingName] : []);

    console.log("Request data parsed", { itemCount: imagesArr.length, names: namesArr, backgroundType, view, size });
    
    // Input validation
    if (!userImage || typeof userImage !== 'string' || userImage.length > 1000000) {
      return new Response(
        JSON.stringify({ error: "Invalid user image data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (imagesArr.length === 0) {
      return new Response(
        JSON.stringify({ error: "No clothing item provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    for (const img of imagesArr) {
      if (!img || typeof img !== "string" || img.length > 1000000) {
        return new Response(
          JSON.stringify({ error: "Invalid clothing image data" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
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

    // Concise prompt for faster AI processing
    const bgInstruction = backgroundType === "transparent" ? "transparent background" : 
                          backgroundType === "plain" ? "white studio background" : 
                          backgroundType === "professional" ? "professional studio background" : 
                          "keep original background";

    const viewKey = view === "back" || view === "side" ? view : "front";
    const viewInstruction =
      viewKey === "front"
        ? "Show the FRONT view of the person."
        : viewKey === "back"
        ? "Show the BACK view of the same person (rotated 180°), same body, pose mirrored facing away. Show how the garment looks from behind."
        : "Show the SIDE PROFILE view (90° rotation) of the same person wearing the garment.";

    const sizeMap: Record<string, string> = {
      XS: "extra-small / very tight fitted look, garment hugs the body closely with minimal fabric excess",
      S: "small / snug fitted look, slightly tight against the body",
      M: "medium / standard regular fit, true to body proportions",
      L: "large / slightly loose fit with a bit of extra fabric room",
      XL: "extra-large / clearly loose and roomy fit, noticeably larger than the body",
      XXL: "double extra-large / very oversized, baggy and draping fit",
    };
    const sizeKey = (typeof size === "string" ? size.toUpperCase() : "M");
    const sizeInstruction = sizeMap[sizeKey] || sizeMap.M;

    const itemList = namesArr.length > 0
      ? namesArr.map((n, i) => `(${i + 2}) ${n}`).join(", ")
      : "the items in the following images";
    const multi = imagesArr.length > 1;
    const prompt = `Virtual try-on: Image 1 is the person. The next ${imagesArr.length} image${multi ? "s are" : " is"} clothing/accessory item${multi ? "s" : ""}: ${itemList}. ${multi ? "Layer ALL of these items together onto the same person in a single photo, combining them naturally (e.g. shirt + pants + accessories worn at the same time). Respect realistic garment layering order." : "Fit this item onto the person."} Match body proportions, skin tone, and lighting. Render clothing at SIZE ${sizeKey} — ${sizeInstruction}. Each size up should look progressively looser/larger; each size down progressively tighter/smaller. ${viewInstruction} ${bgInstruction}. Keep the same person identity, hair, and skin. If no person visible, respond "ERROR: No person detected". Output a single photorealistic result image with all selected items worn together.`;
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: userImage } },
              ...imagesArr.map((url) => ({ type: "image_url" as const, image_url: { url } })),
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
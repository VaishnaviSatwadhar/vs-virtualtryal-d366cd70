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
    const prompt = `PHOTOREALISTIC VIRTUAL TRY-ON TASK.

INPUT: Image 1 = the PERSON (reference). The next ${imagesArr.length} image${multi ? "s are" : " is"} the GARMENT${multi ? "S" : ""} to wear: ${itemList}.

STRICT RULES:
1. PERSON IDENTITY MUST BE 100% PRESERVED: exact same face, facial features, skin tone, hair, body shape, height, pose and background context as Image 1. DO NOT change the person's identity, age, gender, ethnicity, or body proportions.
2. GARMENT FIDELITY: Reproduce each garment EXACTLY as shown — same color (do not shift hue), same pattern, prints, logos, text, buttons, zippers, stitching, neckline, sleeves, length and fabric texture. No invented details.
3. ${multi ? "Layer ALL garments together on the same person in ONE final image, with realistic layering order (innerwear under outerwear, tops tucked or untucked naturally, accessories on top)." : "Place the garment naturally on the person, replacing any conflicting clothing in that region."}
4. FIT: Render at SIZE ${sizeKey} — ${sizeInstruction}. Fabric must drape, fold, wrinkle and shadow realistically over the body's contours.
5. LIGHTING & COLOR: Match the lighting direction, intensity, white balance and shadows of the original photo so the garment looks like it was actually photographed on the person.
6. VIEW: ${viewInstruction}
7. BACKGROUND: ${bgInstruction}.
8. QUALITY: High-resolution photorealistic output. No cartoonish look, no extra limbs, no distorted hands/face, no floating garments, no duplicate people.
9. If no clear person is visible in Image 1, respond with exactly: "ERROR: No person detected".

OUTPUT: ONE single photorealistic image of the same person wearing the specified garment${multi ? "s" : ""}.`;

    // Item placement guidance (auto-detected from product names) — helps the model
    // put jewelry on ears/neck/fingers/wrist, watches on wrist, sunglasses on eyes,
    // bags in hand or over shoulder, belts on waist, scarves on neck, shoes on feet,
    // and clothing on the torso/legs.
    const placementHints = namesArr.map((n) => {
      const s = n.toLowerCase();
      if (/(earring|stud)/.test(s)) return `- ${n}: place on EARS (both ears, correct scale).`;
      if (/(necklace|pendant|chain)/.test(s)) return `- ${n}: place around the NECK, resting naturally on the collarbone.`;
      if (/(ring|band)/.test(s)) return `- ${n}: place on a FINGER at realistic scale.`;
      if (/(bracelet|cuff|bangle)/.test(s)) return `- ${n}: place on the WRIST.`;
      if (/(watch|smartwatch|fitness band)/.test(s)) return `- ${n}: place on the WRIST with realistic strap fit.`;
      if (/(sunglass|shades|glasses|eyewear|aviator)/.test(s)) return `- ${n}: place on the FACE over the eyes, aligned to the nose bridge.`;
      if (/(cap|hat)/.test(s)) return `- ${n}: place on the HEAD at correct angle.`;
      if (/(scarf|tie)/.test(s)) return `- ${n}: drape around the NECK.`;
      if (/(belt)/.test(s)) return `- ${n}: place around the WAIST over pants/skirt.`;
      if (/(handbag|tote|crossbody|backpack|bag)/.test(s)) return `- ${n}: place naturally in HAND or over the SHOULDER.`;
      if (/(sneaker|boot|loafer|shoe|heel)/.test(s)) return `- ${n}: place on the FEET.`;
      if (/(jeans|pant|trouser|short|skirt)/.test(s)) return `- ${n}: fit on the LOWER BODY (waist to ankles/knees).`;
      if (/(dress|gown)/.test(s)) return `- ${n}: fit as a full DRESS covering torso and lower body.`;
      if (/(jacket|coat|cardigan|hoodie|blazer)/.test(s)) return `- ${n}: wear as OUTERWEAR over any inner top.`;
      return `- ${n}: place on the appropriate body region for this item, at realistic scale.`;
    }).join("\n");

    const fullPrompt = `${prompt}\n\nITEM PLACEMENT GUIDE:\n${placementHints}\n\nADDITIONAL ACCURACY RULES:\n- Jewelry, watches and eyewear MUST appear at realistic real-world scale (not oversized).\n- Metallic items (gold, silver, platinum) must keep their exact metal tone and shine.\n- Gemstones (diamond, pearl, ruby, emerald, sapphire) must keep their exact color and cut.\n- Hands, fingers, ears and neckline must remain anatomically correct.\n- Do not remove existing clothing unless a new garment occupies the same body region.`;
    
    const MODEL_PRIMARY = "google/gemini-3.1-flash-image-preview";
    const MODEL_FALLBACK = "google/gemini-2.5-flash-image";

    const callAI = (model: string) => fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: fullPrompt },
              { type: "image_url", image_url: { url: userImage } },
              ...imagesArr.map((url) => ({ type: "image_url" as const, image_url: { url } })),
            ]
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    // Retry on 429 with exponential backoff; if primary preview model stays rate
    // limited, fall back to the stable image model so users still get a result.
    const tryWithRetries = async (model: string, maxAttempts: number) => {
      let res = await callAI(model);
      let attempt = 0;
      while (res.status === 429 && attempt < maxAttempts) {
        const wait = 2000 * Math.pow(2, attempt); // 2s, 4s, 8s, 16s
        console.log(`[${model}] Rate limited, retrying in ${wait}ms (attempt ${attempt + 1}/${maxAttempts})`);
        await new Promise((r) => setTimeout(r, wait));
        res = await callAI(model);
        attempt++;
      }
      return res;
    };

    let response = await tryWithRetries(MODEL_PRIMARY, 4);
    if (response.status === 429) {
      console.log(`Primary model rate limited, falling back to ${MODEL_FALLBACK}`);
      response = await tryWithRetries(MODEL_FALLBACK, 3);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "AI is busy right now (rate limited). Please wait ~30 seconds and try again." }),
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
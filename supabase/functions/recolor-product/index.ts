import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COLOR_NAMES: Record<string, string> = {
  "#000000": "black", "#FFFFFF": "white", "#FF6B6B": "coral", "#4ECDC4": "teal",
  "#C0C0C0": "silver", "#FFD700": "gold", "#1E3A8A": "navy blue", "#374151": "charcoal gray",
  "#DC2626": "red", "#8B4513": "brown", "#4169E1": "royal blue", "#9B59B6": "purple",
  "#065F46": "forest green", "#FCD34D": "yellow", "#FDE047": "lemon yellow", "#FBBF24": "amber",
  "#6B7280": "gray", "#E5E7EB": "light gray", "#E0BFB8": "rose gold", "#F5DEB3": "wheat beige",
  "#87CEEB": "sky blue", "#FF69B4": "pink",
};

function colorName(hex: string) {
  return COLOR_NAMES[hex.toUpperCase()] ?? hex;
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { productId, productName, imageUrl, color, view } = await req.json();
    if (!productId || !imageUrl || !color) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const viewKey: "front" | "back" | "side" =
      view === "back" || view === "side" ? view : "front";

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const fileName = `${slug(color)}-${viewKey}.png`;
    const cacheKey = `${productId}/${fileName}`;

    // Check cache
    const { data: existing } = await supabase.storage
      .from("product-variants").list(productId, { search: fileName });
    if (existing && existing.some((f) => f.name === fileName)) {
      const { data: pub } = supabase.storage.from("product-variants").getPublicUrl(cacheKey);
      return new Response(JSON.stringify({ url: pub.publicUrl, cached: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch source image and convert to data URL
    const srcRes = await fetch(imageUrl);
    if (!srcRes.ok) throw new Error(`Failed to fetch source image: ${srcRes.status}`);
    const srcBuf = new Uint8Array(await srcRes.arrayBuffer());
    const srcMime = srcRes.headers.get("content-type") || "image/jpeg";
    const srcB64 = btoa(String.fromCharCode(...srcBuf));
    const srcDataUrl = `data:${srcMime};base64,${srcB64}`;

    const cName = colorName(color);
    const viewInstruction =
      viewKey === "front"
        ? "Show a clear FRONT view of the product."
        : viewKey === "back"
        ? "Generate the BACK view of the same product (rear side), as if the camera moved 180° around it. Maintain identical garment design, proportions, fabric, and studio lighting. Show seams, tags, or back details realistically."
        : "Generate the SIDE view (90° profile) of the same product. Maintain identical garment design, proportions, fabric, and studio lighting.";
    const prompt = `Change ONLY the dominant color of the main product/garment in this image to ${cName} (hex ${color}). Apply the new color uniformly to all parts of the product that share its current main color, including sleeves, hood, collar, body, straps, bands, etc. Preserve EVERYTHING else exactly: the product's shape, silhouette, design, prints, logos, stitching, fabric texture, material finish, buttons, zippers, hardware, lighting, shadows, perspective, and the original background. Do NOT change the product type, do NOT add or remove elements, do NOT alter the pose or framing. ${viewInstruction} Output a clean photorealistic e-commerce product image.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: srcDataUrl } },
        ]}],
        modalities: ["image", "text"],
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error("AI error", aiRes.status, t);
      if (aiRes.status === 429) return new Response(JSON.stringify({ error: "Rate limited, try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiRes.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway error ${aiRes.status}`);
    }

    const aiData = await aiRes.json();
    const dataUrl: string | undefined = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!dataUrl) throw new Error("No image returned from AI");

    const b64 = dataUrl.split(",")[1];
    const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

    const { error: upErr } = await supabase.storage.from("product-variants")
      .upload(cacheKey, bin, { contentType: "image/png", upsert: true });
    if (upErr) throw upErr;

    const { data: pub } = supabase.storage.from("product-variants").getPublicUrl(cacheKey);
    return new Response(JSON.stringify({ url: pub.publicUrl, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("recolor-product error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
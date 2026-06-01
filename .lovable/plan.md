Plan to make the try-on result work more reliably for clothing + jewelry:

1. Refresh the AI Gateway token
- Rotate the managed `LOVABLE_API_KEY` so the edge function uses a new valid token.
- Do not expose or hardcode the token in frontend code.

2. Replace the image model
- Update `supabase/functions/virtual-tryon/index.ts` from `google/gemini-2.5-flash-image` to the newer higher-quality image model `google/gemini-3.1-flash-image-preview`.
- Keep the existing Lovable AI backend function boundary so user photos and product images stay server-side.

3. Improve fit accuracy for mixed product types
- Add item-category guidance in the prompt so clothes, jewelry, eyewear, watches, bags, belts, scarves, and shoes are positioned on the correct body area.
- Make the prompt stricter about preserving the uploaded user photo, product color/material/logo/details, jewelry scale, hand/neck/ear placement, and clothing drape.
- Keep multi-item layering working, e.g. shirt + jeans + necklace + watch.

4. Improve result/error handling
- Preserve existing 429 countdown behavior.
- Keep clear messages for missing person, exhausted credits, and generation failures.

5. Verify
- Deploy/test the updated edge function invocation path.
- Confirm the app still sends uploaded photo, selected products, selected size, and background/view options to the try-on service.
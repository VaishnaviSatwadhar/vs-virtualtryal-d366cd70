-- Public bucket for AI-generated product color variants
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-variants', 'product-variants', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access; writes happen only from edge function (service role bypasses RLS)
CREATE POLICY "Public read product variants"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-variants');
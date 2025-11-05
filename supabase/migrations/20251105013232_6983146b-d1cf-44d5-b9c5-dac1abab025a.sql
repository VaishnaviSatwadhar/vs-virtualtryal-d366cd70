-- Create user_measurements table
CREATE TABLE public.user_measurements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  height_cm DECIMAL(5,2),
  weight_kg DECIMAL(5,2),
  chest_cm DECIMAL(5,2),
  waist_cm DECIMAL(5,2),
  hips_cm DECIMAL(5,2),
  shoulder_width_cm DECIMAL(5,2),
  sleeve_length_cm DECIMAL(5,2),
  inseam_cm DECIMAL(5,2),
  shoe_size TEXT,
  body_type TEXT,
  preferred_fit TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_measurements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own measurements"
ON public.user_measurements
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own measurements"
ON public.user_measurements
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own measurements"
ON public.user_measurements
FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_measurements_updated_at
  BEFORE UPDATE ON public.user_measurements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create saved_products table
CREATE TABLE public.saved_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  product_image TEXT NOT NULL,
  category TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_products ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own saved products"
ON public.saved_products
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved products"
ON public.saved_products
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved products"
ON public.saved_products
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_saved_products_user_id ON public.saved_products(user_id);
CREATE INDEX idx_saved_products_created_at ON public.saved_products(created_at DESC);
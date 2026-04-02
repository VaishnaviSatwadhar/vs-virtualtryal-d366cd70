
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  product_image text NOT NULL,
  product_price numeric NOT NULL,
  total_amount numeric NOT NULL,
  razorpay_payment_id text,
  razorpay_order_id text,
  status text NOT NULL DEFAULT 'paid',
  delivery_address text,
  customer_name text,
  customer_email text,
  customer_phone text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

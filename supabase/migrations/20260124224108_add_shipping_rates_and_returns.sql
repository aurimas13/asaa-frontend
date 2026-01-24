/*
  # Add Shipping Rates and Returns System

  1. New Tables
    - `shipping_zones` - Geographic shipping zones
      - `id` (uuid, primary key)
      - `name` (text) - Zone name (e.g., "Baltic States", "EU", "Worldwide")
      - `countries` (text[]) - Array of country codes
      
    - `shipping_rates` - Shipping rates per zone and method
      - `id` (uuid, primary key)
      - `zone_id` (uuid) - References shipping_zones
      - `method` (text) - standard, express, economy
      - `min_weight` (numeric) - Minimum weight in kg
      - `max_weight` (numeric) - Maximum weight in kg
      - `price` (numeric) - Price in EUR
      - `estimated_days_min` (int) - Min delivery days
      - `estimated_days_max` (int) - Max delivery days
      - `free_shipping_threshold` (numeric) - Free shipping above this amount
      
    - `return_requests` - Customer return requests
      - `id` (uuid, primary key)
      - `order_id` (uuid) - References orders
      - `user_id` (uuid) - References profiles
      - `rma_number` (text) - Return Merchandise Authorization number
      - `reason` (text) - Return reason category
      - `description` (text) - Detailed description
      - `status` (text) - pending, approved, rejected, received, refunded
      - `items` (jsonb) - Items being returned
      - `refund_amount` (numeric) - Refund amount
      
  2. Order Updates
    - Add `shipping_cost` column to orders
    - Add `tracking_url` column to orders

  3. Security
    - Enable RLS on all new tables
    - Users can view shipping rates
    - Users can create and view their own return requests
*/

CREATE TABLE IF NOT EXISTS shipping_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  countries text[] NOT NULL,
  sort_order int DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE shipping_zones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view shipping zones" ON shipping_zones;
CREATE POLICY "Anyone can view shipping zones"
  ON shipping_zones FOR SELECT
  TO anon, authenticated
  USING (active = true);

CREATE TABLE IF NOT EXISTS shipping_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id uuid REFERENCES shipping_zones(id) ON DELETE CASCADE,
  method text NOT NULL CHECK (method IN ('economy', 'standard', 'express')),
  min_weight numeric DEFAULT 0,
  max_weight numeric DEFAULT 30,
  price numeric NOT NULL CHECK (price >= 0),
  estimated_days_min int NOT NULL,
  estimated_days_max int NOT NULL,
  free_shipping_threshold numeric DEFAULT 50,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE shipping_rates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view shipping rates" ON shipping_rates;
CREATE POLICY "Anyone can view shipping rates"
  ON shipping_rates FOR SELECT
  TO anon, authenticated
  USING (active = true);

CREATE TABLE IF NOT EXISTS return_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id),
  rma_number text UNIQUE NOT NULL,
  reason text NOT NULL CHECK (reason IN ('defective', 'wrong_item', 'not_as_described', 'changed_mind', 'arrived_late', 'other')),
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'shipped', 'received', 'refunded')),
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  refund_amount numeric DEFAULT 0,
  admin_notes text,
  return_shipping_label text,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE return_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own return requests" ON return_requests;
CREATE POLICY "Users can view own return requests"
  ON return_requests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create return requests" ON return_requests;
CREATE POLICY "Users can create return requests"
  ON return_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own pending returns" ON return_requests;
CREATE POLICY "Users can update own pending returns"
  ON return_requests FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND status = 'pending')
  WITH CHECK (user_id = auth.uid());

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'shipping_cost'
  ) THEN
    ALTER TABLE orders ADD COLUMN shipping_cost numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'tracking_url'
  ) THEN
    ALTER TABLE orders ADD COLUMN tracking_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'shipping_zone_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN shipping_zone_id uuid REFERENCES shipping_zones(id);
  END IF;
END $$;

INSERT INTO shipping_zones (name, countries, sort_order) VALUES
  ('Lithuania', ARRAY['LT'], 1),
  ('Baltic States', ARRAY['LV', 'EE'], 2),
  ('European Union', ARRAY['DE', 'FR', 'PL', 'NL', 'BE', 'AT', 'IT', 'ES', 'PT', 'SE', 'DK', 'FI', 'CZ', 'SK', 'HU', 'RO', 'BG', 'GR', 'IE', 'HR', 'SI', 'LU', 'CY', 'MT'], 3),
  ('United Kingdom', ARRAY['GB'], 4),
  ('Rest of World', ARRAY['US', 'CA', 'AU', 'JP', 'KR', 'CN', 'SG', 'CH', 'NO', 'IS'], 5)
ON CONFLICT DO NOTHING;

INSERT INTO shipping_rates (zone_id, method, price, estimated_days_min, estimated_days_max, free_shipping_threshold)
SELECT id, 'economy', 2.99, 5, 10, 30 FROM shipping_zones WHERE name = 'Lithuania'
ON CONFLICT DO NOTHING;
INSERT INTO shipping_rates (zone_id, method, price, estimated_days_min, estimated_days_max, free_shipping_threshold)
SELECT id, 'standard', 4.99, 2, 5, 50 FROM shipping_zones WHERE name = 'Lithuania'
ON CONFLICT DO NOTHING;
INSERT INTO shipping_rates (zone_id, method, price, estimated_days_min, estimated_days_max, free_shipping_threshold)
SELECT id, 'express', 9.99, 1, 2, 100 FROM shipping_zones WHERE name = 'Lithuania'
ON CONFLICT DO NOTHING;

INSERT INTO shipping_rates (zone_id, method, price, estimated_days_min, estimated_days_max, free_shipping_threshold)
SELECT id, 'economy', 4.99, 7, 14, 40 FROM shipping_zones WHERE name = 'Baltic States'
ON CONFLICT DO NOTHING;
INSERT INTO shipping_rates (zone_id, method, price, estimated_days_min, estimated_days_max, free_shipping_threshold)
SELECT id, 'standard', 7.99, 3, 7, 60 FROM shipping_zones WHERE name = 'Baltic States'
ON CONFLICT DO NOTHING;
INSERT INTO shipping_rates (zone_id, method, price, estimated_days_min, estimated_days_max, free_shipping_threshold)
SELECT id, 'express', 14.99, 1, 3, 120 FROM shipping_zones WHERE name = 'Baltic States'
ON CONFLICT DO NOTHING;

INSERT INTO shipping_rates (zone_id, method, price, estimated_days_min, estimated_days_max, free_shipping_threshold)
SELECT id, 'economy', 7.99, 10, 21, 60 FROM shipping_zones WHERE name = 'European Union'
ON CONFLICT DO NOTHING;
INSERT INTO shipping_rates (zone_id, method, price, estimated_days_min, estimated_days_max, free_shipping_threshold)
SELECT id, 'standard', 12.99, 5, 10, 80 FROM shipping_zones WHERE name = 'European Union'
ON CONFLICT DO NOTHING;
INSERT INTO shipping_rates (zone_id, method, price, estimated_days_min, estimated_days_max, free_shipping_threshold)
SELECT id, 'express', 24.99, 2, 5, 150 FROM shipping_zones WHERE name = 'European Union'
ON CONFLICT DO NOTHING;

INSERT INTO shipping_rates (zone_id, method, price, estimated_days_min, estimated_days_max, free_shipping_threshold)
SELECT id, 'economy', 9.99, 14, 28, 70 FROM shipping_zones WHERE name = 'United Kingdom'
ON CONFLICT DO NOTHING;
INSERT INTO shipping_rates (zone_id, method, price, estimated_days_min, estimated_days_max, free_shipping_threshold)
SELECT id, 'standard', 14.99, 7, 14, 90 FROM shipping_zones WHERE name = 'United Kingdom'
ON CONFLICT DO NOTHING;
INSERT INTO shipping_rates (zone_id, method, price, estimated_days_min, estimated_days_max, free_shipping_threshold)
SELECT id, 'express', 29.99, 3, 7, 180 FROM shipping_zones WHERE name = 'United Kingdom'
ON CONFLICT DO NOTHING;

INSERT INTO shipping_rates (zone_id, method, price, estimated_days_min, estimated_days_max, free_shipping_threshold)
SELECT id, 'economy', 14.99, 21, 45, 100 FROM shipping_zones WHERE name = 'Rest of World'
ON CONFLICT DO NOTHING;
INSERT INTO shipping_rates (zone_id, method, price, estimated_days_min, estimated_days_max, free_shipping_threshold)
SELECT id, 'standard', 24.99, 10, 21, 150 FROM shipping_zones WHERE name = 'Rest of World'
ON CONFLICT DO NOTHING;
INSERT INTO shipping_rates (zone_id, method, price, estimated_days_min, estimated_days_max, free_shipping_threshold)
SELECT id, 'express', 49.99, 5, 10, 250 FROM shipping_zones WHERE name = 'Rest of World'
ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_shipping_rates_zone ON shipping_rates(zone_id);
CREATE INDEX IF NOT EXISTS idx_return_requests_order ON return_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_return_requests_user ON return_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_return_requests_status ON return_requests(status);
CREATE INDEX IF NOT EXISTS idx_return_requests_rma ON return_requests(rma_number);
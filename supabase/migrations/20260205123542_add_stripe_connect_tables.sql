/*
  # Stripe Connect Integration

  1. New Tables
    - `stripe_accounts` - Stores Stripe Connect Express account info for makers
      - `id` (uuid, primary key)
      - `maker_id` (uuid, references makers)
      - `stripe_account_id` (text, unique) - Stripe account ID (acct_xxx)
      - `account_status` (text) - pending, active, restricted, disabled
      - `charges_enabled` (boolean) - Can accept charges
      - `payouts_enabled` (boolean) - Can receive payouts
      - `details_submitted` (boolean) - Completed onboarding
      - `onboarding_url` (text) - Current onboarding link
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `stripe_transfers` - Tracks transfers to maker accounts
      - `id` (uuid, primary key)
      - `order_id` (uuid, references orders)
      - `order_item_id` (uuid, references order_items)
      - `maker_id` (uuid, references makers)
      - `stripe_account_id` (text) - Destination Stripe account
      - `gross_amount` (numeric) - Full item amount
      - `platform_fee` (numeric) - 10% commission
      - `immediate_amount` (numeric) - 85% of net (released immediately)
      - `reserve_amount` (numeric) - 15% of net (held 30 days)
      - `immediate_transfer_id` (text) - Stripe transfer ID for immediate
      - `reserve_transfer_id` (text) - Stripe transfer ID for reserve
      - `reserve_release_date` (timestamptz) - When reserve can be released
      - `reserve_released` (boolean) - Has reserve been released
      - `status` (text) - pending, immediate_sent, completed, failed
      - `currency` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Order Table Updates
    - `stripe_payment_intent_id` - Stripe payment intent
    - `stripe_charge_id` - Stripe charge ID

  3. Security
    - RLS enabled on all tables
    - Makers can only view their own Stripe accounts and transfers
    - Service role can manage all records
*/

CREATE TABLE IF NOT EXISTS stripe_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  maker_id uuid NOT NULL REFERENCES makers(id) ON DELETE CASCADE,
  stripe_account_id text UNIQUE NOT NULL,
  account_status text NOT NULL DEFAULT 'pending' CHECK (account_status IN ('pending', 'active', 'restricted', 'disabled')),
  charges_enabled boolean DEFAULT false,
  payouts_enabled boolean DEFAULT false,
  details_submitted boolean DEFAULT false,
  onboarding_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(maker_id)
);

CREATE TABLE IF NOT EXISTS stripe_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  order_item_id uuid NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  maker_id uuid NOT NULL REFERENCES makers(id),
  stripe_account_id text NOT NULL,
  gross_amount numeric NOT NULL CHECK (gross_amount >= 0),
  platform_fee numeric NOT NULL CHECK (platform_fee >= 0),
  immediate_amount numeric NOT NULL CHECK (immediate_amount >= 0),
  reserve_amount numeric NOT NULL CHECK (reserve_amount >= 0),
  immediate_transfer_id text,
  reserve_transfer_id text,
  reserve_release_date timestamptz,
  reserve_released boolean DEFAULT false,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'immediate_sent', 'completed', 'failed', 'refunded')),
  currency text DEFAULT 'eur',
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'stripe_payment_intent_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN stripe_payment_intent_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'stripe_charge_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN stripe_charge_id text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_stripe_accounts_maker_id ON stripe_accounts(maker_id);
CREATE INDEX IF NOT EXISTS idx_stripe_accounts_stripe_account_id ON stripe_accounts(stripe_account_id);
CREATE INDEX IF NOT EXISTS idx_stripe_transfers_order_id ON stripe_transfers(order_id);
CREATE INDEX IF NOT EXISTS idx_stripe_transfers_maker_id ON stripe_transfers(maker_id);
CREATE INDEX IF NOT EXISTS idx_stripe_transfers_reserve_release ON stripe_transfers(reserve_release_date, reserve_released) WHERE reserve_released = false;

ALTER TABLE stripe_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_transfers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Makers can view own stripe account" ON stripe_accounts;
CREATE POLICY "Makers can view own stripe account"
  ON stripe_accounts
  FOR SELECT
  TO authenticated
  USING (
    maker_id IN (
      SELECT id FROM makers WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Service role manages stripe accounts" ON stripe_accounts;
CREATE POLICY "Service role manages stripe accounts"
  ON stripe_accounts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Makers can view own transfers" ON stripe_transfers;
CREATE POLICY "Makers can view own transfers"
  ON stripe_transfers
  FOR SELECT
  TO authenticated
  USING (
    maker_id IN (
      SELECT id FROM makers WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Service role manages transfers" ON stripe_transfers;
CREATE POLICY "Service role manages transfers"
  ON stripe_transfers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

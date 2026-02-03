/*
  # Enhanced Order Lifecycle

  1. Changes
    - Adds new order statuses for complete lifecycle management
    - Adds payment_status column for tracking payment state
    - Adds refund_amount and refund_reason columns
    - Adds carrier and pickup_scheduled columns for shipping

  2. Order Statuses
    - pending: Order created, awaiting payment
    - awaiting_payment: Payment initiated but not confirmed
    - processing: Payment confirmed, preparing order
    - ready_for_pickup: Maker has prepared the order
    - shipped: Order shipped with carrier
    - in_transit: Package in transit
    - delivered: Package delivered to customer
    - completed: Order completed successfully
    - cancelled: Order cancelled
    - refund_requested: Customer requested refund
    - refund_approved: Refund approved
    - refunded: Refund processed

  3. Security
    - RLS policies remain in place
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_status text DEFAULT 'pending';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'refund_amount'
  ) THEN
    ALTER TABLE orders ADD COLUMN refund_amount numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'refund_reason'
  ) THEN
    ALTER TABLE orders ADD COLUMN refund_reason text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'carrier'
  ) THEN
    ALTER TABLE orders ADD COLUMN carrier text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'pickup_scheduled'
  ) THEN
    ALTER TABLE orders ADD COLUMN pickup_scheduled timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'shipped_at'
  ) THEN
    ALTER TABLE orders ADD COLUMN shipped_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'delivered_at'
  ) THEN
    ALTER TABLE orders ADD COLUMN delivered_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'tax_amount'
  ) THEN
    ALTER TABLE orders ADD COLUMN tax_amount numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'tax_rate'
  ) THEN
    ALTER TABLE orders ADD COLUMN tax_rate numeric DEFAULT 0.21;
  END IF;
END $$;

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (
  status = ANY (ARRAY[
    'pending'::text,
    'awaiting_payment'::text,
    'payment_failed'::text,
    'processing'::text,
    'ready_for_pickup'::text,
    'shipped'::text,
    'in_transit'::text,
    'delivered'::text,
    'completed'::text,
    'cancelled'::text,
    'refund_requested'::text,
    'refund_approved'::text,
    'refunded'::text
  ])
);

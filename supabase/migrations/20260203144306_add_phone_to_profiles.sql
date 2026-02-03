/*
  # Add Phone to Profiles

  1. Changes
    - Adds `phone` column to `profiles` table for storing user phone numbers
    - Phone is optional for flexibility

  2. Notes
    - Phone number is useful for shipping notifications and order updates
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone text;
  END IF;
END $$;

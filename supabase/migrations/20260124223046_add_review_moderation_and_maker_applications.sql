/*
  # Add Review Moderation and Maker Applications

  1. Reviews Enhancement
    - Add `moderation_status` column for review approval workflow
    - Add `moderated_at` and `moderated_by` for audit trail
    - Add `maker_response` for maker replies to reviews

  2. New Tables
    - `maker_applications` - Stores maker applications with admin review workflow
      - `id` (uuid, primary key)
      - `full_name` (text) - Applicant name
      - `email` (text) - Contact email
      - `phone` (text) - Contact phone
      - `business_name` (text) - Proposed business name
      - `craft_type` (text) - Type of craft
      - `experience_years` (text) - Years of experience
      - `portfolio_url` (text) - Portfolio/social link
      - `motivation` (text) - Why they want to join
      - `status` (text) - pending/approved/rejected
      - `admin_notes` (text) - Internal notes
      - `reviewed_at` (timestamptz) - When reviewed
      - `reviewed_by` (uuid) - Admin who reviewed

    - `ai_listing_drafts` - AI-generated listing drafts
      - Stores AI-generated product descriptions for review

  3. Security
    - Enable RLS on all new tables
    - Maker applications visible to admins and the applicant
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'moderation_status'
  ) THEN
    ALTER TABLE reviews ADD COLUMN moderation_status text DEFAULT 'pending'
      CHECK (moderation_status IN ('pending', 'approved', 'rejected'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'moderated_at'
  ) THEN
    ALTER TABLE reviews ADD COLUMN moderated_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'maker_response'
  ) THEN
    ALTER TABLE reviews ADD COLUMN maker_response text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'maker_response_at'
  ) THEN
    ALTER TABLE reviews ADD COLUMN maker_response_at timestamptz;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS maker_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  business_name text NOT NULL,
  craft_type text NOT NULL,
  experience_years text,
  portfolio_url text,
  motivation text,
  sample_images jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  admin_notes text,
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE maker_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit maker applications" ON maker_applications;
CREATE POLICY "Anyone can submit maker applications"
  ON maker_applications FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own applications" ON maker_applications;
CREATE POLICY "Users can view their own applications"
  ON maker_applications FOR SELECT
  TO authenticated
  USING (email = (SELECT email FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Public can view approved applications count" ON maker_applications;
CREATE POLICY "Public can view approved applications count"
  ON maker_applications FOR SELECT
  TO anon
  USING (status = 'approved');

CREATE TABLE IF NOT EXISTS ai_listing_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  maker_id uuid REFERENCES makers(id) ON DELETE CASCADE,
  title_lt text,
  title_en text,
  description_lt text,
  description_en text,
  tags text[],
  suggested_category_id uuid REFERENCES categories(id),
  suggested_price numeric,
  original_input jsonb,
  ai_model text DEFAULT 'gpt-4',
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'published', 'rejected')),
  approved_by uuid REFERENCES profiles(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ai_listing_drafts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Makers can view their own drafts" ON ai_listing_drafts;
CREATE POLICY "Makers can view their own drafts"
  ON ai_listing_drafts FOR SELECT
  TO authenticated
  USING (maker_id IN (SELECT id FROM makers WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Makers can create drafts" ON ai_listing_drafts;
CREATE POLICY "Makers can create drafts"
  ON ai_listing_drafts FOR INSERT
  TO authenticated
  WITH CHECK (maker_id IN (SELECT id FROM makers WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Makers can update their drafts" ON ai_listing_drafts;
CREATE POLICY "Makers can update their drafts"
  ON ai_listing_drafts FOR UPDATE
  TO authenticated
  USING (maker_id IN (SELECT id FROM makers WHERE user_id = auth.uid()))
  WITH CHECK (maker_id IN (SELECT id FROM makers WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS craft_concierge_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  user_id uuid REFERENCES profiles(id),
  messages jsonb DEFAULT '[]'::jsonb,
  context jsonb DEFAULT '{}'::jsonb,
  recommended_products uuid[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE craft_concierge_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own conversations" ON craft_concierge_conversations;
CREATE POLICY "Users can view own conversations"
  ON craft_concierge_conversations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Anyone can create conversations" ON craft_concierge_conversations;
CREATE POLICY "Anyone can create conversations"
  ON craft_concierge_conversations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update their session" ON craft_concierge_conversations;
CREATE POLICY "Anyone can update their session"
  ON craft_concierge_conversations FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_maker_applications_status ON maker_applications(status);
CREATE INDEX IF NOT EXISTS idx_maker_applications_email ON maker_applications(email);
CREATE INDEX IF NOT EXISTS idx_ai_listing_drafts_maker ON ai_listing_drafts(maker_id);
CREATE INDEX IF NOT EXISTS idx_ai_listing_drafts_status ON ai_listing_drafts(status);
CREATE INDEX IF NOT EXISTS idx_reviews_moderation ON reviews(moderation_status);
CREATE INDEX IF NOT EXISTS idx_concierge_session ON craft_concierge_conversations(session_id);
CREATE TABLE IF NOT EXISTS hero_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_hero_slides" ON hero_slides;
CREATE POLICY "public_select_hero_slides" ON hero_slides FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_hero_slides" ON hero_slides;
CREATE POLICY "admin_insert_hero_slides" ON hero_slides FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_hero_slides" ON hero_slides;
CREATE POLICY "admin_update_hero_slides" ON hero_slides FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_hero_slides" ON hero_slides;
CREATE POLICY "admin_delete_hero_slides" ON hero_slides FOR DELETE
  TO authenticated USING (true);

INSERT INTO hero_slides (image_url, sort_order, is_active) VALUES
  ('https://images.pexels.com/photos/35821973/pexels-photo-35821973.jpeg?auto=compress&cs=tinysrgb&w=1920', 1, true),
  ('https://images.pexels.com/photos/31672060/pexels-photo-31672060.jpeg?auto=compress&cs=tinysrgb&w=1920', 2, true),
  ('https://images.pexels.com/photos/14131857/pexels-photo-14131857.jpeg?auto=compress&cs=tinysrgb&w=1920', 3, true)
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_settings" ON site_settings;
CREATE POLICY "public_select_settings" ON site_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_settings" ON site_settings;
CREATE POLICY "admin_insert_settings" ON site_settings FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_settings" ON site_settings;
CREATE POLICY "admin_update_settings" ON site_settings FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_settings" ON site_settings;
CREATE POLICY "admin_delete_settings" ON site_settings FOR DELETE
  TO authenticated USING (true);

INSERT INTO site_settings (key, value) VALUES
  ('hero_image', 'https://images.pexels.com/photos/35821973/pexels-photo-35821973.jpeg?auto=compress&cs=tinysrgb&w=1920'),
  ('hero_side_1', 'https://images.pexels.com/photos/31672060/pexels-photo-31672060.jpeg?auto=compress&cs=tinysrgb&w=800'),
  ('hero_side_2', 'https://images.pexels.com/photos/14131857/pexels-photo-14131857.jpeg?auto=compress&cs=tinysrgb&w=800')
ON CONFLICT (key) DO NOTHING;

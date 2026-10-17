/*
# Add brand_logo setting to site_settings

1. Inserts a default brand_logo key into site_settings if it doesn't exist.
2. No new tables needed — uses existing site_settings key-value table.
*/

INSERT INTO site_settings (key, value, updated_at)
SELECT 'brand_logo', '', now()
WHERE NOT EXISTS (
  SELECT 1 FROM site_settings WHERE key = 'brand_logo'
);

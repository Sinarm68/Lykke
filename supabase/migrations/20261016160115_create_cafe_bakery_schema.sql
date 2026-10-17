/*
# Café & Bakery — categories, products, and admin auth

## Purpose
A café/bakery website with ~40 drinks (hot/cold, coffee/non-coffee) and ~50
pastries (cakes, cookies, baklava, etc.), each organized into categories.
An admin signs in to manage (CRUD) categories and products from the site.

## 1. New Tables

### categories
- `id` (uuid, PK)
- `name` (text, not null) — English/internal slug-style name
- `name_fa` (text, not null) — Persian display name
- `type` (text, not null, check in 'drink','bakery') — top-level grouping
- `sort_order` (int, default 0)
- `icon` (text, nullable) — optional emoji or icon key
- `created_at` (timestamptz)

### products
- `id` (uuid, PK)
- `category_id` (uuid, FK → categories.id ON DELETE CASCADE)
- `name` (text, not null) — Persian/product display name
- `description` (text, nullable)
- `price` (numeric(10,2), not null) — in Toman
- `image_url` (text, nullable)
- `is_available` (boolean, default true)
- `sort_order` (int, default 0)
- `tags` (text[], default '{}') — e.g. {'popular','new','vegan'}
- `created_at` (timestamptz)

## 2. Security (RLS)
- Both tables have RLS enabled.
- SELECT is public (anon + authenticated) so visitors can browse the menu.
- INSERT/UPDATE/DELETE are restricted to authenticated admins (ownership is
  implicit: any signed-in admin can manage — this is a single-admin café site).

## 3. Notes
- Index on products.category_id for menu filtering.
- Seed data inserted after table creation.
*/

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_fa text NOT NULL,
  type text NOT NULL CHECK (type IN ('drink','bakery')),
  sort_order int NOT NULL DEFAULT 0,
  icon text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  image_url text,
  is_available boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- categories: public read, admin write
DROP POLICY IF EXISTS "public_select_categories" ON categories;
CREATE POLICY "public_select_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_categories" ON categories;
CREATE POLICY "admin_insert_categories" ON categories FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_categories" ON categories;
CREATE POLICY "admin_update_categories" ON categories FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_categories" ON categories;
CREATE POLICY "admin_delete_categories" ON categories FOR DELETE
  TO authenticated USING (true);

-- products: public read, admin write
DROP POLICY IF EXISTS "public_select_products" ON products;
CREATE POLICY "public_select_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_products" ON products;
CREATE POLICY "admin_insert_products" ON products FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_products" ON products;
CREATE POLICY "admin_update_products" ON products FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_products" ON products;
CREATE POLICY "admin_delete_products" ON products FOR DELETE
  TO authenticated USING (true);

-- Seed: Drink categories
INSERT INTO categories (name, name_fa, type, sort_order, icon) VALUES
  ('hot-coffee', 'قهوه گرم', 'drink', 1, '☕'),
  ('cold-coffee', 'قهوه سرد', 'drink', 2, '🧊'),
  ('hot-non-coffee', 'بدون قهوه گرم', 'drink', 3, '🍵'),
  ('cold-non-coffee', 'بدون قهوه سرد', 'drink', 4, '🥤'),
  ('tea', 'دمنوش و چای', 'drink', 5, '🌿'),
  ('breakfast', 'صبحانه', 'drink', 6, '🍳')
ON CONFLICT DO NOTHING;

-- Seed: Bakery categories
INSERT INTO categories (name, name_fa, type, sort_order, icon) VALUES
  ('cakes', 'کیک', 'bakery', 1, '🍰'),
  ('cookies', 'کوکی', 'bakery', 2, '🍪'),
  ('pastries', 'شیرینی', 'bakery', 3, '🥐'),
  ('baklava', 'باقلوا', 'bakery', 4, '🟫'),
  ('traditional', 'شیرینی سنتی', 'bakery', 5, '🮰'),
  ('breads', 'نان', 'bakery', 6, '🥖')
ON CONFLICT DO NOTHING;

-- Seed: Drink products (sample across categories)
INSERT INTO products (category_id, name, description, price, sort_order, tags, image_url) VALUES
  ((SELECT id FROM categories WHERE name='hot-coffee' LIMIT 1), 'اسپرسو', 'قهوه خالص ایتالیایی با crema غنی', 55000, 1, ARRAY['popular'], NULL),
  ((SELECT id FROM categories WHERE name='hot-coffee' LIMIT 1), 'اسپرسو دوپلو', 'دو شات اسپرسو برای کافئین بیشتر', 65000, 2, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='hot-coffee' LIMIT 1), 'آمریکانو', 'اسپرسو با آب داغ، ملایم و خوش‌طعم', 60000, 3, ARRAY['popular'], NULL),
  ((SELECT id FROM categories WHERE name='hot-coffee' LIMIT 1), 'کاپوچینو', 'اسپرسو با شیر بخارپز و فوم مخملی', 75000, 4, ARRAY['popular'], NULL),
  ((SELECT id FROM categories WHERE name='hot-coffee' LIMIT 1), 'لاته', 'اسپرسو با شیر فراوان و لاته‌آرت', 80000, 5, ARRAY['popular'], NULL),
  ((SELECT id FROM categories WHERE name='hot-coffee' LIMIT 1), 'فلت وایت', 'ریسترو با میکروفوم نرم', 78000, 6, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='hot-coffee' LIMIT 1), 'ماکیاتو', 'اسپرسو با لکه فوم شیر', 62000, 7, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='hot-coffee' LIMIT 1), 'موکا', 'اسپرسو با شکلات و شیر بخارپز', 85000, 8, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='hot-coffee' LIMIT 1), 'افوگاتو', 'بستنی وانیلی روی شات اسپرسو', 90000, 9, ARRAY['new'], NULL),
  ((SELECT id FROM categories WHERE name='cold-coffee' LIMIT 1), 'آیس آمریکانو', 'اسپرسو سرد با یخ و آب', 70000, 1, ARRAY['popular'], NULL),
  ((SELECT id FROM categories WHERE name='cold-coffee' LIMIT 1), 'آیس لاته', 'اسپرسو سرد با شیر و یخ', 85000, 2, ARRAY['popular'], NULL),
  ((SELECT id FROM categories WHERE name='cold-coffee' LIMIT 1), 'آیس موکا', 'موکا سرد با شکلات و یخ', 90000, 3, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='cold-coffee' LIMIT 1), 'کولد برو', 'دم‌سرد ۱۸ ساعته، نرم و کم‌اسیدی', 95000, 4, ARRAY['new','popular'], NULL),
  ((SELECT id FROM categories WHERE name='cold-coffee' LIMIT 1), 'فراپه کارامل', 'قهوه سرد با کارامل و خامه', 100000, 5, ARRAY['popular'], NULL),
  ((SELECT id FROM categories WHERE name='cold-coffee' LIMIT 1), 'افوگاتو سرد', 'بستنی وانیلی با شات اسپرسو سرد', 95000, 6, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='cold-coffee' LIMIT 1), 'آیس اسپرسو تونیک', 'اسپرسو با تونیک و یخ، طراوت خاص', 110000, 7, ARRAY['new'], NULL),
  ((SELECT id FROM categories WHERE name='hot-non-coffee' LIMIT 1), 'هات چاکلت', 'شکلات داغ غنی با خامه', 85000, 1, ARRAY['popular'], NULL),
  ((SELECT id FROM categories WHERE name='hot-non-coffee' LIMIT 1), 'وایت موکا', 'شکلات سفید داغ با شیر', 88000, 2, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='hot-non-coffee' LIMIT 1), 'شیر عسل', 'شیر داغ با عسل طبیعی و دارچین', 70000, 3, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='hot-non-coffee' LIMIT 1), 'ماسالا چای', 'چای ادویه‌ای هندی با شیر', 65000, 4, ARRAY['new'], NULL),
  ((SELECT id FROM categories WHERE name='hot-non-coffee' LIMIT 1), 'لاته زعفرانی', 'شیر بخارپز با زعفران ایرانی', 80000, 5, ARRAY['popular'], NULL),
  ((SELECT id FROM categories WHERE name='hot-non-coffee' LIMIT 1), 'هات لیمون', 'آب لیمو داغ با عسل', 55000, 6, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='hot-non-coffee' LIMIT 1), 'تورمریک لاته', 'لاته زردچوبه با فلفل سیاه', 78000, 7, ARRAY['new'], NULL),
  ((SELECT id FROM categories WHERE name='cold-non-coffee' LIMIT 1), 'آیس چاکلت', 'شکلات سرد با شیر و یخ', 85000, 1, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='cold-non-coffee' LIMIT 1), 'میلک‌شیک وانیل', 'شیک وانیلی با بستنی', 95000, 2, ARRAY['popular'], NULL),
  ((SELECT id FROM categories WHERE name='cold-non-coffee' LIMIT 1), 'میلک‌شیک شکلات', 'شیک شکلاتی با بستنی', 95000, 3, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='cold-non-coffee' LIMIT 1), 'اسموتی توت', 'اسموتی توت فرنگی و بلوبری', 100000, 4, ARRAY['new'], NULL),
  ((SELECT id FROM categories WHERE name='cold-non-coffee' LIMIT 1), 'اسموتی موز', 'اسموتی موز و بادام‌زمینی', 95000, 5, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='cold-non-coffee' LIMIT 1), 'لیموناد', 'آب لیمو ترش با نعنا', 60000, 6, ARRAY['popular'], NULL),
  ((SELECT id FROM categories WHERE name='cold-non-coffee' LIMIT 1), 'آیس چای', 'چای سرد با لیمو و یخ', 55000, 7, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='cold-non-coffee' LIMIT 1), 'موخیتو', 'نوشیدنی نعنا و لیمو بدون الکل', 70000, 8, ARRAY['new'], NULL),
  ((SELECT id FROM categories WHERE name='tea' LIMIT 1), 'چای سیاه', 'چای دم‌کشیده سنتی', 40000, 1, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='tea' LIMIT 1), 'دمنوش بهارنارنج', 'دمنوش آرام‌بخش بهارنارنج', 50000, 2, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='tea' LIMIT 1), 'دمنوش بابونه', 'دمنوش بابونه آرام‌بخش', 50000, 3, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='tea' LIMIT 1), 'چای ماسالا', 'چای ادویه‌ای با شیر', 60000, 4, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='tea' LIMIT 1), 'دمنوش زعفران', 'دمنوش زعفران و هل', 65000, 5, ARRAY['new'], NULL),
  ((SELECT id FROM categories WHERE name='tea' LIMIT 1), 'چای ترش', 'دمنوش هیبیسکوس خنک', 55000, 6, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='breakfast' LIMIT 1), 'گرانولا با ماست', 'گرانولای خانگی با ماست و عسل', 120000, 1, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='breakfast' LIMIT 1), 'املت قارچ', 'املت قارچ و پنیر با نان تست', 130000, 2, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='breakfast' LIMIT 1), 'کرپ نوتلا', 'کرپ با نوتلا و موز', 140000, 3, ARRAY['popular'], NULL)
ON CONFLICT DO NOTHING;

-- Seed: Bakery products
INSERT INTO products (category_id, name, description, price, sort_order, tags, image_url) VALUES
  ((SELECT id FROM categories WHERE name='cakes' LIMIT 1), 'کیک شکلاتی', 'کیک سه لایه شکلاتی با گاناش', 180000, 1, ARRAY['popular'], NULL),
  ((SELECT id FROM categories WHERE name='cakes' LIMIT 1), 'کیک وانیلی', 'کیک وانیلی نرم با کرم کره', 160000, 2, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='cakes' LIMIT 1), 'کیک سرمی', 'کیک سنتی سرمی ایرانی', 170000, 3, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='cakes' LIMIT 1), 'کیک هویج', 'کیک هویج با گردو و دارچین', 175000, 4, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='cakes' LIMIT 1), 'چیزکیک نیویورکی', 'چیزکیک کلاسیک با سس میوه', 220000, 5, ARRAY['popular'], NULL),
  ((SELECT id FROM categories WHERE name='cakes' LIMIT 1), 'چیزکیک شکلاتی', 'چیزکیک با لایه شکلات', 230000, 6, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='cakes' LIMIT 1), 'کیک لیمویی', 'کیک ترش لیمویی با گلیز', 165000, 7, ARRAY['new'], NULL),
  ((SELECT id FROM categories WHERE name='cakes' LIMIT 1), 'کیک طاووسی', 'کیک طاووسی رنگارنگ با کرم', 200000, 8, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='cookies' LIMIT 1), 'کوکی شکلاتی', 'کوکی ترد با چیپس شکلات', 45000, 1, ARRAY['popular'], NULL),
  ((SELECT id FROM categories WHERE name='cookies' LIMIT 1), 'کوکی وانیلی', 'کوکی وانیلی کلاسیک', 42000, 2, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='cookies' LIMIT 1), 'کوکی جو دوسر', 'کوکی جو دوسر و کشمش', 48000, 3, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='cookies' LIMIT 1), 'کوکی بادام', 'کوکی ترد با پودر بادام', 50000, 4, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='cookies' LIMIT 1), 'کوکی کره‌ای', 'کوکی کره‌ای آب‌شده', 46000, 5, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='cookies' LIMIT 1), 'کوکی سندیس', 'کوکی شنی نرم با خامه', 52000, 6, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='cookies' LIMIT 1), 'کوکی پسته‌ای', 'کوکی با پسته ایرانی', 58000, 7, ARRAY['new'], NULL),
  ((SELECT id FROM categories WHERE name='cookies' LIMIT 1), 'کوکی دو رنگ', 'کوکی وانیلی و شکلاتی', 44000, 8, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='pastries' LIMIT 1), 'کراسان کره', 'کراسان فرانسوی با کره', 65000, 1, ARRAY['popular'], NULL),
  ((SELECT id FROM categories WHERE name='pastries' LIMIT 1), 'کراسان شکلاتی', 'کراسان با پر stuffing شکلات', 70000, 2, ARRAY['popular'], NULL),
  ((SELECT id FROM categories WHERE name='pastries' LIMIT 1), 'کراسان پسته‌ای', 'کراسان با کرم پسته', 75000, 3, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='pastries' LIMIT 1), 'دانیش با شکلات', 'دانیش ترد با شکلات', 60000, 4, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='pastries' LIMIT 1), 'اکلر کافه', 'اکلر با کرم کافه', 80000, 5, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='pastries' LIMIT 1), 'اکلر شکلاتی', 'اکلر با کرم وانیل و شکلات', 80000, 6, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='pastries' LIMIT 1), 'ماکارون (۶ تایی)', 'ماکارون فرانسوی رنگارنگ', 120000, 7, ARRAY['new'], NULL),
  ((SELECT id FROM categories WHERE name='pastries' LIMIT 1), 'تارت میوه', 'تارت با کرم پاتیسیری و میوه تازه', 95000, 8, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='pastries' LIMIT 1), 'ناپoleon', 'لایه‌ای با کرم وانیل', 110000, 9, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='baklava' LIMIT 1), 'باقلوا پسته‌ای', 'باقلوی سنتی با پسته', 90000, 1, ARRAY['popular'], NULL),
  ((SELECT id FROM categories WHERE name='baklava' LIMIT 1), 'باقلوا بادامی', 'باقلو با بادام و عسل', 85000, 2, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='baklava' LIMIT 1), 'باقلوا مخلوط', 'باقلو با پسته و بادام', 95000, 3, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='baklava' LIMIT 1), 'باقلوا لقمه‌ای', 'باقلو لقمه‌ای با پسته', 70000, 4, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='baklava' LIMIT 1), 'باکلوا گردویی', 'باقلو با گردو و دارچین', 75000, 5, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='baklava' LIMIT 1), 'کنفید پسته', 'کنفید پسته‌ای سنتی', 100000, 6, ARRAY['new'], NULL),
  ((SELECT id FROM categories WHERE name='traditional' LIMIT 1), 'سوهان اصلی قم', 'سوهان کرکی با زعفران و پسته', 130000, 1, ARRAY['popular'], NULL),
  ((SELECT id FROM categories WHERE name='traditional' LIMIT 1), 'گز اصفهان', 'گز ناب با پسته و مغز', 120000, 2, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='traditional' LIMIT 1), 'نبات زعفرانی', 'نبات زعفرانی در حلقه', 80000, 3, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='traditional' LIMIT 1), 'کلوچه', 'کلوچه سنتی کرمان', 60000, 4, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='traditional' LIMIT 1), 'نان برنجی', 'نان برنجی سنتی', 70000, 5, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='traditional' LIMIT 1), 'حلیم ارده', 'حلیم ارده و مغز', 95000, 6, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='traditional' LIMIT 1), 'قوت', 'قوت سنتی با پسته و گل', 110000, 7, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='traditional' LIMIT 1), 'شیرینی زنجفیلی', 'شیرینی زنجفیلی نرم', 65000, 8, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='traditional' LIMIT 1), 'باقوا', 'باقوا شرقی با مغز و عسل', 140000, 9, ARRAY['new'], NULL),
  ((SELECT id FROM categories WHERE name='traditional' LIMIT 1), 'کاکاویی', 'شیرینی کاکاویی خانگی', 70000, 10, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='breads' LIMIT 1), 'نان بربری', 'نان بربری تازه', 45000, 1, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='breads' LIMIT 1), 'نان سنگک', 'نان سنگک روغنی', 40000, 2, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='breads' LIMIT 1), 'نان باگت', 'باگت فرانسوی تازه', 50000, 3, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='breads' LIMIT 1), 'نان تافتون', 'تافتون سنتی', 38000, 4, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='breads' LIMIT 1), 'سنگک کره‌ای', 'سنگک با کره و کنجد', 55000, 5, ARRAY[]::text[], NULL),
  ((SELECT id FROM categories WHERE name='breads' LIMIT 1), 'نان جو', 'نان جو سبوس‌دار', 48000, 6, ARRAY[]::text[], NULL)
ON CONFLICT DO NOTHING;
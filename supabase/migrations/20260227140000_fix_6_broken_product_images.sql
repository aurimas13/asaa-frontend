-- Fix 6 product images: use Supabase Storage self-hosted images
-- Also add 3 missing products (Easter eggs + Handcrafted Cutting Board)

-- 1. Wooden Spoon Collection
UPDATE products SET images = '["https://adtzxfiurwefcjhzdrjx.supabase.co/storage/v1/object/public/product-images/wooden-spoon-collection.jpg"]'
WHERE title = 'Wooden Spoon Collection';

-- 2. Handcarved Cutting Board
UPDATE products SET images = '["https://adtzxfiurwefcjhzdrjx.supabase.co/storage/v1/object/public/product-images/handcarved-cutting-board.jpg"]'
WHERE title = 'Handcarved Cutting Board';

-- 3. Linen Kitchen Towels Set
UPDATE products SET images = '["https://adtzxfiurwefcjhzdrjx.supabase.co/storage/v1/object/public/product-images/linen-kitchen-towels-set.jpg"]'
WHERE title = 'Linen Kitchen Towels Set';

-- 4. Traditional Decorated Easter Egg (insert if missing)
INSERT INTO products (maker_id, category_id, title, title_lt, title_fr, description, description_lt, description_fr, price, images, stock_quantity, status, featured, shipping_time)
SELECT
  m.id, c.id,
  'Traditional Decorated Easter Egg',
  'Tradicinis margintas Velykų kiaušinis',
  'Oeuf de Pâques décoré traditionnel',
  'Hand-painted traditional Lithuanian Easter egg (margutis) with intricate wax-resist patterns.',
  'Ranka tapytas tradicinis lietuviškas Velykų kiaušinis (margutis) su sudėtingais vaško ornamentais.',
  'Oeuf de Pâques traditionnel lituanien peint à la main avec des motifs complexes à la cire.',
  25.00,
  '["https://adtzxfiurwefcjhzdrjx.supabase.co/storage/v1/object/public/product-images/traditional-decorated-easter-egg.jpg"]',
  20, 'active', false, '3-5 business days'
FROM makers m, categories c
WHERE m.business_name = 'Senuju amatu dirbtuves' AND c.slug = 'multi-craft'
AND NOT EXISTS (SELECT 1 FROM products WHERE title = 'Traditional Decorated Easter Egg');

-- 5. Decorated Easter Egg Collection (insert if missing)
INSERT INTO products (maker_id, category_id, title, title_lt, title_fr, description, description_lt, description_fr, price, images, stock_quantity, status, featured, shipping_time)
SELECT
  m.id, c.id,
  'Decorated Easter Egg Collection',
  'Margintų Velykų kiaušinių kolekcija',
  'Collection d oeufs de Pâques décorés',
  'Collection of 6 hand-decorated Lithuanian Easter eggs with traditional wax-resist and natural dye patterns.',
  '6 rankomis dekoruotų lietuviškų Velykų kiaušinių kolekcija su tradiciniais vaško ir natūralių dažų ornamentais.',
  'Collection de 6 oeufs de Pâques lituaniens décorés à la main.',
  120.00,
  '["https://adtzxfiurwefcjhzdrjx.supabase.co/storage/v1/object/public/product-images/decorated-easter-egg-collection.jpg"]',
  5, 'active', true, '5-7 business days'
FROM makers m, categories c
WHERE m.business_name = 'Senuju amatu dirbtuves' AND c.slug = 'multi-craft'
AND NOT EXISTS (SELECT 1 FROM products WHERE title = 'Decorated Easter Egg Collection');

-- 6. Handcrafted Wooden Cutting Board (insert if missing)
INSERT INTO products (maker_id, category_id, title, title_lt, title_fr, description, description_lt, description_fr, price, images, stock_quantity, status, featured, shipping_time)
SELECT
  m.id, c.id,
  'Handcrafted Wooden Cutting Board',
  'Rankų darbo medinė pjaustymo lenta',
  'Planche à découper en bois artisanale',
  'Large handcrafted oak cutting board with natural edge and food-safe finish.',
  'Didelė rankomis daryta ąžuolinė pjaustymo lenta su natūraliu kraštu.',
  'Grande planche à découper en chêne artisanale avec bord naturel.',
  75.00,
  '["https://adtzxfiurwefcjhzdrjx.supabase.co/storage/v1/object/public/product-images/handcrafted-wooden-cutting-board.jpg"]',
  8, 'active', false, '5-7 business days'
FROM makers m, categories c
WHERE m.business_name ILIKE '%Kampelis%' AND c.slug = 'woodwork'
AND NOT EXISTS (SELECT 1 FROM products WHERE title = 'Handcrafted Wooden Cutting Board');

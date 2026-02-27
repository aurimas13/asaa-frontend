-- Fix 6 product images: replace Unsplash URLs that don't render with Pexels URLs
-- Also add 3 missing products (Easter eggs + Handcrafted Cutting Board)

-- 1. Wooden Spoon Collection
UPDATE products SET images = '["https://images.pexels.com/photos/350417/pexels-photo-350417.jpeg?auto=compress&cs=tinysrgb&w=800"]'
WHERE title = 'Wooden Spoon Collection';

-- 2. Handcarved Cutting Board
UPDATE products SET images = '["https://images.pexels.com/photos/349609/pexels-photo-349609.jpeg?auto=compress&cs=tinysrgb&w=800"]'
WHERE title = 'Handcarved Cutting Board';

-- 3. Linen Kitchen Towels Set
UPDATE products SET images = '["https://images.pexels.com/photos/6752271/pexels-photo-6752271.jpeg?auto=compress&cs=tinysrgb&w=800"]'
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
  '["https://images.pexels.com/photos/998708/pexels-photo-998708.jpeg?auto=compress&cs=tinysrgb&w=800"]',
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
  '["https://images.pexels.com/photos/6897341/pexels-photo-6897341.jpeg?auto=compress&cs=tinysrgb&w=800"]',
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
  '["https://images.pexels.com/photos/5758784/pexels-photo-5758784.jpeg?auto=compress&cs=tinysrgb&w=800"]',
  8, 'active', false, '5-7 business days'
FROM makers m, categories c
WHERE m.business_name ILIKE '%Kampelis%' AND c.slug = 'woodwork'
AND NOT EXISTS (SELECT 1 FROM products WHERE title = 'Handcrafted Wooden Cutting Board');

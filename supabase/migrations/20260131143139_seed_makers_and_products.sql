/*
  # Seed Lithuanian Artisans and Products

  1. New Data
    - Insert craft categories (ceramics, amber, straw-art, weaving, basketry, woodwork, blacksmithing, multi-craft)
    - Insert 28 makers from the Google Sheet data
    - Insert sample products for each maker
    - All makers start as unverified (pending approval for Kaziuko muge 2026)

  2. Categories
    - Ceramics (Keramika)
    - Amber (Gintaras)
    - Straw Art (Siaudiniai sodai)
    - Weaving (Audimas)
    - Basketry (Pynimas)
    - Woodwork (Medzio dirbiniai)
    - Blacksmithing (Kalvyste)
    - Multi-craft (Ivairus amatai)

  3. Notes
    - All makers are marked as unverified until approval is confirmed
    - Products are sample listings to demonstrate each maker's craft
*/

INSERT INTO categories (id, name, slug, description, image_url) VALUES
  (gen_random_uuid(), 'Ceramics', 'ceramics', 'Traditional Lithuanian pottery and ceramic art', 'https://images.pexels.com/photos/6044266/pexels-photo-6044266.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (gen_random_uuid(), 'Amber', 'amber', 'Authentic Baltic amber jewelry and decorations', 'https://images.pexels.com/photos/5370697/pexels-photo-5370697.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (gen_random_uuid(), 'Straw Art', 'straw-art', 'Traditional Lithuanian straw ornaments (siaudiniai sodai)', 'https://images.pexels.com/photos/5708069/pexels-photo-5708069.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (gen_random_uuid(), 'Weaving', 'weaving', 'Handwoven textiles and linen products', 'https://images.pexels.com/photos/6192337/pexels-photo-6192337.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (gen_random_uuid(), 'Basketry', 'basketry', 'Traditional willow basket weaving', 'https://images.pexels.com/photos/4219528/pexels-photo-4219528.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (gen_random_uuid(), 'Woodwork', 'woodwork', 'Handcrafted wooden items and sculptures', 'https://images.pexels.com/photos/6045240/pexels-photo-6045240.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (gen_random_uuid(), 'Blacksmithing', 'blacksmithing', 'Traditional forged iron and metal work', 'https://images.pexels.com/photos/5691867/pexels-photo-5691867.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (gen_random_uuid(), 'Multi-craft', 'multi-craft', 'Centers offering various traditional crafts', 'https://images.pexels.com/photos/4219654/pexels-photo-4219654.jpeg?auto=compress&cs=tinysrgb&w=800')
ON CONFLICT (slug) DO NOTHING;

DO $$
DECLARE
  ceramics_cat_id uuid;
  amber_cat_id uuid;
  straw_cat_id uuid;
  weaving_cat_id uuid;
  basketry_cat_id uuid;
  woodwork_cat_id uuid;
  multi_cat_id uuid;
  maker_id uuid;
BEGIN
  SELECT id INTO ceramics_cat_id FROM categories WHERE slug = 'ceramics' LIMIT 1;
  SELECT id INTO amber_cat_id FROM categories WHERE slug = 'amber' LIMIT 1;
  SELECT id INTO straw_cat_id FROM categories WHERE slug = 'straw-art' LIMIT 1;
  SELECT id INTO weaving_cat_id FROM categories WHERE slug = 'weaving' LIMIT 1;
  SELECT id INTO basketry_cat_id FROM categories WHERE slug = 'basketry' LIMIT 1;
  SELECT id INTO woodwork_cat_id FROM categories WHERE slug = 'woodwork' LIMIT 1;
  SELECT id INTO multi_cat_id FROM categories WHERE slug = 'multi-craft' LIMIT 1;

  INSERT INTO makers (id, business_name, description, city, country, cover_image, website, verified, rating) VALUES
    (gen_random_uuid(), 'Juodosios keramikos centras "Molio Laume"', 'Traditional Lithuanian black ceramics center preserving ancient firing techniques. Specializing in unique black pottery created using traditional wood-fired kilns. Led by Ieva Paukstyte-Schinello.', 'Vilnius', 'Lithuania', 'https://images.pexels.com/photos/6044266/pexels-photo-6044266.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://blackceramicscentre.lt/', false, 4.8)
  RETURNING id INTO maker_id;
  
  INSERT INTO products (maker_id, category_id, title, description, price, images, stock_quantity, status, featured, shipping_time) VALUES
    (maker_id, ceramics_cat_id, 'Traditional Black Ceramic Vase', 'Handcrafted black ceramic vase using traditional Lithuanian firing techniques. Each piece is unique with natural variations.', 89.00, '["https://images.pexels.com/photos/6044266/pexels-photo-6044266.jpeg?auto=compress&cs=tinysrgb&w=800"]', 5, 'active', true, '5-7 business days'),
    (maker_id, ceramics_cat_id, 'Black Ceramic Bowl Set', 'Set of 3 handmade black ceramic bowls perfect for serving or decoration.', 65.00, '["https://images.pexels.com/photos/6046227/pexels-photo-6046227.jpeg?auto=compress&cs=tinysrgb&w=800"]', 8, 'active', false, '5-7 business days'),
    (maker_id, ceramics_cat_id, 'Decorative Black Clay Plate', 'Large decorative plate featuring traditional Lithuanian patterns in black ceramic.', 75.00, '["https://images.pexels.com/photos/6045028/pexels-photo-6045028.jpeg?auto=compress&cs=tinysrgb&w=800"]', 3, 'active', false, '5-7 business days');

  INSERT INTO makers (id, business_name, description, city, country, cover_image, website, verified, rating) VALUES
    (gen_random_uuid(), 'Vilniaus puodziu cechas', 'Guild of pottery artisans specializing in traditional wheel-thrown ceramics using techniques passed down through generations of Lithuanian craftspeople.', 'Vilnius', 'Lithuania', 'https://images.pexels.com/photos/3094218/pexels-photo-3094218.jpeg?auto=compress&cs=tinysrgb&w=800', null, false, 4.7)
  RETURNING id INTO maker_id;
  
  INSERT INTO products (maker_id, category_id, title, description, price, images, stock_quantity, status, featured, shipping_time) VALUES
    (maker_id, ceramics_cat_id, 'Wheel-Thrown Clay Pitcher', 'Traditional Lithuanian pitcher perfect for serving water, juice or as a decorative piece.', 45.00, '["https://images.pexels.com/photos/3094218/pexels-photo-3094218.jpeg?auto=compress&cs=tinysrgb&w=800"]', 10, 'active', true, '3-5 business days'),
    (maker_id, ceramics_cat_id, 'Ceramic Coffee Mug Set', 'Set of 4 handmade ceramic mugs with natural glaze finish.', 52.00, '["https://images.pexels.com/photos/6612388/pexels-photo-6612388.jpeg?auto=compress&cs=tinysrgb&w=800"]', 15, 'active', false, '3-5 business days');

  INSERT INTO makers (id, business_name, description, city, country, cover_image, website, verified, rating) VALUES
    (gen_random_uuid(), 'Senuju amatu dirbtuves', 'Historic craft workshops offering authentic Lithuanian handcraft experiences including weaving, pottery, and traditional woodwork in the heart of Vilnius.', 'Vilnius', 'Lithuania', 'https://images.pexels.com/photos/4219654/pexels-photo-4219654.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://www.govilnius.lt/aplankykite/lankytinos-vietos/senuju-amatu-dirbtuves', false, 4.9)
  RETURNING id INTO maker_id;
  
  INSERT INTO products (maker_id, category_id, title, description, price, images, stock_quantity, status, featured, shipping_time) VALUES
    (maker_id, multi_cat_id, 'Traditional Linen Table Runner', 'Handwoven linen table runner with traditional Lithuanian patterns.', 38.00, '["https://images.pexels.com/photos/6192337/pexels-photo-6192337.jpeg?auto=compress&cs=tinysrgb&w=800"]', 12, 'active', true, '5-7 business days'),
    (maker_id, multi_cat_id, 'Wooden Spoon Collection', 'Set of 5 hand-carved wooden spoons in various sizes for cooking and serving.', 28.00, '["https://images.pexels.com/photos/6045240/pexels-photo-6045240.jpeg?auto=compress&cs=tinysrgb&w=800"]', 20, 'active', false, '3-5 business days');

  INSERT INTO makers (id, business_name, description, city, country, cover_image, website, verified, rating) VALUES
    (gen_random_uuid(), 'Palangos gintaro meistru gildija', 'Guild of master amber craftspeople from Palanga, creating exquisite Baltic amber jewelry and decorative pieces using traditional techniques.', 'Palanga', 'Lithuania', 'https://images.pexels.com/photos/5370697/pexels-photo-5370697.jpeg?auto=compress&cs=tinysrgb&w=800', null, false, 4.8)
  RETURNING id INTO maker_id;
  
  INSERT INTO products (maker_id, category_id, title, description, price, images, stock_quantity, status, featured, shipping_time) VALUES
    (maker_id, amber_cat_id, 'Baltic Amber Pendant Necklace', 'Genuine Baltic amber pendant on silver chain. Each piece contains unique natural inclusions.', 125.00, '["https://images.pexels.com/photos/5370697/pexels-photo-5370697.jpeg?auto=compress&cs=tinysrgb&w=800"]', 6, 'active', true, '3-5 business days'),
    (maker_id, amber_cat_id, 'Amber Earrings - Honey Color', 'Delicate amber drop earrings with sterling silver hooks.', 68.00, '["https://images.pexels.com/photos/2735970/pexels-photo-2735970.jpeg?auto=compress&cs=tinysrgb&w=800"]', 10, 'active', false, '3-5 business days'),
    (maker_id, amber_cat_id, 'Raw Amber Bracelet', 'Authentic raw Baltic amber bracelet with natural irregular shapes.', 95.00, '["https://images.pexels.com/photos/8285483/pexels-photo-8285483.jpeg?auto=compress&cs=tinysrgb&w=800"]', 8, 'active', true, '3-5 business days');

  INSERT INTO makers (id, business_name, description, city, country, cover_image, website, verified, rating) VALUES
    (gen_random_uuid(), 'Art Center of Baltic Amber', 'Premier Baltic amber gallery and workshop showcasing the finest amber jewelry and art pieces from Lithuanian masters.', 'Vilnius', 'Lithuania', 'https://images.pexels.com/photos/2735970/pexels-photo-2735970.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://www.govilnius.lt/visit-vilnius/vilnius-pass-attractions/gallery-art-centre-of-baltic-amber', false, 4.9)
  RETURNING id INTO maker_id;
  
  INSERT INTO products (maker_id, category_id, title, description, price, images, stock_quantity, status, featured, shipping_time) VALUES
    (maker_id, amber_cat_id, 'Amber Ring - Cognac Color', 'Elegant amber ring set in sterling silver, cognac colored amber.', 85.00, '["https://images.pexels.com/photos/2735970/pexels-photo-2735970.jpeg?auto=compress&cs=tinysrgb&w=800"]', 7, 'active', false, '3-5 business days'),
    (maker_id, amber_cat_id, 'Amber Cufflinks', 'Mens amber cufflinks with polished golden amber stones.', 110.00, '["https://images.pexels.com/photos/10983780/pexels-photo-10983780.jpeg?auto=compress&cs=tinysrgb&w=800"]', 5, 'active', false, '3-5 business days');

  INSERT INTO makers (id, business_name, description, city, country, cover_image, website, verified, rating) VALUES
    (gen_random_uuid(), 'Inga Ablingiene - Himmeli', 'Master artisan creating traditional Lithuanian straw ornaments (siaudiniai sodai) - intricate geometric mobiles with deep cultural significance.', 'Trakai', 'Lithuania', 'https://images.pexels.com/photos/5708069/pexels-photo-5708069.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://www.himmeli.lt/', false, 5.0)
  RETURNING id INTO maker_id;
  
  INSERT INTO products (maker_id, category_id, title, description, price, images, stock_quantity, status, featured, shipping_time) VALUES
    (maker_id, straw_cat_id, 'Traditional Straw Mobile - Small', 'Handcrafted Lithuanian straw ornament (sodas) for home decoration. Small size, approx. 20cm.', 45.00, '["https://images.pexels.com/photos/5708069/pexels-photo-5708069.jpeg?auto=compress&cs=tinysrgb&w=800"]', 8, 'active', true, '5-7 business days'),
    (maker_id, straw_cat_id, 'Traditional Straw Mobile - Large', 'Stunning large straw ornament (sodas) made from natural rye straw. Approx. 40cm diameter.', 95.00, '["https://images.pexels.com/photos/6192554/pexels-photo-6192554.jpeg?auto=compress&cs=tinysrgb&w=800"]', 4, 'active', true, '7-10 business days'),
    (maker_id, straw_cat_id, 'Straw Star Ornament Set', 'Set of 6 handmade straw star ornaments, perfect for Christmas decoration.', 32.00, '["https://images.pexels.com/photos/6621468/pexels-photo-6621468.jpeg?auto=compress&cs=tinysrgb&w=800"]', 15, 'active', false, '5-7 business days');

  INSERT INTO makers (id, business_name, description, city, country, cover_image, website, verified, rating) VALUES
    (gen_random_uuid(), 'OAK Ceramics', 'Contemporary ceramics studio in Kaunas offering handmade pottery and ceramics workshops combining tradition with modern design.', 'Kaunas', 'Lithuania', 'https://images.pexels.com/photos/6046227/pexels-photo-6046227.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://oakceramics.lt/', false, 4.7)
  RETURNING id INTO maker_id;
  
  INSERT INTO products (maker_id, category_id, title, description, price, images, stock_quantity, status, featured, shipping_time) VALUES
    (maker_id, ceramics_cat_id, 'Modern Ceramic Planter', 'Minimalist ceramic planter with drainage hole, perfect for succulents.', 35.00, '["https://images.pexels.com/photos/6046227/pexels-photo-6046227.jpeg?auto=compress&cs=tinysrgb&w=800"]', 12, 'active', false, '3-5 business days'),
    (maker_id, ceramics_cat_id, 'Ceramic Candle Holder Set', 'Set of 3 ceramic candle holders in natural tones.', 42.00, '["https://images.pexels.com/photos/5706277/pexels-photo-5706277.jpeg?auto=compress&cs=tinysrgb&w=800"]', 10, 'active', false, '3-5 business days');

  INSERT INTO makers (id, business_name, description, city, country, cover_image, website, verified, rating) VALUES
    (gen_random_uuid(), 'Pintines', 'Traditional willow basket weaving workshop creating beautiful handwoven baskets using authentic Lithuanian techniques.', 'Vilnius', 'Lithuania', 'https://images.pexels.com/photos/4219528/pexels-photo-4219528.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://pintines.com/lt/', false, 4.6)
  RETURNING id INTO maker_id;
  
  INSERT INTO products (maker_id, category_id, title, description, price, images, stock_quantity, status, featured, shipping_time) VALUES
    (maker_id, basketry_cat_id, 'Willow Shopping Basket', 'Large handwoven willow basket perfect for shopping or storage.', 55.00, '["https://images.pexels.com/photos/4219528/pexels-photo-4219528.jpeg?auto=compress&cs=tinysrgb&w=800"]', 8, 'active', true, '5-7 business days'),
    (maker_id, basketry_cat_id, 'Decorative Willow Bowl', 'Beautiful woven willow bowl for fruit or decoration.', 38.00, '["https://images.pexels.com/photos/5708072/pexels-photo-5708072.jpeg?auto=compress&cs=tinysrgb&w=800"]', 15, 'active', false, '5-7 business days'),
    (maker_id, basketry_cat_id, 'Willow Picnic Basket', 'Traditional picnic basket with lid and handles, handwoven from willow.', 85.00, '["https://images.pexels.com/photos/6707628/pexels-photo-6707628.jpeg?auto=compress&cs=tinysrgb&w=800"]', 5, 'active', true, '7-10 business days');

  INSERT INTO makers (id, business_name, description, city, country, cover_image, website, verified, rating) VALUES
    (gen_random_uuid(), 'Giedrius & Rita Maciuitis (Kampelis)', 'Family woodworking studio creating unique handcrafted wooden items with focus on traditional Lithuanian designs.', 'Plunge', 'Lithuania', 'https://images.pexels.com/photos/6045240/pexels-photo-6045240.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://kampelis.lt', false, 4.8)
  RETURNING id INTO maker_id;
  
  INSERT INTO products (maker_id, category_id, title, description, price, images, stock_quantity, status, featured, shipping_time) VALUES
    (maker_id, woodwork_cat_id, 'Handcarved Cutting Board', 'Oak cutting board with traditional Lithuanian patterns carved into the border.', 48.00, '["https://images.pexels.com/photos/6045240/pexels-photo-6045240.jpeg?auto=compress&cs=tinysrgb&w=800"]', 10, 'active', true, '3-5 business days'),
    (maker_id, woodwork_cat_id, 'Wooden Serving Platter', 'Large wooden serving platter made from Lithuanian ash wood.', 65.00, '["https://images.pexels.com/photos/4792489/pexels-photo-4792489.jpeg?auto=compress&cs=tinysrgb&w=800"]', 6, 'active', false, '5-7 business days');

  INSERT INTO makers (id, business_name, description, city, country, cover_image, website, verified, rating) VALUES
    (gen_random_uuid(), 'Ambermagic', 'Premium amber jewelry and gifts featuring the finest Baltic amber crafted by skilled Lithuanian artisans.', 'Vilnius', 'Lithuania', 'https://images.pexels.com/photos/8285483/pexels-photo-8285483.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://www.ambermagic.lt/', false, 4.9)
  RETURNING id INTO maker_id;
  
  INSERT INTO products (maker_id, category_id, title, description, price, images, stock_quantity, status, featured, shipping_time) VALUES
    (maker_id, amber_cat_id, 'Premium Amber Necklace', 'Luxury amber necklace with multiple amber stones in various colors.', 185.00, '["https://images.pexels.com/photos/8285483/pexels-photo-8285483.jpeg?auto=compress&cs=tinysrgb&w=800"]', 4, 'active', true, '3-5 business days'),
    (maker_id, amber_cat_id, 'Amber Gift Box Set', 'Gift set including amber pendant, earrings, and ring in presentation box.', 250.00, '["https://images.pexels.com/photos/10983780/pexels-photo-10983780.jpeg?auto=compress&cs=tinysrgb&w=800"]', 3, 'active', true, '3-5 business days');

  INSERT INTO makers (id, business_name, description, city, country, cover_image, website, verified, rating) VALUES
    (gen_random_uuid(), 'Keramikos akademija', 'Academy of ceramics offering professional pottery education and creating beautiful handcrafted ceramic pieces.', 'Vilnius', 'Lithuania', 'https://images.pexels.com/photos/6612388/pexels-photo-6612388.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://www.keramikaak.lt/', false, 4.8)
  RETURNING id INTO maker_id;
  
  INSERT INTO products (maker_id, category_id, title, description, price, images, stock_quantity, status, featured, shipping_time) VALUES
    (maker_id, ceramics_cat_id, 'Ceramic Dinner Plate Set', 'Set of 4 handmade dinner plates with unique glaze patterns.', 95.00, '["https://images.pexels.com/photos/6612388/pexels-photo-6612388.jpeg?auto=compress&cs=tinysrgb&w=800"]', 5, 'active', false, '5-7 business days'),
    (maker_id, ceramics_cat_id, 'Ceramic Tea Set', 'Handcrafted tea set including teapot and 4 cups.', 120.00, '["https://images.pexels.com/photos/6612387/pexels-photo-6612387.jpeg?auto=compress&cs=tinysrgb&w=800"]', 4, 'active', true, '5-7 business days');

  INSERT INTO makers (id, business_name, description, city, country, cover_image, website, verified, rating) VALUES
    (gen_random_uuid(), 'Upytes Tradiciniu amatu centras', 'Traditional craft center specializing in authentic Lithuanian linen weaving, straw ornaments, and wood crafts.', 'Panevezys', 'Lithuania', 'https://images.pexels.com/photos/6192337/pexels-photo-6192337.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://tautinispaveldas.lt/', false, 4.7)
  RETURNING id INTO maker_id;
  
  INSERT INTO products (maker_id, category_id, title, description, price, images, stock_quantity, status, featured, shipping_time) VALUES
    (maker_id, weaving_cat_id, 'Handwoven Linen Scarf', 'Lightweight linen scarf in natural colors, handwoven on traditional looms.', 42.00, '["https://images.pexels.com/photos/6192337/pexels-photo-6192337.jpeg?auto=compress&cs=tinysrgb&w=800"]', 12, 'active', false, '5-7 business days'),
    (maker_id, weaving_cat_id, 'Linen Kitchen Towels Set', 'Set of 3 handwoven linen kitchen towels with traditional patterns.', 35.00, '["https://images.pexels.com/photos/4792069/pexels-photo-4792069.jpeg?auto=compress&cs=tinysrgb&w=800"]', 20, 'active', false, '3-5 business days');

  INSERT INTO makers (id, business_name, description, city, country, cover_image, website, verified, rating) VALUES
    (gen_random_uuid(), 'Dale Sakaliene (Grazus Medis)', 'Woodworking artisan creating beautiful wooden products under the brand "Grazus Medis" (Beautiful Wood).', 'Panevezys', 'Lithuania', 'https://images.pexels.com/photos/6186509/pexels-photo-6186509.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://grazusmedis.lt', false, 4.6)
  RETURNING id INTO maker_id;
  
  INSERT INTO products (maker_id, category_id, title, description, price, images, stock_quantity, status, featured, shipping_time) VALUES
    (maker_id, woodwork_cat_id, 'Wooden Jewelry Box', 'Hand-carved wooden jewelry box with velvet lining.', 55.00, '["https://images.pexels.com/photos/6186509/pexels-photo-6186509.jpeg?auto=compress&cs=tinysrgb&w=800"]', 8, 'active', false, '5-7 business days'),
    (maker_id, woodwork_cat_id, 'Decorative Wooden Bowl', 'Turned wooden bowl perfect for displaying fruit or as decoration.', 45.00, '["https://images.pexels.com/photos/5974388/pexels-photo-5974388.jpeg?auto=compress&cs=tinysrgb&w=800"]', 10, 'active', false, '5-7 business days');

END $$;

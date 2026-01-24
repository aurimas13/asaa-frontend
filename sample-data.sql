-- Sample Data for Crafts And Hands Platform
-- Run this after creating actual user accounts through the signup flow

-- NOTE: Replace the user_id values with actual auth.users IDs from your Supabase dashboard
-- after creating test accounts

-- Example: Create 5 makers from the Lithuanian craftsmen list
-- First, sign up 5 users through the UI, then get their IDs and update below

/*
INSERT INTO makers (user_id, business_name, description, country, city, verified, rating, total_sales) VALUES
('REPLACE-WITH-USER-ID-1', 'Deividas Jotautis - Traditional Pottery', 'Certified traditional pottery practitioner from Kaunas. Specializing in traditional Lithuanian ceramic techniques and handmade pottery. Contact: +37061596635', 'Lithuania', 'Kaunas', true, 4.8, 156),
('REPLACE-WITH-USER-ID-2', 'Lina Dieninė - Ceramics & Toys', 'Certified traditional craft maker specializing in ceramics, pottery, and traditional toys. Creating authentic Lithuanian pieces in Molėtai region. Contact: meniskaskaimas@gmail.com', 'Lithuania', 'Molėtai', true, 4.9, 203),
('REPLACE-WITH-USER-ID-3', 'Virginija Stigaitė - Traditional Weaving', 'Certified weaving practitioner offering workshop visits in Vilnius. Traditional Lithuanian weaving techniques passed through generations. Contact: virginija@nytys.com', 'Lithuania', 'Vilnius', true, 4.7, 142),
('REPLACE-WITH-USER-ID-4', 'Kazys Morkūnas - Basketry Master', 'Certified basket weaver from Anykščiai. Traditional willow basket weaving with educational workshops available. Contact: morkunas.kazys@gmail.com', 'Lithuania', 'Anykščiai', true, 4.6, 98),
('REPLACE-WITH-USER-ID-5', 'Rasa Černiauskaitė - Traditional Sashes', 'Certified maker of Aukštaitian pintinės juostos (traditional Lithuanian sashes). Authentic ethnic patterns and techniques. Contact: +37068212275', 'Lithuania', 'Anykščiai', true, 4.9, 187);

-- Get maker IDs for products
-- After inserting makers, get their IDs and use below

-- Sample products for pottery maker
INSERT INTO products (maker_id, category_id, title, description, price, stock_quantity, images, materials, featured, rating, status) VALUES
('MAKER-1-ID', (SELECT id FROM categories WHERE slug = 'pottery'), 'Traditional Lithuanian Ceramic Bowl', 'Handcrafted ceramic bowl featuring traditional Lithuanian patterns. Perfect for serving or decoration. Made using ancient pottery techniques passed down through generations in Kaunas region.', 45.00, 12, '["https://images.pexels.com/photos/1702482/pexels-photo-1702482.jpeg?auto=compress&cs=tinysrgb&w=800"]', ARRAY['Clay', 'Natural glazes', 'Traditional pigments'], true, 4.8, 'active'),
('MAKER-1-ID', (SELECT id FROM categories WHERE slug = 'pottery'), 'Ceramic Vase with Ethnic Motifs', 'Beautiful handmade vase decorated with traditional Lithuanian symbols and patterns. Each piece is unique and tells a story of our heritage.', 68.00, 8, '["https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=800"]', ARRAY['Clay', 'Organic pigments'], false, 4.7, 'active');

-- Continue with other products...
*/

-- Complete list of 40 Lithuanian Craftsmen for Reference:
-- 1. Deividas Jotautis - Pottery / ceramics (Puodininkystė) - Kaunas
-- 2. Lina Dieninė - Ceramics / pottery / traditional toys - Molėtai r.
-- 3. Renata Umbrasienė - Traditional pottery - Lithuania
-- 4. Aleksandra Stasytienė - Weaving (Audimas) - Utena
-- 5. Virginija Stigaitė - Weaving (Audimas) - Vilnius
-- 6. Irena Ona Vilienė - National sashes (juostos) weaving/braiding - Panevėžys
-- 7. Rasa Černiauskaitė - Sashes (Pintinės juostos) - Anykščiai
-- 8. Kazys Morkūnas - Basketry (Pynimas iš vytelių) - Anykščiai r.
-- 9. Augenija Ruželienė - Basketry (Pynimas iš vytelių) - Rokiškis r.
-- 10. Vytautas Šemelis - Basketry + traditional crafts - Utena r.
-- 11. Simona Vatinaitė - Woven beehives / baskets (Pinti aviliai) - Klaipėda
-- 12. Albinas Šileika - Woodworking (stalystė/baldininkystė) - Utena
-- 13. Adelė Gančierė - Egg decorating + wood prints + paper cut - Utena
-- 14. Virginija Jurevičienė - Paper cut art (karpymas) - Kupiškis
-- 15. Rasa Balsevičienė - Wool felting (vilnos vėlimas) - Kretinga r.
-- 16. Alė Deksnienė - Wool felting (vilnos vėlimas) - Rokiškis
-- 17. Violeta Jasinevičienė - Felt footwear (veltinių gamyba) - Lithuania
-- 18. Darijus Gerlikas - Jewelry (Juvelyrika) - Lithuania
-- 19. Juozas Kavaliauskas - Blacksmithing (Kalvystė) - Druskininkai sav.
-- 20. Vaidas Petkevičius - Blacksmithing (Kalvystė) - Varėna r.
-- Plus 20 Traditional Craft Centers across Lithuania

-- Instructions for adding real data:
-- 1. Create user accounts through /signup page
-- 2. Get user IDs from Supabase dashboard (Authentication > Users)
-- 3. Insert makers using those user IDs
-- 4. Get maker IDs and create products
-- 5. Upload real product images to a CDN or use Pexels URLs

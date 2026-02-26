/*
  # Fix Product and Maker Images

  Replace broken/generic Pexels images with appropriate Unsplash images that:
  - Match the actual product being sold
  - Show real human portraits for individual makers
  - Show workshop/building/craft images for organizations

  All images use Unsplash Source URLs which are reliable and free for commercial use.
*/

-- ============================================
-- CATEGORY IMAGES
-- ============================================
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&fit=crop&q=80' WHERE slug = 'ceramics';
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800&fit=crop&q=80' WHERE slug = 'amber';
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=800&fit=crop&q=80' WHERE slug = 'straw-art';
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&fit=crop&q=80' WHERE slug = 'weaving';
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1629127726247-c5a21fdf41da?w=800&fit=crop&q=80' WHERE slug = 'basketry';
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1594040226829-7f251ab46d80?w=800&fit=crop&q=80' WHERE slug = 'woodwork';
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1535813547-99c456a41d4a?w=800&fit=crop&q=80' WHERE slug = 'blacksmithing';
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1452860606245-08f8e384cc1c?w=800&fit=crop&q=80' WHERE slug = 'multi-craft';

-- ============================================
-- MAKER COVER IMAGES
-- Individual artisans: portraits of craftspeople
-- Organizations/centers: workshop or building photos
-- ============================================

-- Juodosios keramikos centras "Molio Laume" (organization - black ceramics center)
UPDATE makers SET cover_image = 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&fit=crop&q=80'
WHERE business_name ILIKE '%Molio Laume%';

-- Vilniaus puodziu cechas (guild/organization - pottery guild)
UPDATE makers SET cover_image = 'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=800&fit=crop&q=80'
WHERE business_name ILIKE '%Vilniaus puodziu%';

-- Senuju amatu dirbtuves (organization - old craft workshops)
UPDATE makers SET cover_image = 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&fit=crop&q=80'
WHERE business_name ILIKE '%Senuju amatu%';

-- Palangos gintaro meistru gildija (guild - amber craftspeople guild)
UPDATE makers SET cover_image = 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800&fit=crop&q=80'
WHERE business_name ILIKE '%Palangos gintaro%';

-- Art Center of Baltic Amber (organization - amber gallery)
UPDATE makers SET cover_image = 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&fit=crop&q=80'
WHERE business_name ILIKE '%Art Center of Baltic Amber%';

-- Inga Ablingiene - Himmeli (individual woman artisan - straw art)
UPDATE makers SET cover_image = 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=800&fit=crop&q=80'
WHERE business_name ILIKE '%Inga Ablingien%' OR business_name ILIKE '%Himmeli%';

-- OAK Ceramics (studio/organization - contemporary ceramics)
UPDATE makers SET cover_image = 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&fit=crop&q=80'
WHERE business_name ILIKE '%OAK Ceramics%';

-- Pintines (workshop - basket weaving)
UPDATE makers SET cover_image = 'https://images.unsplash.com/photo-1629127726247-c5a21fdf41da?w=800&fit=crop&q=80'
WHERE business_name ILIKE '%Pintines%';

-- Giedrius & Rita Maciuitis / Kampelis (family duo - woodwork)
UPDATE makers SET cover_image = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&fit=crop&q=80'
WHERE business_name ILIKE '%Kampelis%' OR business_name ILIKE '%Giedrius%';

-- Ambermagic (organization - premium amber)
UPDATE makers SET cover_image = 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&fit=crop&q=80'
WHERE business_name ILIKE '%Ambermagic%';

-- Keramikos akademija (organization - ceramics academy)
UPDATE makers SET cover_image = 'https://images.unsplash.com/photo-1416339698674-4f118dd3388b?w=800&fit=crop&q=80'
WHERE business_name ILIKE '%Keramikos akademija%';

-- Upytes Tradiciniu amatu centras (organization - traditional craft center)
UPDATE makers SET cover_image = 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&fit=crop&q=80'
WHERE business_name ILIKE '%Upytes%';

-- Dale Sakaliene / Grazus Medis (individual woman - woodwork)
UPDATE makers SET cover_image = 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&fit=crop&q=80'
WHERE business_name ILIKE '%Dale Sakalien%' OR business_name ILIKE '%Grazus Medis%';

-- Additional makers from the translations migration:

-- Aleksandra Stasytiene (individual woman - weaving)
UPDATE makers SET cover_image = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&fit=crop&q=80'
WHERE business_name ILIKE '%Aleksandra Stasytien%';

-- Amber Artistry (organization)
UPDATE makers SET cover_image = 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&fit=crop&q=80'
WHERE business_name ILIKE '%Amber Artistry%';

-- Baltic Linen House (organization)
UPDATE makers SET cover_image = 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&fit=crop&q=80'
WHERE business_name ILIKE '%Baltic Linen%';

-- Blacksmith Brothers (organization)
UPDATE makers SET cover_image = 'https://images.unsplash.com/photo-1535813547-99c456a41d4a?w=800&fit=crop&q=80'
WHERE business_name ILIKE '%Blacksmith Brothers%';

-- Deividas Jotautis (individual man - pottery)
UPDATE makers SET cover_image = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&fit=crop&q=80'
WHERE business_name ILIKE '%Deividas Jotautis%';

-- Virginija Stigaite (individual woman - weaving)
UPDATE makers SET cover_image = 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&fit=crop&q=80'
WHERE business_name ILIKE '%Virginija Stigait%';

-- Violeta Jasineviciene (individual woman - wool felting)
UPDATE makers SET cover_image = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&fit=crop&q=80'
WHERE business_name ILIKE '%Violeta Jasinevičien%';

-- Vytautas Semelis (individual man - basketry)
UPDATE makers SET cover_image = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&fit=crop&q=80'
WHERE business_name ILIKE '%Vytautas Šemelis%';

-- Vaidas Petkevicius (individual man - blacksmithing)
UPDATE makers SET cover_image = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&fit=crop&q=80'
WHERE business_name ILIKE '%Vaidas Petkevičius%';

-- Virginija Jureviciene (individual woman - paper cutting)
UPDATE makers SET cover_image = 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&fit=crop&q=80'
WHERE business_name ILIKE '%Virginija Jurevičien%';

-- Utenos tradiciniu amatu centras "Svirnas" (organization)
UPDATE makers SET cover_image = 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&fit=crop&q=80'
WHERE business_name ILIKE '%Svirnas%';

-- Varenos kulturos centro Dargužiu amatu centras (organization)
UPDATE makers SET cover_image = 'https://images.unsplash.com/photo-1452860606245-08f8e384cc1c?w=800&fit=crop&q=80'
WHERE business_name ILIKE '%Dargužių%' OR business_name ILIKE '%Varėnos%';

-- Vilnius Ceramics Studio (organization)
UPDATE makers SET cover_image = 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&fit=crop&q=80'
WHERE business_name ILIKE '%Vilnius Ceramics%';

-- Wooden Wonders Workshop (organization)
UPDATE makers SET cover_image = 'https://images.unsplash.com/photo-1594040226829-7f251ab46d80?w=800&fit=crop&q=80'
WHERE business_name ILIKE '%Wooden Wonders%';

-- ============================================
-- PRODUCT IMAGES
-- Each product gets a unique, relevant image
-- ============================================

-- === CERAMICS ===
-- Traditional Black Ceramic Vase
UPDATE products SET images = '["https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&fit=crop&q=80"]'
WHERE title = 'Traditional Black Ceramic Vase';

-- Black Ceramic Bowl Set
UPDATE products SET images = '["https://images.unsplash.com/photo-1610701596007-11502f1ec5be?w=800&fit=crop&q=80"]'
WHERE title = 'Black Ceramic Bowl Set';

-- Decorative Black Clay Plate
UPDATE products SET images = '["https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=800&fit=crop&q=80"]'
WHERE title = 'Decorative Black Clay Plate';

-- Wheel-Thrown Clay Pitcher
UPDATE products SET images = '["https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=800&fit=crop&q=80"]'
WHERE title = 'Wheel-Thrown Clay Pitcher';

-- Ceramic Coffee Mug Set
UPDATE products SET images = '["https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&fit=crop&q=80"]'
WHERE title = 'Ceramic Coffee Mug Set';

-- Modern Ceramic Planter
UPDATE products SET images = '["https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&fit=crop&q=80"]'
WHERE title = 'Modern Ceramic Planter';

-- Ceramic Candle Holder Set
UPDATE products SET images = '["https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=800&fit=crop&q=80"]'
WHERE title = 'Ceramic Candle Holder Set';

-- Ceramic Dinner Plate Set
UPDATE products SET images = '["https://images.unsplash.com/photo-1603199506016-5ef8e0b24e44?w=800&fit=crop&q=80"]'
WHERE title = 'Ceramic Dinner Plate Set';

-- Ceramic Tea Set
UPDATE products SET images = '["https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=800&fit=crop&q=80"]'
WHERE title = 'Ceramic Tea Set';

-- === AMBER ===
-- Baltic Amber Pendant Necklace
UPDATE products SET images = '["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&fit=crop&q=80"]'
WHERE title = 'Baltic Amber Pendant Necklace';

-- Amber Earrings - Honey Color
UPDATE products SET images = '["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&fit=crop&q=80"]'
WHERE title = 'Amber Earrings - Honey Color';

-- Raw Amber Bracelet
UPDATE products SET images = '["https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&fit=crop&q=80"]'
WHERE title = 'Raw Amber Bracelet';

-- Amber Ring - Cognac Color
UPDATE products SET images = '["https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&fit=crop&q=80"]'
WHERE title = 'Amber Ring - Cognac Color';

-- Amber Cufflinks
UPDATE products SET images = '["https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800&fit=crop&q=80"]'
WHERE title = 'Amber Cufflinks';

-- Premium Amber Necklace
UPDATE products SET images = '["https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&fit=crop&q=80"]'
WHERE title = 'Premium Amber Necklace';

-- Amber Gift Box Set
UPDATE products SET images = '["https://images.unsplash.com/photo-1549488344-cbb6c34cf08b?w=800&fit=crop&q=80"]'
WHERE title = 'Amber Gift Box Set';

-- === STRAW ART ===
-- Traditional Straw Mobile - Small
UPDATE products SET images = '["https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=800&fit=crop&q=80"]'
WHERE title = 'Traditional Straw Mobile - Small';

-- Traditional Straw Mobile - Large
UPDATE products SET images = '["https://images.unsplash.com/photo-1482876555840-f31c5ebbff1c?w=800&fit=crop&q=80"]'
WHERE title = 'Traditional Straw Mobile - Large';

-- Straw Star Ornament Set
UPDATE products SET images = '["https://images.unsplash.com/photo-1512909006721-3d6018887383?w=800&fit=crop&q=80"]'
WHERE title = 'Straw Star Ornament Set';

-- === MULTI-CRAFT ===
-- Traditional Linen Table Runner
UPDATE products SET images = '["https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&fit=crop&q=80"]'
WHERE title = 'Traditional Linen Table Runner';

-- Wooden Spoon Collection
UPDATE products SET images = '["https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=800&fit=crop&q=80"]'
WHERE title = 'Wooden Spoon Collection';

-- === BASKETRY ===
-- Willow Shopping Basket
UPDATE products SET images = '["https://images.unsplash.com/photo-1629127726247-c5a21fdf41da?w=800&fit=crop&q=80"]'
WHERE title = 'Willow Shopping Basket';

-- Decorative Willow Bowl
UPDATE products SET images = '["https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800&fit=crop&q=80"]'
WHERE title = 'Decorative Willow Bowl';

-- Willow Picnic Basket
UPDATE products SET images = '["https://images.unsplash.com/photo-1526434426615-1abe81efcb0b?w=800&fit=crop&q=80"]'
WHERE title = 'Willow Picnic Basket';

-- === WOODWORK ===
-- Handcarved Cutting Board
UPDATE products SET images = '["https://images.unsplash.com/photo-1588165171080-c89acfa5ee83?w=800&fit=crop&q=80"]'
WHERE title = 'Handcarved Cutting Board';

-- Wooden Serving Platter
UPDATE products SET images = '["https://images.unsplash.com/photo-1605627079912-97c3810a11a4?w=800&fit=crop&q=80"]'
WHERE title = 'Wooden Serving Platter';

-- Wooden Jewelry Box
UPDATE products SET images = '["https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=800&fit=crop&q=80"]'
WHERE title = 'Wooden Jewelry Box';

-- Decorative Wooden Bowl
UPDATE products SET images = '["https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=800&fit=crop&q=80"]'
WHERE title = 'Decorative Wooden Bowl';

-- === WEAVING ===
-- Handwoven Linen Scarf
UPDATE products SET images = '["https://images.unsplash.com/photo-1601924921557-45e8e0db4aff?w=800&fit=crop&q=80"]'
WHERE title = 'Handwoven Linen Scarf';

-- Linen Kitchen Towels Set
UPDATE products SET images = '["https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&fit=crop&q=80"]'
WHERE title = 'Linen Kitchen Towels Set';

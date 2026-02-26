/*
  # Add Product and Category Translations

  1. New Columns on products table
    - `title_lt` (text) - Lithuanian title
    - `title_fr` (text) - French title
    - `description_lt` (text) - Lithuanian description
    - `description_fr` (text) - French description

  2. New Columns on categories table
    - `name_lt` (text) - Lithuanian name
    - `name_fr` (text) - French name
    - `description_lt` (text) - Lithuanian description
    - `description_fr` (text) - French description

  3. Data Population
    - Populates Lithuanian and French translations for all existing products
    - Populates Lithuanian and French translations for all existing categories
*/

-- ============================================
-- PRODUCTS: Add translation columns
-- ============================================
ALTER TABLE products ADD COLUMN IF NOT EXISTS title_lt TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS title_fr TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS description_lt TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS description_fr TEXT;

-- ============================================
-- CATEGORIES: Add translation columns
-- ============================================
ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_lt TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_fr TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS description_lt TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS description_fr TEXT;

-- ============================================
-- CATEGORIES: Populate translations
-- ============================================
UPDATE categories SET
  name_lt = 'Keramika',
  name_fr = 'Céramique',
  description_lt = 'Tradicinė lietuviška puodininkystė ir keramikos menas',
  description_fr = 'Poterie traditionnelle lituanienne et art céramique'
WHERE slug = 'ceramics';

UPDATE categories SET
  name_lt = 'Gintaras',
  name_fr = 'Ambre',
  description_lt = 'Autentiški Baltijos gintaro papuošalai ir dekoracijos',
  description_fr = 'Bijoux et décorations authentiques en ambre de la Baltique'
WHERE slug = 'amber';

UPDATE categories SET
  name_lt = 'Šiaudiniai sodai',
  name_fr = 'Art de la paille',
  description_lt = 'Tradiciniai lietuviški šiaudiniai ornamentai (šiaudiniai sodai)',
  description_fr = 'Ornements traditionnels lituaniens en paille (šiaudiniai sodai)'
WHERE slug = 'straw-art';

UPDATE categories SET
  name_lt = 'Audimas',
  name_fr = 'Tissage',
  description_lt = 'Rankų darbo audiniai ir lininiai gaminiai',
  description_fr = 'Textiles tissés à la main et produits en lin'
WHERE slug = 'weaving';

UPDATE categories SET
  name_lt = 'Pynimas',
  name_fr = 'Vannerie',
  description_lt = 'Tradicinis vytelių pynimas',
  description_fr = 'Vannerie traditionnelle en osier'
WHERE slug = 'basketry';

UPDATE categories SET
  name_lt = 'Medžio dirbiniai',
  name_fr = 'Travail du bois',
  description_lt = 'Rankų darbo mediniai gaminiai ir skulptūros',
  description_fr = 'Articles en bois et sculptures faits à la main'
WHERE slug = 'woodwork';

UPDATE categories SET
  name_lt = 'Kalvystė',
  name_fr = 'Forge',
  description_lt = 'Tradiciniai kalti geležies ir metalo dirbiniai',
  description_fr = 'Ferronnerie et travail du métal forgé traditionnels'
WHERE slug = 'blacksmithing';

UPDATE categories SET
  name_lt = 'Įvairūs amatai',
  name_fr = 'Multi-artisanat',
  description_lt = 'Centrai, siūlantys įvairius tradicinius amatus',
  description_fr = 'Centres proposant divers artisanats traditionnels'
WHERE slug = 'multi-craft';

-- ============================================
-- PRODUCTS: Populate translations
-- ============================================

-- Ceramics products
UPDATE products SET
  title_lt = 'Tradicinė juodos keramikos vaza',
  title_fr = 'Vase traditionnel en céramique noire',
  description_lt = 'Rankų darbo juodos keramikos vaza, pagaminta naudojant tradicines lietuviškas degimo technikas. Kiekvienas gaminys yra unikalus su natūraliomis variacijomis.',
  description_fr = 'Vase en céramique noire fait à la main utilisant les techniques de cuisson traditionnelles lituaniennes. Chaque pièce est unique avec des variations naturelles.'
WHERE title = 'Traditional Black Ceramic Vase';

UPDATE products SET
  title_lt = 'Juodos keramikos dubenų rinkinys',
  title_fr = 'Ensemble de bols en céramique noire',
  description_lt = 'Trijų rankų darbo juodos keramikos dubenų rinkinys, tinkamas patiekimui arba dekoracijai.',
  description_fr = 'Ensemble de 3 bols en céramique noire faits à la main, parfaits pour le service ou la décoration.'
WHERE title = 'Black Ceramic Bowl Set';

UPDATE products SET
  title_lt = 'Dekoratyvinė juodo molio lėkštė',
  title_fr = 'Assiette décorative en argile noire',
  description_lt = 'Didelė dekoratyvinė lėkštė su tradiciniais lietuviškais raštais juodoje keramikoje.',
  description_fr = 'Grande assiette décorative avec des motifs traditionnels lituaniens en céramique noire.'
WHERE title = 'Decorative Black Clay Plate';

UPDATE products SET
  title_lt = 'Žiestas molio ąsotis',
  title_fr = 'Cruche en argile tournée',
  description_lt = 'Tradicinis lietuviškas ąsotis, puikiai tinkantis vandeniui, sultims patiekti arba kaip dekoracija.',
  description_fr = 'Cruche lituanienne traditionnelle parfaite pour servir l''eau, le jus ou comme pièce décorative.'
WHERE title = 'Wheel-Thrown Clay Pitcher';

UPDATE products SET
  title_lt = 'Keraminių kavos puodelių rinkinys',
  title_fr = 'Ensemble de tasses à café en céramique',
  description_lt = 'Keturių rankų darbo keraminių puodelių rinkinys su natūralia glazūra.',
  description_fr = 'Ensemble de 4 tasses en céramique faites à la main avec une finition émaillée naturelle.'
WHERE title = 'Ceramic Coffee Mug Set';

UPDATE products SET
  title_lt = 'Šiuolaikinis keraminis vazonas',
  title_fr = 'Jardinière en céramique moderne',
  description_lt = 'Minimalistinis keraminis vazonas su drenažo anga, puikiai tinkantis sukulentams.',
  description_fr = 'Jardinière en céramique minimaliste avec trou de drainage, parfaite pour les succulentes.'
WHERE title = 'Modern Ceramic Planter';

UPDATE products SET
  title_lt = 'Keraminių žvakidžių rinkinys',
  title_fr = 'Ensemble de bougeoirs en céramique',
  description_lt = 'Trijų keraminių žvakidžių rinkinys natūraliais tonais.',
  description_fr = 'Ensemble de 3 bougeoirs en céramique aux tons naturels.'
WHERE title = 'Ceramic Candle Holder Set';

UPDATE products SET
  title_lt = 'Keraminių pietų lėkščių rinkinys',
  title_fr = 'Ensemble d''assiettes en céramique',
  description_lt = 'Keturių rankų darbo pietų lėkščių rinkinys su unikaliais glazūros raštais.',
  description_fr = 'Ensemble de 4 assiettes faites à la main avec des motifs d''émail uniques.'
WHERE title = 'Ceramic Dinner Plate Set';

UPDATE products SET
  title_lt = 'Keraminis arbatos rinkinys',
  title_fr = 'Service à thé en céramique',
  description_lt = 'Rankų darbo arbatos rinkinys su arbatinuku ir 4 puodeliais.',
  description_fr = 'Service à thé fait à la main comprenant une théière et 4 tasses.'
WHERE title = 'Ceramic Tea Set';

-- Amber products
UPDATE products SET
  title_lt = 'Baltijos gintaro pakabukas ant grandinėlės',
  title_fr = 'Collier pendentif en ambre de la Baltique',
  description_lt = 'Tikras Baltijos gintaro pakabukas ant sidabrinės grandinėlės. Kiekvienas gaminys turi unikalius natūralius intarpus.',
  description_fr = 'Pendentif en ambre de la Baltique authentique sur chaîne en argent. Chaque pièce contient des inclusions naturelles uniques.'
WHERE title = 'Baltic Amber Pendant Necklace';

UPDATE products SET
  title_lt = 'Gintaro auskarai - medaus spalvos',
  title_fr = 'Boucles d''oreilles en ambre - couleur miel',
  description_lt = 'Delikatūs gintaro lašeliniai auskarai su sidabriniais kabliukais.',
  description_fr = 'Délicates boucles d''oreilles en ambre en forme de goutte avec crochets en argent sterling.'
WHERE title = 'Amber Earrings - Honey Color';

UPDATE products SET
  title_lt = 'Neapdoroto gintaro apyrankė',
  title_fr = 'Bracelet en ambre brut',
  description_lt = 'Autentiška neapdoroto Baltijos gintaro apyrankė su natūraliomis netaisyklingomis formomis.',
  description_fr = 'Bracelet authentique en ambre brut de la Baltique avec des formes irrégulières naturelles.'
WHERE title = 'Raw Amber Bracelet';

UPDATE products SET
  title_lt = 'Gintaro žiedas - konjako spalvos',
  title_fr = 'Bague en ambre - couleur cognac',
  description_lt = 'Elegantiškas gintaro žiedas sidabriniame rėmelyje, konjako spalvos gintaras.',
  description_fr = 'Élégante bague en ambre sertie dans de l''argent sterling, ambre couleur cognac.'
WHERE title = 'Amber Ring - Cognac Color';

UPDATE products SET
  title_lt = 'Gintaro sąsagos',
  title_fr = 'Boutons de manchette en ambre',
  description_lt = 'Vyriškos gintaro sąsagos su poliruotais auksinės spalvos gintaro akmenimis.',
  description_fr = 'Boutons de manchette pour homme en ambre poli de couleur dorée.'
WHERE title = 'Amber Cufflinks';

UPDATE products SET
  title_lt = 'Prabangus gintaro vėrinys',
  title_fr = 'Collier en ambre de luxe',
  description_lt = 'Prabangus gintaro vėrinys su daugybe įvairių spalvų gintaro akmenų.',
  description_fr = 'Collier en ambre de luxe avec plusieurs pierres d''ambre de différentes couleurs.'
WHERE title = 'Premium Amber Necklace';

UPDATE products SET
  title_lt = 'Gintaro dovanų rinkinys',
  title_fr = 'Coffret cadeau en ambre',
  description_lt = 'Dovanų rinkinys su gintaro pakabuku, auskarais ir žiedu dovaninėje dėžutėje.',
  description_fr = 'Coffret cadeau comprenant un pendentif, des boucles d''oreilles et une bague en ambre dans un écrin de présentation.'
WHERE title = 'Amber Gift Box Set';

-- Straw Art products
UPDATE products SET
  title_lt = 'Tradicinis šiaudinis sodas - mažas',
  title_fr = 'Mobile traditionnel en paille - petit',
  description_lt = 'Rankų darbo lietuviškas šiaudinis ornamentas (sodas) namų dekoracijai. Mažas dydis, apie 20 cm.',
  description_fr = 'Ornement traditionnel lituanien en paille (sodas) fait à la main pour la décoration intérieure. Petit format, environ 20 cm.'
WHERE title = 'Traditional Straw Mobile - Small';

UPDATE products SET
  title_lt = 'Tradicinis šiaudinis sodas - didelis',
  title_fr = 'Mobile traditionnel en paille - grand',
  description_lt = 'Nuostabus didelis šiaudinis ornamentas (sodas), pagamintas iš natūralių rugių šiaudų. Apie 40 cm skersmens.',
  description_fr = 'Magnifique grand ornement en paille (sodas) fabriqué à partir de paille de seigle naturelle. Environ 40 cm de diamètre.'
WHERE title = 'Traditional Straw Mobile - Large';

UPDATE products SET
  title_lt = 'Šiaudinių žvaigždžių ornamentų rinkinys',
  title_fr = 'Ensemble d''ornements étoiles en paille',
  description_lt = 'Šešių rankų darbo šiaudinių žvaigždžių ornamentų rinkinys, puikiai tinkantis Kalėdų dekoracijai.',
  description_fr = 'Ensemble de 6 ornements étoiles en paille faits à la main, parfaits pour la décoration de Noël.'
WHERE title = 'Straw Star Ornament Set';

-- Multi-craft products
UPDATE products SET
  title_lt = 'Tradicinis lininis stalo takelis',
  title_fr = 'Chemin de table traditionnel en lin',
  description_lt = 'Rankų darbo lininis stalo takelis su tradiciniais lietuviškais raštais.',
  description_fr = 'Chemin de table en lin tissé à la main avec des motifs traditionnels lituaniens.'
WHERE title = 'Traditional Linen Table Runner';

UPDATE products SET
  title_lt = 'Medinių šaukštų kolekcija',
  title_fr = 'Collection de cuillères en bois',
  description_lt = 'Penkių rankų darbo drožtų medinių šaukštų rinkinys įvairių dydžių, skirtų virimui ir patiekimui.',
  description_fr = 'Ensemble de 5 cuillères en bois sculptées à la main de différentes tailles pour la cuisine et le service.'
WHERE title = 'Wooden Spoon Collection';

-- Basketry products
UPDATE products SET
  title_lt = 'Vytelių pirkinių krepšys',
  title_fr = 'Panier de courses en osier',
  description_lt = 'Didelis rankų darbo vytelių krepšys, puikiai tinkantis apsipirkimui ar daiktų laikymui.',
  description_fr = 'Grand panier en osier tressé à la main, parfait pour les courses ou le rangement.'
WHERE title = 'Willow Shopping Basket';

UPDATE products SET
  title_lt = 'Dekoratyvinis vytelių dubuo',
  title_fr = 'Bol décoratif en osier',
  description_lt = 'Gražus pintas vytelių dubuo vaisiams arba dekoracijai.',
  description_fr = 'Magnifique bol en osier tressé pour les fruits ou la décoration.'
WHERE title = 'Decorative Willow Bowl';

UPDATE products SET
  title_lt = 'Vytelių pikniko krepšys',
  title_fr = 'Panier de pique-nique en osier',
  description_lt = 'Tradicinis pikniko krepšys su dangčiu ir rankenomis, pintas iš vytelių.',
  description_fr = 'Panier de pique-nique traditionnel avec couvercle et poignées, tressé en osier.'
WHERE title = 'Willow Picnic Basket';

-- Woodwork products
UPDATE products SET
  title_lt = 'Rankų darbo pjaustomoji lentelė',
  title_fr = 'Planche à découper sculptée à la main',
  description_lt = 'Ąžuolinė pjaustomoji lentelė su tradiciniais lietuviškais raštais, išdrožtais pakraščiuose.',
  description_fr = 'Planche à découper en chêne avec des motifs traditionnels lituaniens sculptés sur les bords.'
WHERE title = 'Handcarved Cutting Board';

UPDATE products SET
  title_lt = 'Medinis patiekimo padėklas',
  title_fr = 'Plateau de service en bois',
  description_lt = 'Didelis medinis patiekimo padėklas, pagamintas iš lietuviško uosio medienos.',
  description_fr = 'Grand plateau de service en bois fabriqué à partir de bois de frêne lituanien.'
WHERE title = 'Wooden Serving Platter';

UPDATE products SET
  title_lt = 'Medinė papuošalų dėžutė',
  title_fr = 'Boîte à bijoux en bois',
  description_lt = 'Rankų darbo drožta medinė papuošalų dėžutė su aksominiu pamušalu.',
  description_fr = 'Boîte à bijoux en bois sculptée à la main avec doublure en velours.'
WHERE title = 'Wooden Jewelry Box';

UPDATE products SET
  title_lt = 'Dekoratyvinis medinis dubuo',
  title_fr = 'Bol décoratif en bois',
  description_lt = 'Tekintinis medinis dubuo, puikiai tinkantis vaisiams eksponuoti arba kaip dekoracija.',
  description_fr = 'Bol en bois tourné parfait pour présenter des fruits ou comme décoration.'
WHERE title = 'Decorative Wooden Bowl';

-- Weaving products
UPDATE products SET
  title_lt = 'Rankų darbo lininis šalikas',
  title_fr = 'Écharpe en lin tissée à la main',
  description_lt = 'Lengvas lininis šalikas natūraliomis spalvomis, austas ant tradicinių staklių.',
  description_fr = 'Écharpe légère en lin aux couleurs naturelles, tissée sur des métiers traditionnels.'
WHERE title = 'Handwoven Linen Scarf';

UPDATE products SET
  title_lt = 'Lininių virtuvės rankšluosčių rinkinys',
  title_fr = 'Ensemble de torchons de cuisine en lin',
  description_lt = 'Trijų rankų darbo lininių virtuvės rankšluosčių rinkinys su tradiciniais raštais.',
  description_fr = 'Ensemble de 3 torchons de cuisine en lin tissés à la main avec des motifs traditionnels.'
WHERE title = 'Linen Kitchen Towels Set';

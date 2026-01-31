/*
  # Add Maker Description Translations

  1. New Columns
    - `description_lt` (text) - Lithuanian description
    - `description_fr` (text) - French description
    - `website_label_lt` (text) - Website label in Lithuanian
    - `website_label_fr` (text) - Website label in French

  2. Data Population
    - Populates Lithuanian and French translations for all makers
*/

-- Add translation columns
ALTER TABLE makers ADD COLUMN IF NOT EXISTS description_lt TEXT;
ALTER TABLE makers ADD COLUMN IF NOT EXISTS description_fr TEXT;

-- Update Inga Ablingiene - Himmeli
UPDATE makers SET 
  description_lt = 'Meistrė amatininkė, kurianti tradicinius lietuviškus šiaudinius sodus - sudėtingus geometrinius pakabučius su gilia kultūrine reikšme.',
  description_fr = 'Artisane créant des ornements traditionnels lituaniens en paille (siaudiniai sodai) - des mobiles géométriques complexes avec une profonde signification culturelle.'
WHERE business_name ILIKE '%Inga Ablingien%' OR business_name ILIKE '%Himmeli%';

-- Update Aleksandra Stasytienė
UPDATE makers SET 
  description_lt = 'Tradicinio audimo praktikė iš Utenos, dirbanti vietiniame amatų centre.',
  description_fr = 'Praticienne du tissage traditionnel (Audimas) d''Utena avec un atelier au centre artisanal local.'
WHERE business_name ILIKE '%Aleksandra Stasytien%';

-- Update Amber Artistry
UPDATE makers SET 
  description_lt = 'Unikalūs gintaro papuošalų dizainai, derinantys senovinį Baltijos gintarą su šiuolaikiška estetika.',
  description_fr = 'Créations de bijoux en ambre uniques combinant l''ambre baltique ancien avec une esthétique moderne.'
WHERE business_name ILIKE '%Amber Artistry%';

-- Update Baltic Linen House
UPDATE makers SET 
  description_lt = 'Aukščiausios kokybės rankų darbo lininiai audiniai iš vietinių linų. Tvarus amatininkystė nuo 1995 m.',
  description_fr = 'Textiles en lin tissés à la main de qualité supérieure fabriqués à partir de lin cultivé localement. Artisanat durable depuis 1995.'
WHERE business_name ILIKE '%Baltic Linen%';

-- Update Blacksmith Brothers
UPDATE makers SET 
  description_lt = 'Autentiški kalti metaliniai dirbiniai - nuo dekoratyvinių elementų iki funkcinių įrankių, visi pagaminti rankomis.',
  description_fr = 'Ferronnerie forgée authentique - des pièces décoratives aux outils fonctionnels, tout fabriqué à la main.'
WHERE business_name ILIKE '%Blacksmith Brothers%';

-- Update Deividas Jotautis
UPDATE makers SET 
  description_lt = 'Sertifikuotas tradicinės puodininkystės meistras iš Kauno. Kuria autentiškus lietuviškus keramiką naudodamas tradicines technikas.',
  description_fr = 'Praticien certifié de la poterie traditionnelle (Puodininkystė) de Kaunas. Crée des œuvres céramiques lituaniennes authentiques utilisant des techniques traditionnelles.'
WHERE business_name ILIKE '%Deividas Jotautis%';

-- Update Vilniaus puodziu cechas
UPDATE makers SET 
  description_lt = 'Vilniaus puodžių cechas - tradicinės lietuviškos keramikos meistrai, tęsiantys šimtmečių senumo tradicijas.',
  description_fr = 'Guilde des potiers de Vilnius - maîtres de la céramique lituanienne traditionnelle perpétuant des traditions centenaires.'
WHERE business_name ILIKE '%Vilniaus puodziu%' OR business_name ILIKE '%puodžių%';

-- Update Virginija Stigaitė
UPDATE makers SET 
  description_lt = 'Tradicinio audimo meistrė, kurianti rankų darbo vilnonius ir lininius audinius pagal senovines lietuviškas tradicijas.',
  description_fr = 'Maître tisserande créant des textiles en laine et lin tissés à la main selon les anciennes traditions lituaniennes.'
WHERE business_name ILIKE '%Virginija Stigait%';

-- Update Violeta Jasinevičienė
UPDATE makers SET 
  description_lt = 'Vilnos vėlimo meistrė, kurianti unikalius rankų darbo veltus gaminius - nuo skrybėlių iki namų dekoro.',
  description_fr = 'Artisane du feutrage de laine créant des articles feutrés uniques faits à la main - des chapeaux à la décoration intérieure.'
WHERE business_name ILIKE '%Violeta Jasinevičien%';

-- Update Vytautas Šemelis
UPDATE makers SET 
  description_lt = 'Tradicinės pintininkystės meistras iš Dzūkijos, kuriantis pintines ir kitus gaminius iš vytelių.',
  description_fr = 'Maître vannier traditionnel de Dzūkija, créant des paniers et autres articles en osier.'
WHERE business_name ILIKE '%Vytautas Šemelis%';

-- Update Vaidas Petkevičius
UPDATE makers SET 
  description_lt = 'Tradicinės kalvystės meistras, kuriantis kaltus metalo dirbinius - nuo sodo dekoracijų iki namų akcentų.',
  description_fr = 'Maître forgeron traditionnel créant des ferronneries forgées - des décorations de jardin aux accents pour la maison.'
WHERE business_name ILIKE '%Vaidas Petkevičius%';

-- Update Virginija Jurevičienė
UPDATE makers SET 
  description_lt = 'Tradicinio popieriaus karpymo meistrė, kurianti sudėtingus ornamentus pagal lietuviškas tradicijas.',
  description_fr = 'Artisane de la découpe traditionnelle du papier, créant des ornements complexes selon les traditions lituaniennes.'
WHERE business_name ILIKE '%Virginija Jurevičien%';

-- Update Utenos tradicinių amatų centras "Svirnas"
UPDATE makers SET 
  description_lt = 'Utenos tradicinių amatų centras "Svirnas" - vieta, kur puoselėjamos ir perduodamos lietuviškos amatų tradicijos.',
  description_fr = 'Centre des métiers traditionnels d''Utena "Svirnas" - un lieu où les traditions artisanales lituaniennes sont préservées et transmises.'
WHERE business_name ILIKE '%Svirnas%';

-- Update Varėnos kultūros centro Dargužių amatų centras
UPDATE makers SET 
  description_lt = 'Dzūkijos amatų centras Dargužiuose, kur mokomasi ir praktikuojami tradiciniai lietuviški amatai.',
  description_fr = 'Centre artisanal de Dzūkija à Dargužiai, où les métiers traditionnels lituaniens sont enseignés et pratiqués.'
WHERE business_name ILIKE '%Dargužių%' OR business_name ILIKE '%Varėnos%';

-- Update Vilnius Ceramics Studio
UPDATE makers SET 
  description_lt = 'Vilniaus keramikos studija - šiuolaikinė keramika, įkvėpta lietuviškų tradicijų.',
  description_fr = 'Studio de céramique de Vilnius - céramique contemporaine inspirée des traditions lituaniennes.'
WHERE business_name ILIKE '%Vilnius Ceramics%';

-- Update Wooden Wonders Workshop
UPDATE makers SET 
  description_lt = 'Medinių stebuklų dirbtuvė - rankų darbo mediniai gaminiai, pagaminti su meile ir pagarba tradicijai.',
  description_fr = 'Atelier des merveilles en bois - articles en bois faits à la main avec amour et respect de la tradition.'
WHERE business_name ILIKE '%Wooden Wonders%';

-- Update remaining makers with generic translations based on their English descriptions
UPDATE makers SET 
  description_lt = CASE 
    WHEN description ILIKE '%amber%' THEN 'Gintaro papuošalų meistras, kuriantis unikalius dirbinius iš Baltijos gintaro.'
    WHEN description ILIKE '%weav%' OR description ILIKE '%linen%' OR description ILIKE '%textile%' THEN 'Tradicinio audimo meistras, kuriantis rankų darbo audinius pagal lietuviškas tradicijas.'
    WHEN description ILIKE '%pottery%' OR description ILIKE '%ceramic%' THEN 'Tradicinės keramikos meistras, kuriantis autentiškus lietuviškus molio dirbinius.'
    WHEN description ILIKE '%wood%' THEN 'Medžio drožybos meistras, kuriantis tradicinius lietuviškus medinius dirbinius.'
    WHEN description ILIKE '%basket%' THEN 'Tradicinės pintininkystės meistras, kuriantis pintines ir kitus gaminius iš vytelių.'
    WHEN description ILIKE '%black%' OR description ILIKE '%forge%' OR description ILIKE '%iron%' THEN 'Tradicinės kalvystės meistras, kuriantis kaltus metalo dirbinius.'
    WHEN description ILIKE '%straw%' THEN 'Šiaudinių sodų meistras, kuriantis tradicinius lietuviškus šiaudinius papuošalus.'
    WHEN description ILIKE '%felt%' OR description ILIKE '%wool%' THEN 'Vilnos vėlimo meistras, kuriantis unikalius veltus gaminius.'
    WHEN description ILIKE '%leather%' THEN 'Odos dirbinių meistras, kuriantis rankų darbo odinius gaminius.'
    WHEN description ILIKE '%paper%' THEN 'Popieriaus meno meistras, kuriantis tradicinius karpymus ir origami.'
    WHEN description ILIKE '%jewelry%' THEN 'Juvelyrikos meistras, kuriantis unikalius rankų darbo papuošalus.'
    ELSE 'Tradicinių lietuviškų amatų meistras, puoselėjantis senovines technologijas ir tradicinius metodus.'
  END
WHERE description_lt IS NULL AND description IS NOT NULL;

UPDATE makers SET 
  description_fr = CASE 
    WHEN description ILIKE '%amber%' THEN 'Artisan de l''ambre créant des pièces uniques en ambre de la Baltique.'
    WHEN description ILIKE '%weav%' OR description ILIKE '%linen%' OR description ILIKE '%textile%' THEN 'Artisan du tissage traditionnel créant des textiles faits à la main selon les traditions lituaniennes.'
    WHEN description ILIKE '%pottery%' OR description ILIKE '%ceramic%' THEN 'Artisan de la céramique traditionnelle créant des œuvres authentiques en argile lituanienne.'
    WHEN description ILIKE '%wood%' THEN 'Artisan du bois créant des objets en bois lituaniens traditionnels.'
    WHEN description ILIKE '%basket%' THEN 'Artisan vannier traditionnel créant des paniers et articles en osier.'
    WHEN description ILIKE '%black%' OR description ILIKE '%forge%' OR description ILIKE '%iron%' THEN 'Artisan forgeron traditionnel créant des ferronneries forgées.'
    WHEN description ILIKE '%straw%' THEN 'Artisan des ornements en paille créant des décorations traditionnelles lituaniennes.'
    WHEN description ILIKE '%felt%' OR description ILIKE '%wool%' THEN 'Artisan du feutrage de laine créant des articles feutrés uniques.'
    WHEN description ILIKE '%leather%' THEN 'Artisan du cuir créant des articles en cuir faits à la main.'
    WHEN description ILIKE '%paper%' THEN 'Artisan du papier créant des découpages traditionnels et origami.'
    WHEN description ILIKE '%jewelry%' THEN 'Artisan joaillier créant des bijoux uniques faits à la main.'
    ELSE 'Artisan des métiers traditionnels lituaniens préservant les techniques anciennes et les méthodes traditionnelles.'
  END
WHERE description_fr IS NULL AND description IS NOT NULL;
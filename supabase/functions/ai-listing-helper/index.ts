import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ListingInput {
  maker_id: string;
  photos?: string[];
  bullets: string[];
  craft_type: string;
  materials?: string[];
  dimensions?: string;
  price_range?: string;
}

interface GeneratedListing {
  title_lt: string;
  title_en: string;
  description_lt: string;
  description_en: string;
  tags: string[];
  suggested_price: number | null;
}

function generateListing(input: ListingInput): GeneratedListing {
  const { bullets, craft_type, materials, dimensions, price_range } = input;

  const bulletText = bullets.join('. ');
  const materialText = materials?.join(', ') || '';

  const craftTranslations: Record<string, { lt: string; en: string }> = {
    pottery: { lt: 'Keramika', en: 'Pottery' },
    weaving: { lt: 'Audimas', en: 'Weaving' },
    basketry: { lt: 'Pynimas', en: 'Basketry' },
    woodwork: { lt: 'Medžio dirbiniai', en: 'Woodwork' },
    blacksmithing: { lt: 'Kalvystė', en: 'Blacksmithing' },
    jewelry: { lt: 'Juvelyrika', en: 'Jewelry' },
    felting: { lt: 'Vėlimas', en: 'Felting' },
    leather: { lt: 'Odos gaminiai', en: 'Leather' },
    textiles: { lt: 'Tekstilė', en: 'Textiles' },
  };

  const craftName = craftTranslations[craft_type] || { lt: craft_type, en: craft_type };

  const title_en = `Handcrafted Lithuanian ${craftName.en} - ${bulletText.split('.')[0]}`;
  const title_lt = `Rankų darbo lietuviška ${craftName.lt.toLowerCase()} - ${bulletText.split('.')[0]}`;

  const description_en = `
This beautiful piece of ${craftName.en.toLowerCase()} is handcrafted by a skilled Lithuanian artisan using traditional techniques passed down through generations.

Key Features:
${bullets.map(b => `- ${b}`).join('\n')}

${materialText ? `Materials: ${materialText}` : ''}
${dimensions ? `Dimensions: ${dimensions}` : ''}

Each piece is unique and made with care and attention to detail. Perfect for those who appreciate authentic, handmade craftsmanship.

Shipping: Ships within 3-5 business days. Carefully packaged to ensure safe delivery.
  `.trim();

  const description_lt = `
Šis gražus ${craftName.lt.toLowerCase()} kūrinys yra rankų darbo, pagamintas talentingo Lietuvos amatininko, naudojant tradicines technikas, perduodamas iš kartos į kartą.

Pagrindinės savybės:
${bullets.map(b => `- ${b}`).join('\n')}

${materialText ? `Medžiagos: ${materialText}` : ''}
${dimensions ? `Matmenys: ${dimensions}` : ''}

Kiekvienas kūrinys yra unikalus ir pagamintas su rūpestingumu ir dėmesiu detalėms. Puikiai tinka tiems, kurie vertina autentišką rankų darbo meistriškumą.

Pristatymas: Išsiunčiama per 3-5 darbo dienas. Kruopščiai supakuota saugiam pristatymui.
  `.trim();

  const tags = [
    'handmade',
    'lithuanian',
    'traditional',
    craft_type,
    'artisan',
    'unique',
    'handcrafted',
    ...(materials || []).slice(0, 3),
  ].filter(Boolean);

  let suggested_price: number | null = null;
  if (price_range) {
    const match = price_range.match(/(\d+)/);
    if (match) {
      suggested_price = parseInt(match[1], 10);
    }
  }

  return {
    title_lt,
    title_en,
    description_lt,
    description_en,
    tags,
    suggested_price,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const input: ListingInput = await req.json();

    if (!input.maker_id || !input.bullets || input.bullets.length === 0 || !input.craft_type) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: maker_id, bullets, craft_type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: maker, error: makerError } = await supabase
      .from("makers")
      .select("id, user_id")
      .eq("id", input.maker_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (makerError || !maker) {
      return new Response(
        JSON.stringify({ error: "Maker not found or unauthorized" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const generated = generateListing(input);

    const { data: draft, error: insertError } = await supabase
      .from("ai_listing_drafts")
      .insert({
        maker_id: input.maker_id,
        title_lt: generated.title_lt,
        title_en: generated.title_en,
        description_lt: generated.description_lt,
        description_en: generated.description_en,
        tags: generated.tags,
        suggested_price: generated.suggested_price,
        original_input: input,
        ai_model: "rule-based-v1",
        status: "draft",
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        draft_id: draft.id,
        generated,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("AI Listing Helper error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

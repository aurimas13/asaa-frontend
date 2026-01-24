import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface JobPayload {
  job_type: 'update_statistics' | 'send_event_reminders' | 'cleanup_carts' | 'update_maker_ratings' | 'generate_ai_recommendations';
  params?: Record<string, any>;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const payload: JobPayload = await req.json();

    let result;
    switch (payload.job_type) {
      case 'update_statistics':
        result = await updateStatistics(supabaseClient);
        break;
      case 'send_event_reminders':
        result = await sendEventReminders(supabaseClient);
        break;
      case 'cleanup_carts':
        result = await cleanupCarts(supabaseClient);
        break;
      case 'update_maker_ratings':
        result = await updateMakerRatings(supabaseClient);
        break;
      case 'generate_ai_recommendations':
        result = await generateAIRecommendations(supabaseClient, payload.params?.user_id);
        break;
      default:
        return new Response(
          JSON.stringify({ error: "Unknown job type" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
    }

    return new Response(
      JSON.stringify({
        success: true,
        job_type: payload.job_type,
        result,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Background job error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to execute background job",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function updateStatistics(supabase: any) {
  const { data: products } = await supabase
    .from("products")
    .select("id, reviews(rating)");

  if (!products) return { updated: 0 };

  let updated = 0;
  for (const product of products) {
    if (product.reviews && product.reviews.length > 0) {
      const avgRating = product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / product.reviews.length;

      await supabase
        .from("products")
        .update({ rating: avgRating })
        .eq("id", product.id);

      updated++;
    }
  }

  return { updated, message: `Updated ${updated} product ratings` };
}

async function sendEventReminders(supabase: any) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);

  const { data: events } = await supabase
    .from("events")
    .select(`
      id,
      title,
      start_date,
      location,
      online_url,
      event_registrations(user_id, profiles(email, full_name))
    `)
    .gte("start_date", tomorrow.toISOString())
    .lt("start_date", dayAfter.toISOString())
    .eq("status", "upcoming");

  if (!events || events.length === 0) {
    return { sent: 0, message: "No events tomorrow" };
  }

  let sent = 0;
  for (const event of events) {
    if (event.event_registrations) {
      for (const registration of event.event_registrations) {
        const profile = registration.profiles;
        if (profile?.email) {
          try {
            await fetch(
              `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
                },
                body: JSON.stringify({
                  to: profile.email,
                  subject: `Event Reminder: ${event.title}`,
                  type: "event_reminder",
                  data: {
                    eventTitle: event.title,
                    eventDate: new Date(event.start_date).toLocaleString(),
                    location: event.location || "Online",
                    onlineUrl: event.online_url,
                  },
                }),
              }
            );
            sent++;
          } catch (error) {
            console.error("Failed to send reminder:", error);
          }
        }
      }
    }
  }

  return { sent, message: `Sent ${sent} event reminders` };
}

async function cleanupCarts(supabase: any) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data, error } = await supabase
    .from("carts")
    .delete()
    .lt("updated_at", thirtyDaysAgo.toISOString())
    .select();

  if (error) {
    console.error("Cleanup error:", error);
    return { deleted: 0, error: error.message };
  }

  return { deleted: data?.length || 0, message: `Deleted ${data?.length || 0} old cart items` };
}

async function updateMakerRatings(supabase: any) {
  const { data: makers } = await supabase
    .from("makers")
    .select(`
      id,
      products(id, reviews(rating))
    `);

  if (!makers) return { updated: 0 };

  let updated = 0;
  for (const maker of makers) {
    if (maker.products && maker.products.length > 0) {
      let totalRating = 0;
      let reviewCount = 0;

      for (const product of maker.products) {
        if (product.reviews) {
          for (const review of product.reviews) {
            totalRating += review.rating;
            reviewCount++;
          }
        }
      }

      if (reviewCount > 0) {
        const avgRating = totalRating / reviewCount;

        await supabase
          .from("makers")
          .update({ rating: avgRating })
          .eq("id", maker.id);

        updated++;
      }
    }
  }

  return { updated, message: `Updated ${updated} maker ratings` };
}

async function generateAIRecommendations(supabase: any, userId?: string) {
  if (!userId) {
    const { data: users } = await supabase
      .from("profiles")
      .select("id")
      .limit(10);

    if (!users || users.length === 0) {
      return { generated: 0, message: "No users found" };
    }

    let total = 0;
    for (const user of users) {
      const result = await generateRecommendationsForUser(supabase, user.id);
      total += result.count;
    }

    return { generated: total, message: `Generated ${total} recommendations` };
  }

  const result = await generateRecommendationsForUser(supabase, userId);
  return { generated: result.count, message: `Generated ${result.count} recommendations for user` };
}

async function generateRecommendationsForUser(supabase: any, userId: string) {
  const { data: wishlist } = await supabase
    .from("wishlists")
    .select("product_id, products(category_id)")
    .eq("user_id", userId);

  const { data: orders } = await supabase
    .from("orders")
    .select("order_items(product_id, products(category_id))")
    .eq("user_id", userId);

  const categoryScores = new Map<string, number>();

  if (wishlist) {
    for (const item of wishlist) {
      const categoryId = item.products?.category_id;
      if (categoryId) {
        categoryScores.set(categoryId, (categoryScores.get(categoryId) || 0) + 2);
      }
    }
  }

  if (orders) {
    for (const order of orders) {
      if (order.order_items) {
        for (const item of order.order_items) {
          const categoryId = item.products?.category_id;
          if (categoryId) {
            categoryScores.set(categoryId, (categoryScores.get(categoryId) || 0) + 1);
          }
        }
      }
    }
  }

  const topCategories = Array.from(categoryScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([categoryId]) => categoryId);

  if (topCategories.length === 0) {
    const { data: popularProducts } = await supabase
      .from("products")
      .select("id")
      .eq("status", "active")
      .order("view_count", { ascending: false })
      .limit(5);

    if (popularProducts) {
      await supabase.from("ai_recommendations").delete().eq("user_id", userId);

      const recommendations = popularProducts.map((p: any) => ({
        user_id: userId,
        product_id: p.id,
        score: 0.7,
        reason: "Popular product",
      }));

      await supabase.from("ai_recommendations").insert(recommendations);
      return { count: recommendations.length };
    }

    return { count: 0 };
  }

  const { data: recommendedProducts } = await supabase
    .from("products")
    .select("id, category_id")
    .in("category_id", topCategories)
    .eq("status", "active")
    .order("rating", { ascending: false })
    .limit(10);

  if (recommendedProducts && recommendedProducts.length > 0) {
    await supabase.from("ai_recommendations").delete().eq("user_id", userId);

    const recommendations = recommendedProducts.map((p: any) => {
      const categoryScore = categoryScores.get(p.category_id) || 0;
      const maxScore = Math.max(...Array.from(categoryScores.values()));
      const score = categoryScore / maxScore;

      return {
        user_id: userId,
        product_id: p.id,
        score: Math.min(score, 1),
        reason: "Based on your interests",
      };
    });

    await supabase.from("ai_recommendations").insert(recommendations);
    return { count: recommendations.length };
  }

  return { count: 0 };
}

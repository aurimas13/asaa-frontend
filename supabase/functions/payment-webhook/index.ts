import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, Stripe-Signature",
};

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

    const url = new URL(req.url);
    const isStripe = req.headers.get("Stripe-Signature") !== null;
    const isPaysera = url.searchParams.has("data");

    if (isStripe) {
      const stripeSignature = req.headers.get("Stripe-Signature");
      const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
      const body = await req.text();

      if (!stripeWebhookSecret) {
        console.error("Stripe webhook secret not configured");
        return new Response(JSON.stringify({ error: "Webhook not configured" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const event = JSON.parse(body);

      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const orderId = session.metadata?.order_id;

        if (orderId) {
          const { data: order } = await supabaseClient
            .from("orders")
            .select("*, profiles(email, full_name)")
            .eq("id", orderId)
            .single();

          if (order) {
            await supabaseClient
              .from("orders")
              .update({
                status: "processing",
                notes: JSON.stringify({
                  ...JSON.parse(order.notes || "{}"),
                  payment_completed: true,
                  payment_id: session.payment_intent,
                  paid_at: new Date().toISOString(),
                }),
              })
              .eq("id", orderId);

            const supabaseUrl = Deno.env.get("SUPABASE_URL");
            const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

            if (order.profiles?.email) {
              await fetch(`${supabaseUrl}/functions/v1/send-email`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${serviceRoleKey}`,
                },
                body: JSON.stringify({
                  to: order.profiles.email,
                  subject: `Mokejimas gautas - Uzsakymas #${order.order_number}`,
                  type: "order_status",
                  data: {
                    orderNumber: order.order_number,
                    status: "Apmoketa / Apdorojama",
                  },
                }),
              });
            }
          }
        }
      }

      if (event.type === "checkout.session.expired") {
        const session = event.data.object;
        const orderId = session.metadata?.order_id;

        if (orderId) {
          await supabaseClient
            .from("orders")
            .update({ status: "payment_failed" })
            .eq("id", orderId);
        }
      }

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (isPaysera) {
      const data = url.searchParams.get("data");
      const ss1 = url.searchParams.get("ss1");
      const ss2 = url.searchParams.get("ss2");

      if (!data) {
        return new Response(JSON.stringify({ error: "Missing data" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let payseraData;
      try {
        payseraData = JSON.parse(atob(data));
      } catch {
        return new Response(JSON.stringify({ error: "Invalid data format" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const orderNumber = payseraData.orderid;
      const status = payseraData.status;

      const { data: order } = await supabaseClient
        .from("orders")
        .select("*, profiles(email, full_name)")
        .eq("order_number", orderNumber)
        .single();

      if (order) {
        if (status === "1" || status === 1) {
          await supabaseClient
            .from("orders")
            .update({
              status: "processing",
              notes: JSON.stringify({
                ...JSON.parse(order.notes || "{}"),
                payment_completed: true,
                paysera_request_id: payseraData.requestid,
                paid_at: new Date().toISOString(),
              }),
            })
            .eq("id", order.id);

          const supabaseUrl = Deno.env.get("SUPABASE_URL");
          const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

          if (order.profiles?.email) {
            await fetch(`${supabaseUrl}/functions/v1/send-email`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${serviceRoleKey}`,
              },
              body: JSON.stringify({
                to: order.profiles.email,
                subject: `Mokejimas gautas - Uzsakymas #${order.order_number}`,
                type: "order_status",
                data: {
                  orderNumber: order.order_number,
                  status: "Apmoketa / Apdorojama",
                },
              }),
            });
          }
        } else {
          await supabaseClient
            .from("orders")
            .update({ status: "payment_failed" })
            .eq("id", order.id);
        }
      }

      return new Response("OK", {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown webhook source" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({
        error: "Webhook processing failed",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

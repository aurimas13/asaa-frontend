import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CheckoutPayload {
  provider: 'stripe' | 'paysera';
  order_id: string;
  amount: number;
  currency: string;
  success_url: string;
  cancel_url: string;
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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const payload: CheckoutPayload = await req.json();

    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .select("*")
      .eq("id", payload.order_id)
      .eq("user_id", user.id)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("email, full_name")
      .eq("id", user.id)
      .single();

    if (payload.provider === 'stripe') {
      const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");

      if (!stripeSecretKey) {
        return new Response(
          JSON.stringify({
            error: "Stripe not configured",
            message: "Payment processing is not yet available. Please contact support.",
          }),
          {
            status: 503,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${stripeSecretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          "mode": "payment",
          "success_url": payload.success_url,
          "cancel_url": payload.cancel_url,
          "customer_email": profile?.email || user.email || "",
          "line_items[0][price_data][currency]": payload.currency.toLowerCase(),
          "line_items[0][price_data][product_data][name]": `Order #${order.order_number}`,
          "line_items[0][price_data][product_data][description]": "Crafts And Hands - Lithuanian Handcrafted Products",
          "line_items[0][price_data][unit_amount]": Math.round(payload.amount * 100).toString(),
          "line_items[0][quantity]": "1",
          "metadata[order_id]": payload.order_id,
          "metadata[order_number]": order.order_number,
        }),
      });

      if (!stripeResponse.ok) {
        const stripeError = await stripeResponse.json();
        console.error("Stripe error:", stripeError);
        return new Response(
          JSON.stringify({ error: "Failed to create Stripe session", details: stripeError }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const stripeSession = await stripeResponse.json();

      await supabaseClient
        .from("orders")
        .update({
          status: "awaiting_payment",
          notes: JSON.stringify({
            ...JSON.parse(order.notes || "{}"),
            payment_provider: "stripe",
            stripe_session_id: stripeSession.id,
          }),
        })
        .eq("id", payload.order_id);

      return new Response(
        JSON.stringify({ sessionUrl: stripeSession.url }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (payload.provider === 'paysera') {
      const payseraProjectId = Deno.env.get("PAYSERA_PROJECT_ID");
      const payseraPassword = Deno.env.get("PAYSERA_PASSWORD");

      if (!payseraProjectId || !payseraPassword) {
        return new Response(
          JSON.stringify({
            error: "Paysera not configured",
            message: "This payment method is not yet available. Please use card payment.",
          }),
          {
            status: 503,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const payseraData = {
        projectid: payseraProjectId,
        orderid: order.order_number,
        accepturl: payload.success_url,
        cancelurl: payload.cancel_url,
        callbackurl: `${Deno.env.get("SUPABASE_URL")}/functions/v1/payment-webhook`,
        amount: Math.round(payload.amount * 100),
        currency: "EUR",
        country: "LT",
        p_email: profile?.email || user.email,
        p_firstname: profile?.full_name?.split(" ")[0] || "",
        p_lastname: profile?.full_name?.split(" ").slice(1).join(" ") || "",
        test: Deno.env.get("PAYSERA_TEST_MODE") === "true" ? 1 : 0,
      };

      const dataString = btoa(JSON.stringify(payseraData));
      const sign = await createPayseraSign(dataString, payseraPassword);

      const payseraUrl = `https://www.paysera.com/pay/?data=${encodeURIComponent(dataString)}&sign=${encodeURIComponent(sign)}`;

      await supabaseClient
        .from("orders")
        .update({
          status: "awaiting_payment",
          notes: JSON.stringify({
            ...JSON.parse(order.notes || "{}"),
            payment_provider: "paysera",
          }),
        })
        .eq("id", payload.order_id);

      return new Response(
        JSON.stringify({ sessionUrl: payseraUrl }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid payment provider" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to create checkout session",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function createPayseraSign(data: string, password: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(password);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "MD5" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const PLATFORM_FEE_PERCENT = 10;
const IMMEDIATE_PAYOUT_PERCENT = 85;
const RESERVE_DAYS = 30;

interface CheckoutPayload {
  provider: 'stripe' | 'paysera';
  order_id: string;
  amount: number;
  currency: string;
  success_url: string;
  cancel_url: string;
}

interface OrderItem {
  id: string;
  maker_id: string;
  quantity: number;
  price: number;
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

    const { data: orderItems } = await supabaseClient
      .from("order_items")
      .select("id, maker_id, quantity, price")
      .eq("order_id", payload.order_id);

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

      const makerIds = [...new Set((orderItems || []).map(item => item.maker_id))];
      const { data: stripeAccounts } = await supabaseClient
        .from("stripe_accounts")
        .select("maker_id, stripe_account_id, charges_enabled")
        .in("maker_id", makerIds)
        .eq("charges_enabled", true);

      const stripeAccountMap = new Map(
        (stripeAccounts || []).map(acc => [acc.maker_id, acc.stripe_account_id])
      );

      const makersWithoutStripe = makerIds.filter(id => !stripeAccountMap.has(id));

      const transferGroups: { makerId: string; stripeAccountId: string; amount: number; items: OrderItem[] }[] = [];
      let platformAmount = 0;

      for (const item of (orderItems || [])) {
        const itemTotal = item.price * item.quantity;
        const stripeAccountId = stripeAccountMap.get(item.maker_id);

        if (stripeAccountId) {
          const existing = transferGroups.find(g => g.makerId === item.maker_id);
          if (existing) {
            existing.amount += itemTotal;
            existing.items.push(item);
          } else {
            transferGroups.push({
              makerId: item.maker_id,
              stripeAccountId,
              amount: itemTotal,
              items: [item],
            });
          }
        } else {
          platformAmount += itemTotal;
        }
      }

      const shippingCost = order.shipping_cost || 0;
      platformAmount += shippingCost;

      const transferData = transferGroups.map(group => {
        const fee = Math.round(group.amount * PLATFORM_FEE_PERCENT / 100);
        const netAmount = group.amount - fee;
        const immediateAmount = Math.round(netAmount * IMMEDIATE_PAYOUT_PERCENT / 100);
        const reserveAmount = netAmount - immediateAmount;

        return {
          ...group,
          platformFee: fee,
          netAmount,
          immediateAmount,
          reserveAmount,
        };
      });

      const lineItems: Record<string, string>[] = [];
      lineItems.push({
        "price_data[currency]": payload.currency.toLowerCase(),
        "price_data[product_data][name]": `Order #${order.order_number}`,
        "price_data[product_data][description]": "Crafts And Hands - Lithuanian Handcrafted Products",
        "price_data[unit_amount]": Math.round(payload.amount * 100).toString(),
        "quantity": "1",
      });

      const formParams = new URLSearchParams({
        "mode": "payment",
        "success_url": payload.success_url,
        "cancel_url": payload.cancel_url,
        "customer_email": profile?.email || user.email || "",
        "metadata[order_id]": payload.order_id,
        "metadata[order_number]": order.order_number,
        "payment_intent_data[metadata][order_id]": payload.order_id,
        "payment_intent_data[metadata][order_number]": order.order_number,
      });

      formParams.append("line_items[0][price_data][currency]", payload.currency.toLowerCase());
      formParams.append("line_items[0][price_data][product_data][name]", `Order #${order.order_number}`);
      formParams.append("line_items[0][price_data][product_data][description]", "Crafts And Hands - Lithuanian Handcrafted Products");
      formParams.append("line_items[0][price_data][unit_amount]", Math.round(payload.amount * 100).toString());
      formParams.append("line_items[0][quantity]", "1");

      const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${stripeSecretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formParams,
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
            transfer_data: transferData.map(t => ({
              maker_id: t.makerId,
              stripe_account_id: t.stripeAccountId,
              gross_amount: t.amount,
              platform_fee: t.platformFee,
              immediate_amount: t.immediateAmount,
              reserve_amount: t.reserveAmount,
              items: t.items.map(i => i.id),
            })),
            makers_without_stripe: makersWithoutStripe,
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

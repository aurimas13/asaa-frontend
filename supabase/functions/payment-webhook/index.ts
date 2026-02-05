import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, Stripe-Signature",
};

const PLATFORM_FEE_PERCENT = 10;
const IMMEDIATE_PAYOUT_PERCENT = 85;
const RESERVE_DAYS = 30;

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

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const url = new URL(req.url);
    const isStripe = req.headers.get("Stripe-Signature") !== null;
    const isPaysera = url.searchParams.has("data");

    if (isStripe) {
      const body = await req.text();
      const event = JSON.parse(body);

      console.log("Stripe webhook event:", event.type);

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
            const notes = JSON.parse(order.notes || "{}");
            const paymentIntentId = session.payment_intent;

            await supabaseClient
              .from("orders")
              .update({
                status: "processing",
                payment_status: "paid",
                stripe_payment_intent_id: paymentIntentId,
                notes: JSON.stringify({
                  ...notes,
                  payment_completed: true,
                  payment_id: paymentIntentId,
                  paid_at: new Date().toISOString(),
                }),
              })
              .eq("id", orderId);

            if (stripeSecretKey && notes.transfer_data) {
              await processTransfers(
                supabaseClient,
                stripeSecretKey,
                orderId,
                paymentIntentId,
                notes.transfer_data
              );
            }

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
                  subject: `Payment Received - Order #${order.order_number}`,
                  type: "order_status",
                  data: {
                    orderNumber: order.order_number,
                    status: "Paid / Processing",
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
            .update({ status: "payment_failed", payment_status: "failed" })
            .eq("id", orderId);
        }
      }

      if (event.type === "charge.refunded") {
        const charge = event.data.object;
        const paymentIntentId = charge.payment_intent;

        if (paymentIntentId) {
          const { data: order } = await supabaseClient
            .from("orders")
            .select("id")
            .eq("stripe_payment_intent_id", paymentIntentId)
            .maybeSingle();

          if (order) {
            const refundAmount = charge.amount_refunded / 100;

            await supabaseClient
              .from("orders")
              .update({
                status: "refunded",
                payment_status: "refunded",
                refund_amount: refundAmount,
              })
              .eq("id", order.id);

            await supabaseClient
              .from("stripe_transfers")
              .update({ status: "refunded" })
              .eq("order_id", order.id);
          }
        }
      }

      if (event.type === "account.updated") {
        const account = event.data.object;
        const stripeAccountId = account.id;

        const newStatus = account.charges_enabled && account.payouts_enabled
          ? 'active'
          : account.details_submitted
            ? 'restricted'
            : 'pending';

        await supabaseClient
          .from("stripe_accounts")
          .update({
            charges_enabled: account.charges_enabled,
            payouts_enabled: account.payouts_enabled,
            details_submitted: account.details_submitted,
            account_status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_account_id", stripeAccountId);
      }

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (isPaysera) {
      const data = url.searchParams.get("data");

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
              payment_status: "paid",
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
                subject: `Payment Received - Order #${order.order_number}`,
                type: "order_status",
                data: {
                  orderNumber: order.order_number,
                  status: "Paid / Processing",
                },
              }),
            });
          }
        } else {
          await supabaseClient
            .from("orders")
            .update({ status: "payment_failed", payment_status: "failed" })
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

interface TransferData {
  maker_id: string;
  stripe_account_id: string;
  gross_amount: number;
  platform_fee: number;
  immediate_amount: number;
  reserve_amount: number;
  items: string[];
}

async function processTransfers(
  supabaseClient: any,
  stripeSecretKey: string,
  orderId: string,
  paymentIntentId: string,
  transferDataList: TransferData[]
) {
  const reserveReleaseDate = new Date();
  reserveReleaseDate.setDate(reserveReleaseDate.getDate() + RESERVE_DAYS);

  for (const transferData of transferDataList) {
    try {
      const immediateAmountCents = Math.round(transferData.immediate_amount * 100);

      let immediateTransferId = null;

      if (immediateAmountCents > 0) {
        const transferResponse = await fetch("https://api.stripe.com/v1/transfers", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${stripeSecretKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            "amount": immediateAmountCents.toString(),
            "currency": "eur",
            "destination": transferData.stripe_account_id,
            "transfer_group": orderId,
            "metadata[order_id]": orderId,
            "metadata[maker_id]": transferData.maker_id,
            "metadata[type]": "immediate",
          }),
        });

        if (transferResponse.ok) {
          const transfer = await transferResponse.json();
          immediateTransferId = transfer.id;
          console.log(`Immediate transfer created: ${transfer.id} for maker ${transferData.maker_id}`);
        } else {
          const error = await transferResponse.json();
          console.error(`Transfer failed for maker ${transferData.maker_id}:`, error);
        }
      }

      for (const itemId of transferData.items) {
        await supabaseClient
          .from("stripe_transfers")
          .insert({
            order_id: orderId,
            order_item_id: itemId,
            maker_id: transferData.maker_id,
            stripe_account_id: transferData.stripe_account_id,
            gross_amount: transferData.gross_amount / transferData.items.length,
            platform_fee: transferData.platform_fee / transferData.items.length,
            immediate_amount: transferData.immediate_amount / transferData.items.length,
            reserve_amount: transferData.reserve_amount / transferData.items.length,
            immediate_transfer_id: immediateTransferId,
            reserve_release_date: reserveReleaseDate.toISOString(),
            reserve_released: false,
            status: immediateTransferId ? 'immediate_sent' : 'pending',
            currency: 'eur',
          });
      }

    } catch (error) {
      console.error(`Error processing transfer for maker ${transferData.maker_id}:`, error);

      for (const itemId of transferData.items) {
        await supabaseClient
          .from("stripe_transfers")
          .insert({
            order_id: orderId,
            order_item_id: itemId,
            maker_id: transferData.maker_id,
            stripe_account_id: transferData.stripe_account_id,
            gross_amount: transferData.gross_amount / transferData.items.length,
            platform_fee: transferData.platform_fee / transferData.items.length,
            immediate_amount: transferData.immediate_amount / transferData.items.length,
            reserve_amount: transferData.reserve_amount / transferData.items.length,
            reserve_release_date: reserveReleaseDate.toISOString(),
            reserve_released: false,
            status: 'failed',
            currency: 'eur',
            error_message: error instanceof Error ? error.message : 'Unknown error',
          });
      }
    }
  }
}

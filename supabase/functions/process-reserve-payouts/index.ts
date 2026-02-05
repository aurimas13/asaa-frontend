import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      return new Response(
        JSON.stringify({ error: "Stripe not configured" }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

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

    const now = new Date().toISOString();

    const { data: pendingTransfers, error: fetchError } = await supabaseClient
      .from("stripe_transfers")
      .select("*")
      .eq("reserve_released", false)
      .eq("status", "immediate_sent")
      .lte("reserve_release_date", now)
      .gt("reserve_amount", 0);

    if (fetchError) {
      console.error("Error fetching pending transfers:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch pending transfers" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!pendingTransfers || pendingTransfers.length === 0) {
      return new Response(
        JSON.stringify({ message: "No reserves to release", processed: 0 }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const results = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: [] as string[],
    };

    const transfersByMaker = new Map<string, typeof pendingTransfers>();
    for (const transfer of pendingTransfers) {
      const key = `${transfer.maker_id}_${transfer.stripe_account_id}`;
      if (!transfersByMaker.has(key)) {
        transfersByMaker.set(key, []);
      }
      transfersByMaker.get(key)!.push(transfer);
    }

    for (const [key, transfers] of transfersByMaker) {
      const totalReserveAmount = transfers.reduce((sum, t) => sum + Number(t.reserve_amount), 0);
      const reserveAmountCents = Math.round(totalReserveAmount * 100);

      if (reserveAmountCents <= 0) {
        continue;
      }

      const stripeAccountId = transfers[0].stripe_account_id;
      const makerId = transfers[0].maker_id;
      const transferIds = transfers.map(t => t.id);

      try {
        const transferResponse = await fetch("https://api.stripe.com/v1/transfers", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${stripeSecretKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            "amount": reserveAmountCents.toString(),
            "currency": "eur",
            "destination": stripeAccountId,
            "metadata[maker_id]": makerId,
            "metadata[type]": "reserve_release",
            "metadata[transfer_ids]": transferIds.join(","),
          }),
        });

        if (transferResponse.ok) {
          const stripeTransfer = await transferResponse.json();

          await supabaseClient
            .from("stripe_transfers")
            .update({
              reserve_released: true,
              reserve_transfer_id: stripeTransfer.id,
              status: "completed",
              updated_at: new Date().toISOString(),
            })
            .in("id", transferIds);

          results.succeeded += transfers.length;
          console.log(`Released reserve of ${totalReserveAmount} EUR to maker ${makerId}`);
        } else {
          const error = await transferResponse.json();
          console.error(`Reserve transfer failed for maker ${makerId}:`, error);

          await supabaseClient
            .from("stripe_transfers")
            .update({
              error_message: `Reserve release failed: ${error.error?.message || 'Unknown error'}`,
              updated_at: new Date().toISOString(),
            })
            .in("id", transferIds);

          results.failed += transfers.length;
          results.errors.push(`Maker ${makerId}: ${error.error?.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error(`Error releasing reserve for maker ${makerId}:`, error);
        results.failed += transfers.length;
        results.errors.push(`Maker ${makerId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      results.processed += transfers.length;
    }

    return new Response(
      JSON.stringify({
        message: "Reserve payout processing completed",
        ...results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Reserve payout error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process reserve payouts",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

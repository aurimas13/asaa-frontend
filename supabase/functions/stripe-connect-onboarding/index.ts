import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface OnboardingPayload {
  action: 'create' | 'refresh' | 'status' | 'dashboard';
  return_url?: string;
  refresh_url?: string;
}

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

    const { data: maker } = await supabaseClient
      .from("makers")
      .select("id, business_name, user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!maker) {
      return new Response(
        JSON.stringify({ error: "Not a registered maker" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("email, full_name")
      .eq("id", user.id)
      .single();

    const payload: OnboardingPayload = await req.json();
    const baseUrl = Deno.env.get("SITE_URL") || "https://craftsandhands.com";

    const { data: existingAccount } = await supabaseClient
      .from("stripe_accounts")
      .select("*")
      .eq("maker_id", maker.id)
      .maybeSingle();

    if (payload.action === 'status') {
      if (!existingAccount) {
        return new Response(
          JSON.stringify({
            connected: false,
            account_status: null,
            charges_enabled: false,
            payouts_enabled: false,
            details_submitted: false,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const accountResponse = await fetch(
        `https://api.stripe.com/v1/accounts/${existingAccount.stripe_account_id}`,
        {
          headers: {
            "Authorization": `Bearer ${stripeSecretKey}`,
          },
        }
      );

      if (accountResponse.ok) {
        const stripeAccount = await accountResponse.json();

        const newStatus = stripeAccount.charges_enabled && stripeAccount.payouts_enabled
          ? 'active'
          : stripeAccount.details_submitted
            ? 'restricted'
            : 'pending';

        if (
          existingAccount.charges_enabled !== stripeAccount.charges_enabled ||
          existingAccount.payouts_enabled !== stripeAccount.payouts_enabled ||
          existingAccount.details_submitted !== stripeAccount.details_submitted ||
          existingAccount.account_status !== newStatus
        ) {
          await supabaseClient
            .from("stripe_accounts")
            .update({
              charges_enabled: stripeAccount.charges_enabled,
              payouts_enabled: stripeAccount.payouts_enabled,
              details_submitted: stripeAccount.details_submitted,
              account_status: newStatus,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingAccount.id);
        }

        return new Response(
          JSON.stringify({
            connected: true,
            account_status: newStatus,
            charges_enabled: stripeAccount.charges_enabled,
            payouts_enabled: stripeAccount.payouts_enabled,
            details_submitted: stripeAccount.details_submitted,
            requirements: stripeAccount.requirements,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({
          connected: true,
          account_status: existingAccount.account_status,
          charges_enabled: existingAccount.charges_enabled,
          payouts_enabled: existingAccount.payouts_enabled,
          details_submitted: existingAccount.details_submitted,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (payload.action === 'dashboard') {
      if (!existingAccount) {
        return new Response(
          JSON.stringify({ error: "No connected Stripe account" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const loginLinkResponse = await fetch(
        `https://api.stripe.com/v1/accounts/${existingAccount.stripe_account_id}/login_links`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${stripeSecretKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (!loginLinkResponse.ok) {
        const error = await loginLinkResponse.json();
        return new Response(
          JSON.stringify({ error: "Failed to create dashboard link", details: error }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const loginLink = await loginLinkResponse.json();

      return new Response(
        JSON.stringify({ url: loginLink.url }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (payload.action === 'create' || payload.action === 'refresh') {
      let stripeAccountId = existingAccount?.stripe_account_id;

      if (!stripeAccountId) {
        const accountResponse = await fetch("https://api.stripe.com/v1/accounts", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${stripeSecretKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            "type": "express",
            "country": "LT",
            "email": profile?.email || user.email || "",
            "business_type": "individual",
            "capabilities[card_payments][requested]": "true",
            "capabilities[transfers][requested]": "true",
            "business_profile[name]": maker.business_name,
            "business_profile[product_description]": "Traditional Lithuanian handcrafted products",
            "metadata[maker_id]": maker.id,
            "metadata[user_id]": user.id,
          }),
        });

        if (!accountResponse.ok) {
          const error = await accountResponse.json();
          console.error("Stripe account creation error:", error);
          return new Response(
            JSON.stringify({ error: "Failed to create Stripe account", details: error }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const newAccount = await accountResponse.json();
        stripeAccountId = newAccount.id;

        await supabaseClient
          .from("stripe_accounts")
          .insert({
            maker_id: maker.id,
            stripe_account_id: stripeAccountId,
            account_status: 'pending',
            charges_enabled: false,
            payouts_enabled: false,
            details_submitted: false,
          });
      }

      const returnUrl = payload.return_url || `${baseUrl}/profile?stripe=success`;
      const refreshUrl = payload.refresh_url || `${baseUrl}/profile?stripe=refresh`;

      const linkResponse = await fetch("https://api.stripe.com/v1/account_links", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${stripeSecretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          "account": stripeAccountId,
          "refresh_url": refreshUrl,
          "return_url": returnUrl,
          "type": "account_onboarding",
        }),
      });

      if (!linkResponse.ok) {
        const error = await linkResponse.json();
        console.error("Account link creation error:", error);
        return new Response(
          JSON.stringify({ error: "Failed to create onboarding link", details: error }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const accountLink = await linkResponse.json();

      await supabaseClient
        .from("stripe_accounts")
        .update({
          onboarding_url: accountLink.url,
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_account_id", stripeAccountId);

      return new Response(
        JSON.stringify({ url: accountLink.url }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Stripe Connect error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process Stripe Connect request",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

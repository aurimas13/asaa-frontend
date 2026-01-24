import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface OrderItem {
  product_id: string;
  quantity: number;
  customization_details?: Record<string, any>;
}

interface OrderPayload {
  items: OrderItem[];
  shipping_address: Record<string, any>;
  billing_address: Record<string, any>;
  shipping_method?: string;
  notes?: string;
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

    const payload: OrderPayload = await req.json();

    if (!payload.items || payload.items.length === 0) {
      return new Response(
        JSON.stringify({ error: "No items in order" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!payload.shipping_address || !payload.billing_address) {
      return new Response(
        JSON.stringify({ error: "Missing address information" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const productIds = payload.items.map(item => item.product_id);
    const { data: products, error: productsError } = await supabaseClient
      .from("products")
      .select("id, title, price, stock_quantity, maker_id, makers(business_name, user_id, profiles(email))")
      .in("id", productIds);

    if (productsError || !products) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch products" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    for (const item of payload.items) {
      const product = products.find(p => p.id === item.product_id);
      if (!product) {
        return new Response(
          JSON.stringify({ error: `Product ${item.product_id} not found` }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (product.stock_quantity < item.quantity) {
        return new Response(
          JSON.stringify({
            error: `Insufficient stock for ${product.title}`,
            available: product.stock_quantity,
            requested: item.quantity,
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    let totalAmount = 0;
    for (const item of payload.items) {
      const product = products.find(p => p.id === item.product_id);
      if (product) {
        totalAmount += product.price * item.quantity;
      }
    }

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        status: "pending",
        total_amount: totalAmount,
        currency: "EUR",
        shipping_address: payload.shipping_address,
        billing_address: payload.billing_address,
        shipping_method: payload.shipping_method || "standard",
        notes: payload.notes,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error("Order creation error:", orderError);
      return new Response(
        JSON.stringify({ error: "Failed to create order" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const orderItems = payload.items.map(item => {
      const product = products.find(p => p.id === item.product_id);
      return {
        order_id: order.id,
        product_id: item.product_id,
        maker_id: product?.maker_id,
        quantity: item.quantity,
        price: product?.price || 0,
        customization_details: item.customization_details,
      };
    });

    const { error: itemsError } = await supabaseClient
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Order items error:", itemsError);
      return new Response(
        JSON.stringify({ error: "Failed to create order items" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    for (const item of payload.items) {
      const product = products.find(p => p.id === item.product_id);
      if (product) {
        await supabaseClient
          .from("products")
          .update({
            stock_quantity: product.stock_quantity - item.quantity,
          })
          .eq("id", item.product_id);
      }
    }

    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("email, full_name")
      .eq("id", user.id)
      .single();

    const emailPromises = [];

    if (profile?.email) {
      const customerEmailPromise = fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": authHeader,
          },
          body: JSON.stringify({
            to: profile.email,
            subject: "Order Confirmation",
            type: "order_confirmation",
            data: {
              orderNumber: orderNumber,
              totalAmount: totalAmount.toFixed(2),
              status: "pending",
            },
          }),
        }
      ).catch(err => console.error("Customer email error:", err));

      emailPromises.push(customerEmailPromise);
    }

    const makerEmails = new Map();
    for (const item of payload.items) {
      const product = products.find(p => p.id === item.product_id);
      if (product && product.makers) {
        const makerData = product.makers as any;
        const makerEmail = makerData.profiles?.email;
        if (makerEmail && !makerEmails.has(makerEmail)) {
          makerEmails.set(makerEmail, {
            email: makerEmail,
            business: makerData.business_name,
            items: [],
          });
        }
        if (makerEmail) {
          makerEmails.get(makerEmail).items.push({
            title: product.title,
            quantity: item.quantity,
            price: product.price,
          });
        }
      }
    }

    for (const [email, data] of makerEmails) {
      const makerEmailPromise = fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": authHeader,
          },
          body: JSON.stringify({
            to: email,
            subject: "New Order Received",
            type: "maker_notification",
            data: {
              orderNumber: orderNumber,
              productTitle: data.items.map((i: any) => i.title).join(", "),
              quantity: data.items.reduce((sum: number, i: any) => sum + i.quantity, 0),
              amount: data.items.reduce((sum: number, i: any) => sum + (i.price * i.quantity), 0).toFixed(2),
            },
          }),
        }
      ).catch(err => console.error("Maker email error:", err));

      emailPromises.push(makerEmailPromise);
    }

    await Promise.allSettled(emailPromises);

    await supabaseClient
      .from("carts")
      .delete()
      .eq("user_id", user.id);

    return new Response(
      JSON.stringify({
        success: true,
        order: {
          id: order.id,
          order_number: orderNumber,
          total_amount: totalAmount,
          status: order.status,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Order processing error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process order",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

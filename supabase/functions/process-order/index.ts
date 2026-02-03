import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const COMPANY_EMAIL = "craftsandhands@pm.me";

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
  shipping_cost?: number;
  shipping_zone_id?: string;
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
      .select("id, title, price, stock_quantity, maker_id, makers(id, business_name, user_id)")
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

    let subtotal = 0;
    const orderItemsData: any[] = [];
    for (const item of payload.items) {
      const product = products.find(p => p.id === item.product_id);
      if (product) {
        subtotal += product.price * item.quantity;
        orderItemsData.push({
          product_id: item.product_id,
          maker_id: product.maker_id,
          quantity: item.quantity,
          price: product.price,
          customization_details: item.customization_details,
          title: product.title,
          maker_name: (product.makers as any)?.business_name,
        });
      }
    }

    const shippingCost = payload.shipping_cost || 0;
    const totalAmount = subtotal + shippingCost;

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
        shipping_cost: shippingCost,
        shipping_zone_id: payload.shipping_zone_id,
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

    const orderItems = orderItemsData.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      maker_id: item.maker_id,
      quantity: item.quantity,
      price: item.price,
      customization_details: item.customization_details,
    }));

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
      .select("email, full_name, phone")
      .eq("id", user.id)
      .single();

    const emailPromises = [];
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const shippingMethodLabel = payload.shipping_method === 'express' ? 'Express (1-2 days)' :
      payload.shipping_method === 'economy' ? 'Economy (5-10 days)' : 'Standard (3-5 days)';

    if (profile?.email) {
      const customerEmailPromise = fetch(
        `${supabaseUrl}/functions/v1/send-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${serviceRoleKey}`,
          },
          body: JSON.stringify({
            to: profile.email,
            subject: `Užsakymas patvirtintas #${orderNumber}`,
            type: "order_confirmation",
            data: {
              orderNumber: orderNumber,
              totalAmount: totalAmount.toFixed(2),
              status: "Laukiama apmokėjimo / Pending",
              shippingMethod: shippingMethodLabel,
              estimatedDelivery: payload.shipping_method === 'express' ? '1-2 darbo dienos' :
                payload.shipping_method === 'economy' ? '5-10 darbo dienų' : '3-5 darbo dienos',
              items: orderItemsData.map(item => ({
                title: item.title,
                quantity: item.quantity,
                price: item.price,
              })),
              shippingAddress: payload.shipping_address,
            },
          }),
        }
      ).catch(err => console.error("Customer email error:", err));

      emailPromises.push(customerEmailPromise);
    }

    const makerGroups = new Map<string, any>();
    for (const item of orderItemsData) {
      if (item.maker_id) {
        if (!makerGroups.has(item.maker_id)) {
          makerGroups.set(item.maker_id, {
            maker_id: item.maker_id,
            maker_name: item.maker_name,
            items: [],
            totalAmount: 0,
          });
        }
        const group = makerGroups.get(item.maker_id);
        group.items.push(item);
        group.totalAmount += item.price * item.quantity;
      }
    }

    for (const [makerId, data] of makerGroups) {
      const { data: makerProfile } = await supabaseClient
        .from("makers")
        .select("user_id")
        .eq("id", makerId)
        .single();

      if (makerProfile?.user_id) {
        const { data: makerUser } = await supabaseClient
          .from("profiles")
          .select("email")
          .eq("id", makerProfile.user_id)
          .single();

        if (makerUser?.email) {
          const makerEmailPromise = fetch(
            `${supabaseUrl}/functions/v1/send-email`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${serviceRoleKey}`,
              },
              body: JSON.stringify({
                to: makerUser.email,
                subject: `Naujas užsakymas #${orderNumber}`,
                type: "maker_notification",
                data: {
                  orderNumber: orderNumber,
                  productTitle: data.items.map((i: any) => i.title).join(", "),
                  quantity: data.items.reduce((sum: number, i: any) => sum + i.quantity, 0),
                  amount: data.totalAmount.toFixed(2),
                  shippingAddress: payload.shipping_address,
                },
              }),
            }
          ).catch(err => console.error("Maker email error:", err));

          emailPromises.push(makerEmailPromise);
        }
      }
    }

    const companyEmailPromise = fetch(
      `${supabaseUrl}/functions/v1/send-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({
          to: COMPANY_EMAIL,
          subject: `[NAUJAS UŽSAKYMAS] #${orderNumber} - €${totalAmount.toFixed(2)}`,
          type: "company_notification",
          data: {
            orderNumber: orderNumber,
            customerName: profile?.full_name || payload.shipping_address.full_name,
            customerEmail: profile?.email || user.email,
            customerPhone: profile?.phone || payload.shipping_address.phone,
            totalAmount: totalAmount.toFixed(2),
            itemCount: payload.items.reduce((sum, i) => sum + i.quantity, 0),
            shippingMethod: shippingMethodLabel,
            makers: Array.from(makerGroups.values()).map((m: any) => m.maker_name),
            shippingAddress: payload.shipping_address,
          },
        }),
      }
    ).catch(err => console.error("Company email error:", err));

    emailPromises.push(companyEmailPromise);

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

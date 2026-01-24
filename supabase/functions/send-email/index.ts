import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailPayload {
  to: string;
  subject: string;
  type: 'order_confirmation' | 'order_status' | 'welcome' | 'event_reminder' | 'maker_notification';
  data: Record<string, any>;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const payload: EmailPayload = await req.json();
    const { to, subject, type, data } = payload;

    if (!to || !subject || !type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, type' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const emailContent = generateEmailContent(type, data);

    const emailData = {
      to,
      subject,
      html: emailContent.html,
      text: emailContent.text,
    };

    console.log('Sending email:', { to, subject, type });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email sent successfully',
        details: emailData
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Email sending error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function generateEmailContent(type: string, data: Record<string, any>) {
  switch (type) {
    case 'order_confirmation':
      return {
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2d3748;">Order Confirmation</h1>
            <p>Thank you for your order!</p>
            <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #2d3748;">Order #${data.orderNumber}</h2>
              <p><strong>Total:</strong> €${data.totalAmount}</p>
              <p><strong>Status:</strong> ${data.status}</p>
            </div>
            <p>You will receive a shipping notification once your order is on its way.</p>
            <p style="color: #718096; font-size: 14px;">Best regards,<br>Crafts & Hands Team</p>
          </div>
        `,
        text: `Order Confirmation\n\nThank you for your order!\n\nOrder #${data.orderNumber}\nTotal: €${data.totalAmount}\nStatus: ${data.status}\n\nYou will receive a shipping notification once your order is on its way.\n\nBest regards,\nCrafts & Hands Team`
      };

    case 'order_status':
      return {
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2d3748;">Order Status Update</h1>
            <p>Your order status has been updated!</p>
            <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #2d3748;">Order #${data.orderNumber}</h2>
              <p><strong>New Status:</strong> ${data.status}</p>
              ${data.trackingNumber ? `<p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>` : ''}
            </div>
            <p style="color: #718096; font-size: 14px;">Best regards,<br>Crafts & Hands Team</p>
          </div>
        `,
        text: `Order Status Update\n\nYour order status has been updated!\n\nOrder #${data.orderNumber}\nNew Status: ${data.status}\n${data.trackingNumber ? `Tracking Number: ${data.trackingNumber}\n` : ''}\nBest regards,\nCrafts & Hands Team`
      };

    case 'welcome':
      return {
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2d3748;">Welcome to Crafts & Hands!</h1>
            <p>Hi ${data.name},</p>
            <p>We're excited to have you join our community of artisan craft enthusiasts!</p>
            <p>Discover unique handmade products from talented Lithuanian and European artisans.</p>
            <div style="margin: 30px 0;">
              <a href="${data.shopUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Start Shopping</a>
            </div>
            <p style="color: #718096; font-size: 14px;">Best regards,<br>Crafts & Hands Team</p>
          </div>
        `,
        text: `Welcome to Crafts & Hands!\n\nHi ${data.name},\n\nWe're excited to have you join our community of artisan craft enthusiasts!\n\nDiscover unique handmade products from talented Lithuanian and European artisans.\n\nStart Shopping: ${data.shopUrl}\n\nBest regards,\nCrafts & Hands Team`
      };

    case 'event_reminder':
      return {
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2d3748;">Event Reminder</h1>
            <p>Don't forget about this upcoming event!</p>
            <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #2d3748;">${data.eventTitle}</h2>
              <p><strong>Date:</strong> ${data.eventDate}</p>
              <p><strong>Location:</strong> ${data.location}</p>
              ${data.onlineUrl ? `<p><strong>Online URL:</strong> <a href="${data.onlineUrl}">${data.onlineUrl}</a></p>` : ''}
            </div>
            <p style="color: #718096; font-size: 14px;">We look forward to seeing you there!<br>Crafts & Hands Team</p>
          </div>
        `,
        text: `Event Reminder\n\nDon't forget about this upcoming event!\n\n${data.eventTitle}\nDate: ${data.eventDate}\nLocation: ${data.location}\n${data.onlineUrl ? `Online URL: ${data.onlineUrl}\n` : ''}\nWe look forward to seeing you there!\nCrafts & Hands Team`
      };

    case 'maker_notification':
      return {
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2d3748;">New Order Received!</h1>
            <p>You have a new order for your products.</p>
            <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #2d3748;">Order #${data.orderNumber}</h2>
              <p><strong>Product:</strong> ${data.productTitle}</p>
              <p><strong>Quantity:</strong> ${data.quantity}</p>
              <p><strong>Total:</strong> €${data.amount}</p>
            </div>
            <p>Please prepare this order for shipment.</p>
            <p style="color: #718096; font-size: 14px;">Best regards,<br>Crafts & Hands Team</p>
          </div>
        `,
        text: `New Order Received!\n\nYou have a new order for your products.\n\nOrder #${data.orderNumber}\nProduct: ${data.productTitle}\nQuantity: ${data.quantity}\nTotal: €${data.amount}\n\nPlease prepare this order for shipment.\n\nBest regards,\nCrafts & Hands Team`
      };

    default:
      return {
        html: '<p>Email content</p>',
        text: 'Email content'
      };
  }
}

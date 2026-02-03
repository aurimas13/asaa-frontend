import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailPayload {
  to: string;
  subject: string;
  type: 'order_confirmation' | 'order_status' | 'welcome' | 'event_reminder' | 'maker_notification' | 'company_notification' | 'shipping_label';
  data: Record<string, any>;
}

const COMPANY_EMAIL = "craftsandhands@pm.me";

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

    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (resendApiKey) {
      const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "Crafts And Hands <onboarding@resend.dev>";

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [to],
          subject: subject,
          html: emailContent.html,
          text: emailContent.text,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Resend API error:", errorData);
      }
    }

    console.log('Email prepared:', { to, subject, type });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email processed successfully',
        details: { to, subject, type }
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
  const baseStyles = `
    font-family: 'Segoe UI', Arial, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    background: #ffffff;
  `;

  const headerStyles = `
    background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
    padding: 30px;
    text-align: center;
    border-radius: 12px 12px 0 0;
  `;

  const contentStyles = `
    padding: 30px;
    background: #f9fafb;
  `;

  const footerStyles = `
    background: #1f2937;
    color: #9ca3af;
    padding: 20px;
    text-align: center;
    font-size: 12px;
    border-radius: 0 0 12px 12px;
  `;

  switch (type) {
    case 'order_confirmation':
      return {
        html: `
          <div style="${baseStyles}">
            <div style="${headerStyles}">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Uzsakymas patvirtintas!</h1>
              <p style="color: #fef3c7; margin: 10px 0 0 0;">Order Confirmed!</p>
            </div>
            <div style="${contentStyles}">
              <p style="color: #374151; font-size: 16px;">Aciu uz jusu uzsakyma! / Thank you for your order!</p>

              <div style="background: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
                <h2 style="color: #1f2937; margin: 0 0 15px 0;">Uzsakymas / Order #${data.orderNumber}</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Suma / Total:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-weight: bold; text-align: right;">€${data.totalAmount}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Busena / Status:</td>
                    <td style="padding: 8px 0; color: #059669; font-weight: bold; text-align: right;">${data.status}</td>
                  </tr>
                  ${data.shippingMethod ? `
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Pristatymas / Shipping:</td>
                    <td style="padding: 8px 0; color: #1f2937; text-align: right;">${data.shippingMethod}</td>
                  </tr>
                  ` : ''}
                  ${data.estimatedDelivery ? `
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Numatomas pristatymas:</td>
                    <td style="padding: 8px 0; color: #1f2937; text-align: right;">${data.estimatedDelivery}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>

              ${data.items ? `
              <div style="background: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
                <h3 style="color: #1f2937; margin: 0 0 15px 0;">Uzsakyti produktai / Ordered Items</h3>
                ${data.items.map((item: any) => `
                  <div style="display: flex; padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                    <div style="flex: 1;">
                      <p style="margin: 0; color: #1f2937; font-weight: 500;">${item.title}</p>
                      <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Kiekis / Qty: ${item.quantity}</p>
                    </div>
                    <p style="margin: 0; color: #1f2937; font-weight: bold;">€${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                `).join('')}
              </div>
              ` : ''}

              ${data.shippingAddress ? `
              <div style="background: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
                <h3 style="color: #1f2937; margin: 0 0 15px 0;">Pristatymo adresas / Shipping Address</h3>
                <p style="margin: 0; color: #374151; line-height: 1.6;">
                  ${data.shippingAddress.full_name}<br>
                  ${data.shippingAddress.address_line1}<br>
                  ${data.shippingAddress.address_line2 ? data.shippingAddress.address_line2 + '<br>' : ''}
                  ${data.shippingAddress.city}, ${data.shippingAddress.postal_code}<br>
                  ${data.shippingAddress.country}
                </p>
              </div>
              ` : ''}

              <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                Gausite pranešimą, kai jūsų užsakymas bus išsiųstas.<br>
                You will receive a notification when your order ships.
              </p>
            </div>
            <div style="${footerStyles}">
              <p style="margin: 0;">Crafts And Hands - Lietuviški rankų darbai</p>
              <p style="margin: 5px 0 0 0;">craftsandhands.com</p>
            </div>
          </div>
        `,
        text: `Užsakymas patvirtintas! / Order Confirmed!\n\nAčiu už jūsų užsakymą!\n\nUžsakymas #${data.orderNumber}\nSuma: €${data.totalAmount}\nBūsena: ${data.status}\n\nGausite pranešimą, kai jūsų užsakymas bus išsiųstas.\n\nCrafts And Hands`
      };

    case 'order_status':
      return {
        html: `
          <div style="${baseStyles}">
            <div style="${headerStyles}">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Užsakymo atnaujinimas</h1>
              <p style="color: #fef3c7; margin: 10px 0 0 0;">Order Status Update</p>
            </div>
            <div style="${contentStyles}">
              <p style="color: #374151; font-size: 16px;">Jūsų užsakymo būsena atnaujinta!</p>

              <div style="background: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
                <h2 style="color: #1f2937; margin: 0 0 15px 0;">Užsakymas #${data.orderNumber}</h2>
                <p style="margin: 0;"><strong>Nauja būsena:</strong> <span style="color: #059669;">${data.status}</span></p>
                ${data.trackingNumber ? `
                <p style="margin: 10px 0 0 0;"><strong>Sekimo numeris:</strong> ${data.trackingNumber}</p>
                ` : ''}
                ${data.trackingUrl ? `
                <p style="margin: 10px 0 0 0;"><a href="${data.trackingUrl}" style="color: #d97706;">Sekti siuntą / Track package</a></p>
                ` : ''}
                ${data.carrier ? `
                <p style="margin: 10px 0 0 0;"><strong>Kurjeris:</strong> ${data.carrier}</p>
                ` : ''}
              </div>
            </div>
            <div style="${footerStyles}">
              <p style="margin: 0;">Crafts And Hands - Lietuviški rankų darbai</p>
            </div>
          </div>
        `,
        text: `Užsakymo atnaujinimas\n\nUžsakymas #${data.orderNumber}\nNauja būsena: ${data.status}\n${data.trackingNumber ? `Sekimo numeris: ${data.trackingNumber}\n` : ''}${data.carrier ? `Kurjeris: ${data.carrier}\n` : ''}\nCrafts And Hands`
      };

    case 'welcome':
      return {
        html: `
          <div style="${baseStyles}">
            <div style="${headerStyles}">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Sveiki atvykę!</h1>
              <p style="color: #fef3c7; margin: 10px 0 0 0;">Welcome to Crafts And Hands</p>
            </div>
            <div style="${contentStyles}">
              <p style="color: #374151; font-size: 16px;">Sveiki, ${data.name}!</p>
              <p style="color: #374151;">Džiaugiamės, kad prisijungėte prie mūsų amatininkų bendruomenės!</p>
              <p style="color: #374151;">We're excited to have you join our artisan community!</p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.shopUrl || 'https://craftsandhands.com/products'}" style="background: linear-gradient(135deg, #d97706 0%, #b45309 100%); color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">Pradėti apsipirkimą / Start Shopping</a>
              </div>
            </div>
            <div style="${footerStyles}">
              <p style="margin: 0;">Crafts And Hands - Lietuviški rankų darbai</p>
            </div>
          </div>
        `,
        text: `Sveiki atvykę!\n\nSveiki, ${data.name}!\n\nDžiaugiamės, kad prisijungėte prie mūsų amatininkų bendruomenės!\n\nCrafts And Hands`
      };

    case 'maker_notification':
      return {
        html: `
          <div style="${baseStyles}">
            <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Naujas užsakymas!</h1>
              <p style="color: #d1fae5; margin: 10px 0 0 0;">New Order Received</p>
            </div>
            <div style="${contentStyles}">
              <p style="color: #374151; font-size: 16px;">Turite naują užsakymą savo produktams!</p>

              <div style="background: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
                <h2 style="color: #1f2937; margin: 0 0 15px 0;">Užsakymas #${data.orderNumber}</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Produktai:</td>
                    <td style="padding: 8px 0; color: #1f2937; text-align: right;">${data.productTitle}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Kiekis:</td>
                    <td style="padding: 8px 0; color: #1f2937; text-align: right;">${data.quantity}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Suma:</td>
                    <td style="padding: 8px 0; color: #059669; font-weight: bold; text-align: right;">€${data.amount}</td>
                  </tr>
                </table>
              </div>

              ${data.shippingAddress ? `
              <div style="background: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
                <h3 style="color: #1f2937; margin: 0 0 15px 0;">Pristatymo adresas</h3>
                <p style="margin: 0; color: #374151; line-height: 1.6;">
                  ${data.shippingAddress.full_name}<br>
                  ${data.shippingAddress.address_line1}<br>
                  ${data.shippingAddress.address_line2 ? data.shippingAddress.address_line2 + '<br>' : ''}
                  ${data.shippingAddress.city}, ${data.shippingAddress.postal_code}<br>
                  ${data.shippingAddress.country}
                </p>
              </div>
              ` : ''}

              <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fbbf24;">
                <h3 style="color: #92400e; margin: 0 0 10px 0;">Svarbu / Important</h3>
                <p style="color: #92400e; margin: 0; font-size: 14px;">
                  Prašome paruošti šį užsakymą siuntimui. Crafts And Hands komanda susisieks su jumis dėl siuntimo etiketės.<br><br>
                  Please prepare this order for shipment. The Crafts And Hands team will contact you regarding the shipping label.
                </p>
              </div>

              ${data.pickupDate ? `
              <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #3b82f6;">
                <h3 style="color: #1e40af; margin: 0 0 10px 0;">Paėmimo data / Pickup Date</h3>
                <p style="color: #1e40af; margin: 0;">${data.pickupDate}</p>
              </div>
              ` : ''}
            </div>
            <div style="${footerStyles}">
              <p style="margin: 0;">Crafts And Hands - Partnerių pranešimas</p>
            </div>
          </div>
        `,
        text: `Naujas užsakymas!\n\nUžsakymas #${data.orderNumber}\nProduktas: ${data.productTitle}\nKiekis: ${data.quantity}\nSuma: €${data.amount}\n\nPrašome paruošti šį užsakymą siuntimui.\n\nCrafts And Hands`
      };

    case 'company_notification':
      return {
        html: `
          <div style="${baseStyles}">
            <div style="background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Naujas užsakymas sistemoje</h1>
              <p style="color: #bfdbfe; margin: 10px 0 0 0;">New Order in System</p>
            </div>
            <div style="${contentStyles}">
              <div style="background: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
                <h2 style="color: #1f2937; margin: 0 0 15px 0;">Užsakymas #${data.orderNumber}</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Klientas:</td>
                    <td style="padding: 8px 0; color: #1f2937; text-align: right;">${data.customerName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">El. paštas:</td>
                    <td style="padding: 8px 0; color: #1f2937; text-align: right;">${data.customerEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Bendra suma:</td>
                    <td style="padding: 8px 0; color: #059669; font-weight: bold; text-align: right;">€${data.totalAmount}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Prekių skaičius:</td>
                    <td style="padding: 8px 0; color: #1f2937; text-align: right;">${data.itemCount}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Pristatymo būdas:</td>
                    <td style="padding: 8px 0; color: #1f2937; text-align: right;">${data.shippingMethod || 'Standard'}</td>
                  </tr>
                </table>
              </div>

              ${data.makers ? `
              <div style="background: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
                <h3 style="color: #1f2937; margin: 0 0 15px 0;">Susiję meistrai / Involved Makers</h3>
                <ul style="margin: 0; padding-left: 20px; color: #374151;">
                  ${data.makers.map((m: string) => `<li>${m}</li>`).join('')}
                </ul>
              </div>
              ` : ''}

              <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fbbf24;">
                <h3 style="color: #92400e; margin: 0 0 10px 0;">Veiksmai / Actions Required</h3>
                <ol style="color: #92400e; margin: 0; padding-left: 20px; font-size: 14px;">
                  <li>Patvirtinti užsakymą su meistrais</li>
                  <li>Sukurti siuntimo etiketes</li>
                  <li>Koordinuoti paėmimą iš meistrų</li>
                  <li>Atnaujinti kliento sekimą</li>
                </ol>
              </div>
            </div>
            <div style="${footerStyles}">
              <p style="margin: 0;">Crafts And Hands - Vidinis pranešimas</p>
            </div>
          </div>
        `,
        text: `Naujas užsakymas sistemoje\n\nUžsakymas #${data.orderNumber}\nKlientas: ${data.customerName}\nEl. paštas: ${data.customerEmail}\nBendra suma: €${data.totalAmount}\n\nCrafts And Hands`
      };

    case 'shipping_label':
      return {
        html: `
          <div style="${baseStyles}">
            <div style="background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Siuntimo etiketė paruošta</h1>
              <p style="color: #ddd6fe; margin: 10px 0 0 0;">Shipping Label Ready</p>
            </div>
            <div style="${contentStyles}">
              <p style="color: #374151; font-size: 16px;">Jūsų siuntimo etiketė užsakymui #${data.orderNumber} paruošta!</p>

              <div style="background: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Kurjeris:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-weight: bold; text-align: right;">${data.carrier}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Sekimo numeris:</td>
                    <td style="padding: 8px 0; color: #1f2937; text-align: right;">${data.trackingNumber}</td>
                  </tr>
                  ${data.pickupDate ? `
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Paėmimo data:</td>
                    <td style="padding: 8px 0; color: #1f2937; text-align: right;">${data.pickupDate}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>

              ${data.labelUrl ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.labelUrl}" style="background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">Atsisiųsti etiketę / Download Label</a>
              </div>
              ` : ''}

              <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #3b82f6;">
                <h3 style="color: #1e40af; margin: 0 0 10px 0;">Instrukcijos / Instructions</h3>
                <ol style="color: #1e40af; margin: 0; padding-left: 20px; font-size: 14px;">
                  <li>Atsispausdinkite siuntimo etiketę</li>
                  <li>Saugiai supakuokite produktą</li>
                  <li>Užklijuokite etiketę ant pakuotės</li>
                  <li>Palaukite kurjerio arba nuneskite į paėmimo punktą</li>
                </ol>
              </div>
            </div>
            <div style="${footerStyles}">
              <p style="margin: 0;">Crafts And Hands - Siuntimo pranešimas</p>
            </div>
          </div>
        `,
        text: `Siuntimo etiketė paruošta\n\nUžsakymas #${data.orderNumber}\nKurjeris: ${data.carrier}\nSekimo numeris: ${data.trackingNumber}\n${data.pickupDate ? `Paėmimo data: ${data.pickupDate}\n` : ''}\nCrafts And Hands`
      };

    case 'event_reminder':
      return {
        html: `
          <div style="${baseStyles}">
            <div style="${headerStyles}">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Renginio priminimas</h1>
              <p style="color: #fef3c7; margin: 10px 0 0 0;">Event Reminder</p>
            </div>
            <div style="${contentStyles}">
              <p style="color: #374151; font-size: 16px;">Nepamirškite artėjančio renginio!</p>

              <div style="background: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
                <h2 style="color: #1f2937; margin: 0 0 15px 0;">${data.eventTitle}</h2>
                <p><strong>Data:</strong> ${data.eventDate}</p>
                <p><strong>Vieta:</strong> ${data.location}</p>
                ${data.onlineUrl ? `<p><strong>Nuoroda:</strong> <a href="${data.onlineUrl}">${data.onlineUrl}</a></p>` : ''}
              </div>
            </div>
            <div style="${footerStyles}">
              <p style="margin: 0;">Crafts And Hands</p>
            </div>
          </div>
        `,
        text: `Renginio priminimas\n\n${data.eventTitle}\nData: ${data.eventDate}\nVieta: ${data.location}\n${data.onlineUrl ? `Nuoroda: ${data.onlineUrl}\n` : ''}\nCrafts And Hands`
      };

    default:
      return {
        html: '<p>Email content</p>',
        text: 'Email content'
      };
  }
}

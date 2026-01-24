import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface EmailPayload {
  to: string;
  subject: string;
  type: string;
  data: Record<string, unknown>;
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  const { to, subject, type, data } = payload;
  const html = generateEmailHtml(type, data);

  if (!resend) {
    console.log(`[DEV] Email to ${to}: ${subject}`);
    return;
  }

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Crafts & Hands <noreply@craftsandhands.lt>',
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error('Email send error:', err);
    throw err;
  }
}

function generateEmailHtml(type: string, data: Record<string, unknown>): string {
  const baseStyles = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  `;

  const buttonStyle = `
    display: inline-block;
    background: #d97706;
    color: white;
    padding: 12px 24px;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
  `;

  switch (type) {
    case 'order_confirmation':
      return `
        <div style="${baseStyles}">
          <h1 style="color: #1f2937;">Order Confirmed!</h1>
          <p>Thank you for supporting Lithuanian artisans.</p>
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #374151; margin-top: 0;">Order #${data.orderNumber}</h2>
            <p><strong>Total:</strong> EUR${data.totalAmount}</p>
            <p><strong>Status:</strong> ${data.status}</p>
          </div>
          <p>You'll receive tracking information once your order ships.</p>
          <p style="color: #6b7280; font-size: 14px;">With gratitude,<br>Crafts & Hands</p>
        </div>
      `;

    case 'event_reminder':
      return `
        <div style="${baseStyles}">
          <h1 style="color: #1f2937;">Event Tomorrow!</h1>
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #92400e; margin-top: 0;">${data.eventTitle}</h2>
            <p><strong>When:</strong> ${data.eventDate}</p>
            <p><strong>Where:</strong> ${data.location}</p>
            ${data.onlineUrl ? `<p><a href="${data.onlineUrl}" style="${buttonStyle}">Join Online</a></p>` : ''}
          </div>
          <p>We look forward to seeing you!</p>
        </div>
      `;

    case 'abandoned_cart':
      return `
        <div style="${baseStyles}">
          <h1 style="color: #1f2937;">Still interested?</h1>
          <p>Hi ${data.name},</p>
          <p>You left some beautiful handcrafted items in your cart:</p>
          <ul style="background: #f9fafb; padding: 20px 40px; border-radius: 8px;">
            ${(data.items as string[]).map(item => `<li style="margin: 8px 0;">${item}</li>`).join('')}
          </ul>
          <p>These unique items are handmade and may sell out.</p>
          <p style="margin: 30px 0;">
            <a href="${data.shopUrl}/cart" style="${buttonStyle}">Complete Your Order</a>
          </p>
        </div>
      `;

    default:
      return `<div style="${baseStyles}"><p>Email content</p></div>`;
  }
}

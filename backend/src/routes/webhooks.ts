import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

export const webhookRouter = Router();

webhookRouter.post('/stripe', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(400).json({ error: 'Missing signature or webhook secret' });
  }

  try {
    const event = JSON.parse(req.body.toString());

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const orderId = session.metadata?.order_id;

        if (orderId) {
          await supabase
            .from('orders')
            .update({
              status: 'processing',
              updated_at: new Date().toISOString(),
            })
            .eq('id', orderId);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata?.order_id;

        if (orderId) {
          await supabase
            .from('orders')
            .update({
              status: 'cancelled',
              notes: 'Payment failed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', orderId);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
});

webhookRouter.post('/shipping-update', async (req: Request, res: Response) => {
  try {
    const { order_id, tracking_number, tracking_url, status } = req.body;

    if (!order_id) {
      return res.status(400).json({ error: 'Missing order_id' });
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (tracking_number) updateData.tracking_number = tracking_number;
    if (tracking_url) updateData.tracking_url = tracking_url;
    if (status) updateData.status = status;

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', order_id);

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    console.error('Shipping update error:', err);
    res.status(500).json({ error: 'Failed to update shipping info' });
  }
});

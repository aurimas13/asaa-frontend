import { supabase } from '../../config/supabase.js';
import { sendEmail } from '../../services/email.js';

export async function processAbandonedCarts() {
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const { data: carts, error } = await supabase
    .from('carts')
    .select(`
      user_id,
      products(title, price, images),
      profiles!carts_user_id_fkey(email, full_name)
    `)
    .lt('updated_at', oneDayAgo.toISOString())
    .gt('updated_at', twoDaysAgo.toISOString());

  if (error) throw error;

  const userCarts = new Map<string, { email: string; name: string; items: string[] }>();

  for (const cart of carts || []) {
    const profile = cart.profiles as { email: string; full_name: string } | null;
    if (!profile?.email) continue;

    const product = cart.products as { title: string } | null;
    if (!product) continue;

    if (!userCarts.has(cart.user_id)) {
      userCarts.set(cart.user_id, {
        email: profile.email,
        name: profile.full_name || 'there',
        items: [],
      });
    }

    userCarts.get(cart.user_id)!.items.push(product.title);
  }

  let emailsSent = 0;

  for (const [, userData] of userCarts) {
    await sendEmail({
      to: userData.email,
      subject: 'You left something behind!',
      type: 'abandoned_cart',
      data: {
        name: userData.name,
        items: userData.items,
        shopUrl: process.env.FRONTEND_URL || 'https://craftsandhands.lt',
      },
    });
    emailsSent++;
  }

  console.log(`Sent ${emailsSent} abandoned cart emails`);
}

import { supabase } from '../../config/supabase.js';

export async function cleanupOldCarts() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data, error } = await supabase
    .from('carts')
    .delete()
    .lt('updated_at', thirtyDaysAgo.toISOString())
    .select('id');

  if (error) throw error;

  console.log(`Cleaned up ${data?.length || 0} old cart items`);
}

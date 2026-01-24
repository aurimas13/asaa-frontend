import { supabase } from '../../config/supabase.js';

export async function updateProductRatings() {
  const { data: products, error: fetchError } = await supabase
    .from('products')
    .select('id');

  if (fetchError) throw fetchError;

  for (const product of products || []) {
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', product.id)
      .eq('moderation_status', 'approved');

    if (reviews && reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

      await supabase
        .from('products')
        .update({
          rating: Math.round(avgRating * 10) / 10,
          updated_at: new Date().toISOString(),
        })
        .eq('id', product.id);
    }
  }

  console.log(`Updated ratings for ${products?.length || 0} products`);
}

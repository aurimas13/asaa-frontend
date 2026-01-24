import { supabase } from '../lib/supabase';

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  customization_details?: Record<string, any>;
  products: {
    id: string;
    title: string;
    price: number;
    images: string[];
    stock_quantity: number;
    makers: {
      business_name: string;
    };
  };
}

export async function getCart(): Promise<CartItem[]> {
  const { data, error } = await supabase
    .from('carts')
    .select(`
      *,
      products(
        id,
        title,
        price,
        images,
        stock_quantity,
        makers(business_name)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addToCart(
  productId: string,
  quantity: number = 1,
  customizationDetails?: Record<string, any>
) {
  const { data: existing } = await supabase
    .from('carts')
    .select('id, quantity')
    .eq('product_id', productId)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from('carts')
      .update({
        quantity: existing.quantity + quantity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  const session = await supabase.auth.getSession();
  if (!session.data.session?.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('carts')
    .insert({
      user_id: session.data.session.user.id,
      product_id: productId,
      quantity,
      customization_details: customizationDetails,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCartItem(
  cartItemId: string,
  quantity: number,
  customizationDetails?: Record<string, any>
) {
  const updateData: any = {
    quantity,
    updated_at: new Date().toISOString(),
  };

  if (customizationDetails !== undefined) {
    updateData.customization_details = customizationDetails;
  }

  const { data, error } = await supabase
    .from('carts')
    .update(updateData)
    .eq('id', cartItemId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeFromCart(cartItemId: string) {
  const { error } = await supabase
    .from('carts')
    .delete()
    .eq('id', cartItemId);

  if (error) throw error;
}

export async function clearCart() {
  const { error } = await supabase
    .from('carts')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (error) throw error;
}

export function calculateCartTotal(items: CartItem[]): number {
  return items.reduce((total, item) => {
    return total + (item.products.price * item.quantity);
  }, 0);
}

export function getCartItemCount(items: CartItem[]): number {
  return items.reduce((count, item) => count + item.quantity, 0);
}

import { supabase } from '../lib/supabase';

interface OrderItem {
  product_id: string;
  quantity: number;
  customization_details?: Record<string, any>;
}

interface ShippingAddress {
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  phone: string;
}

interface OrderPayload {
  items: OrderItem[];
  shipping_address: ShippingAddress;
  billing_address: ShippingAddress;
  shipping_method?: string;
  notes?: string;
}

export async function processOrder(payload: OrderPayload) {
  const session = await supabase.auth.getSession();

  if (!session.data.session) {
    throw new Error('User not authenticated');
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-order`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.data.session.access_token}`,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to process order');
  }

  return await response.json();
}

export async function getOrderDetails(orderId: string) {
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(
        *,
        products(id, title, images)
      )
    `)
    .eq('id', orderId)
    .single();

  if (error) throw error;
  return order;
}

export async function getUserOrders() {
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      status,
      total_amount,
      currency,
      created_at,
      order_items(
        quantity,
        products(title, images)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return orders;
}

export async function updateOrderStatus(orderId: string, status: string, trackingNumber?: string) {
  const updateData: any = { status };
  if (trackingNumber) {
    updateData.tracking_number = trackingNumber;
  }

  const { data, error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Package, Clock, Truck, CheckCircle, XCircle, ArrowLeft, MapPin, CreditCard } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface OrderItem {
  id: string
  quantity: number
  price: number
  products: {
    id: string
    title: string
    images: string[]
  }
  makers: {
    business_name: string
  }
}

interface Order {
  id: string
  order_number: string
  status: string
  total_amount: number
  currency: string
  shipping_address: {
    full_name: string
    address_line1: string
    address_line2?: string
    city: string
    postal_code: string
    country: string
    phone: string
  }
  tracking_number: string | null
  shipping_method: string | null
  notes: string | null
  created_at: string
  updated_at: string
  order_items: OrderItem[]
}

const statusSteps = ['pending', 'processing', 'shipped', 'delivered']

export const OrderDetail: React.FC = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && id) loadOrder()
  }, [user, id])

  const loadOrder = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(
          id, quantity, price,
          products(id, title, images),
          makers(business_name)
        )
      `)
      .eq('id', id)
      .eq('user_id', user?.id)
      .maybeSingle()

    if (error) console.error('Error:', error)
    if (data) setOrder(data as unknown as Order)
    setLoading(false)
  }

  const getStatusIcon = (status: string, isActive: boolean) => {
    const iconClass = `w-6 h-6 ${isActive ? 'text-amber-600' : 'text-gray-300'}`
    switch (status) {
      case 'pending': return <Clock className={iconClass} />
      case 'processing': return <Package className={iconClass} />
      case 'shipped': return <Truck className={iconClass} />
      case 'delivered': return <CheckCircle className={iconClass} />
      case 'cancelled': return <XCircle className="w-6 h-6 text-red-500" />
      default: return <Clock className={iconClass} />
    }
  }

  const getImageUrl = (images: string[] | string | null) => {
    if (!images) return 'https://images.pexels.com/photos/1070971/pexels-photo-1070971.jpeg?auto=compress&cs=tinysrgb&w=200'
    const parsed = typeof images === 'string' ? JSON.parse(images) : images
    return parsed[0] || 'https://images.pexels.com/photos/1070971/pexels-photo-1070971.jpeg?auto=compress&cs=tinysrgb&w=200'
  }

  const getCurrentStepIndex = () => {
    if (!order) return -1
    if (order.status === 'cancelled') return -1
    return statusSteps.indexOf(order.status)
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Please sign in to view order details</h2>
        <Link to="/signin" className="text-amber-600 hover:text-amber-700 font-semibold">
          Sign In
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="bg-gray-200 h-8 rounded w-1/3" />
          <div className="bg-gray-200 h-32 rounded-xl" />
          <div className="bg-gray-200 h-48 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Order not found</h2>
        <Link to="/orders" className="text-amber-600 hover:text-amber-700 font-semibold">
          View all orders
        </Link>
      </div>
    )
  }

  const currentStep = getCurrentStepIndex()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/orders" className="flex items-center gap-2 text-gray-600 hover:text-amber-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order {order.order_number}</h1>
              <p className="text-gray-500 mt-1">
                Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-amber-600">{order.total_amount.toFixed(2)}</p>
              <p className="text-sm text-gray-500">{order.order_items?.length || 0} items</p>
            </div>
          </div>
        </div>

        {order.status !== 'cancelled' ? (
          <div className="p-6 bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-6">Order Status</h3>
            <div className="relative">
              <div className="flex justify-between">
                {statusSteps.map((step, index) => (
                  <div key={step} className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      index <= currentStep ? 'bg-amber-100' : 'bg-gray-100'
                    }`}>
                      {getStatusIcon(step, index <= currentStep)}
                    </div>
                    <p className={`text-sm mt-2 capitalize ${
                      index <= currentStep ? 'text-amber-600 font-medium' : 'text-gray-400'
                    }`}>
                      {step}
                    </p>
                  </div>
                ))}
              </div>
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10">
                <div
                  className="h-full bg-amber-500 transition-all"
                  style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }}
                />
              </div>
            </div>
            {order.tracking_number && (
              <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Tracking Number:</span> {order.tracking_number}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 bg-red-50">
            <div className="flex items-center gap-3">
              <XCircle className="w-6 h-6 text-red-500" />
              <p className="font-medium text-red-700">This order has been cancelled</p>
            </div>
          </div>
        )}

        <div className="p-6 border-t border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Items</h3>
          <div className="space-y-4">
            {order.order_items?.map((item) => (
              <div key={item.id} className="flex gap-4">
                <Link to={`/product/${item.products?.id}`}>
                  <img
                    src={getImageUrl(item.products?.images)}
                    alt={item.products?.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                </Link>
                <div className="flex-1">
                  <Link
                    to={`/product/${item.products?.id}`}
                    className="font-medium text-gray-900 hover:text-amber-600"
                  >
                    {item.products?.title}
                  </Link>
                  <p className="text-sm text-gray-500">{item.makers?.business_name}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="font-medium text-gray-900">{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 p-6 border-t border-gray-100 bg-gray-50">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <h3 className="font-semibold text-gray-900">Shipping Address</h3>
            </div>
            {order.shipping_address && (
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium">{order.shipping_address.full_name}</p>
                <p>{order.shipping_address.address_line1}</p>
                {order.shipping_address.address_line2 && (
                  <p>{order.shipping_address.address_line2}</p>
                )}
                <p>
                  {order.shipping_address.city}, {order.shipping_address.postal_code}
                </p>
                <p>{order.shipping_address.country}</p>
                <p>{order.shipping_address.phone}</p>
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-5 h-5 text-gray-400" />
              <h3 className="font-semibold text-gray-900">Order Summary</h3>
            </div>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{order.total_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold">
                <span>Total</span>
                <span className="text-amber-600">{order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {order.notes && (
          <div className="p-6 border-t border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-2">Order Notes</h3>
            <p className="text-gray-600 text-sm">{order.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}

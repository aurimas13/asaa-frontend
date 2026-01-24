import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, Package, ArrowRight, Mail } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface Order {
  id: string
  order_number: string
  total_amount: number
  created_at: string
  shipping_address: {
    full_name: string
    email?: string
  }
}

export const OrderConfirmation: React.FC = () => {
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const orderId = searchParams.get('order')

  useEffect(() => {
    if (orderId && user) {
      loadOrder()
    } else {
      setLoading(false)
    }
  }, [orderId, user])

  const loadOrder = async () => {
    const { data } = await supabase
      .from('orders')
      .select('id, order_number, total_amount, created_at, shipping_address')
      .eq('id', orderId)
      .eq('user_id', user?.id)
      .maybeSingle()

    if (data) setOrder(data as Order)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="animate-pulse space-y-6 text-center">
          <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto" />
          <div className="bg-gray-200 h-8 rounded w-2/3 mx-auto" />
          <div className="bg-gray-200 h-4 rounded w-1/2 mx-auto" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Thank You for Your Order!</h1>
        <p className="text-gray-600 mb-8">
          Your order has been placed successfully. You will receive a confirmation email shortly.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/orders"
            className="bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
          >
            <Package className="w-5 h-5" /> View Orders
          </Link>
          <Link
            to="/products"
            className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            Continue Shopping <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-gray-600">
          Thank you for your purchase, {order.shipping_address?.full_name?.split(' ')[0] || 'there'}!
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Order Number</p>
              <p className="font-bold text-lg text-gray-900">{order.order_number}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total</p>
              <p className="font-bold text-lg text-amber-600">{order.total_amount.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Confirmation Email Sent</h3>
              <p className="text-sm text-gray-600 mt-1">
                We've sent a confirmation email with your order details and tracking information
                once your order ships.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">What happens next?</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 text-amber-600 font-bold text-sm">
                1
              </div>
              <div>
                <p className="font-medium text-gray-900">Order Processing</p>
                <p className="text-sm text-gray-600">Our artisans are preparing your items with care</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 text-gray-400 font-bold text-sm">
                2
              </div>
              <div>
                <p className="font-medium text-gray-500">Shipped</p>
                <p className="text-sm text-gray-400">You'll receive tracking information via email</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 text-gray-400 font-bold text-sm">
                3
              </div>
              <div>
                <p className="font-medium text-gray-500">Delivered</p>
                <p className="text-sm text-gray-400">Enjoy your handcrafted treasures!</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to={`/order/${order.id}`}
          className="bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
        >
          <Package className="w-5 h-5" /> Track Order
        </Link>
        <Link
          to="/products"
          className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          Continue Shopping <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  )
}

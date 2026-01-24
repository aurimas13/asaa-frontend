import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Clock, Truck, CheckCircle, XCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface Order {
  id: string
  order_number: string
  status: string
  total_amount: number
  currency: string
  created_at: string
  order_items: {
    quantity: number
    price: number
    products: {
      title: string
      images: string[]
    }
  }[]
}

export const Orders: React.FC = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) loadOrders()
  }, [user])

  const loadOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select(`
        id, order_number, status, total_amount, currency, created_at,
        order_items(quantity, price, products(title, images))
      `)
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })

    if (data) setOrders(data as unknown as Order[])
    setLoading(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-amber-500" />
      case 'processing': return <Package className="w-5 h-5 text-blue-500" />
      case 'shipped': return <Truck className="w-5 h-5 text-blue-500" />
      case 'delivered': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-500" />
      default: return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700'
      case 'processing': return 'bg-blue-100 text-blue-700'
      case 'shipped': return 'bg-blue-100 text-blue-700'
      case 'delivered': return 'bg-green-100 text-green-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getImageUrl = (images: string[] | string | null) => {
    if (!images) return 'https://images.pexels.com/photos/1070971/pexels-photo-1070971.jpeg?auto=compress&cs=tinysrgb&w=200'
    const parsed = typeof images === 'string' ? JSON.parse(images) : images
    return parsed[0] || 'https://images.pexels.com/photos/1070971/pexels-photo-1070971.jpeg?auto=compress&cs=tinysrgb&w=200'
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Please sign in to view your orders</h2>
        <Link to="/signin" className="text-amber-600 hover:text-amber-700 font-semibold">
          Sign In
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-32 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">No orders yet</h2>
        <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
        <Link
          to="/products"
          className="inline-block bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
        >
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Link key={order.id} to={`/order/${order.id}`} className="block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-gray-900">{order.order_number}</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize flex items-center gap-1 ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(order.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-amber-600">€{order.total_amount.toFixed(2)}</p>
                <p className="text-sm text-gray-500">{order.order_items?.length || 0} items</p>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center gap-4 overflow-x-auto pb-2">
                {order.order_items?.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="flex-shrink-0">
                    <img
                      src={getImageUrl(item.products?.images)}
                      alt={item.products?.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  </div>
                ))}
                {(order.order_items?.length || 0) > 4 && (
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500 text-sm">+{(order.order_items?.length || 0) - 4}</span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

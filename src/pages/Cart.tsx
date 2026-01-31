import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, X, Truck, Clock, Zap } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { processOrder } from '../services/orderService'
import { useTranslation } from 'react-i18next'
import {
  getShippingZoneForCountry,
  getShippingRates,
  calculateShippingCost,
  formatDeliveryEstimate,
  getMethodLabel,
  SUPPORTED_COUNTRIES,
  ShippingRate,
  ShippingZone,
} from '../services/shippingService'

interface CartItem {
  id: string
  quantity: number
  product_id: string
  products: {
    id: string
    title: string
    price: number
    images: any
    stock_quantity: number
    makers: {
      business_name: string
    }
  }
}

export const Cart: React.FC = () => {
  const { t } = useTranslation()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showCheckout, setShowCheckout] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [shippingAddress, setShippingAddress] = useState({
    full_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    postal_code: '',
    country: 'Lithuania',
    phone: '',
  })
  const [shippingZone, setShippingZone] = useState<ShippingZone | null>(null)
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([])
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      loadCart()
    }
  }, [user])

  useEffect(() => {
    loadShippingRates(shippingAddress.country)
  }, [shippingAddress.country])

  const loadShippingRates = async (country: string) => {
    const zone = await getShippingZoneForCountry(country)
    setShippingZone(zone)
    if (zone) {
      const rates = await getShippingRates(zone.id)
      setShippingRates(rates)
      const standardRate = rates.find(r => r.method === 'standard') || rates[0]
      setSelectedRate(standardRate || null)
    }
  }

  const loadCart = async () => {
    try {
      const { data } = await supabase
        .from('carts')
        .select('*, products(*, makers(business_name))')
        .eq('user_id', user?.id)

      setCartItems(data || [])
    } catch (error) {
      console.error('Error loading cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    try {
      await supabase
        .from('carts')
        .update({ quantity: newQuantity })
        .eq('id', itemId)

      loadCart()
    } catch (error) {
      console.error('Error updating quantity:', error)
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      await supabase.from('carts').delete().eq('id', itemId)
      loadCart()
    } catch (error) {
      console.error('Error removing item:', error)
    }
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)

    try {
      const orderPayload = {
        items: cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
        shipping_address: shippingAddress,
        billing_address: shippingAddress,
        shipping_method: selectedRate?.method || 'standard',
        shipping_cost: shippingCost.cost,
        shipping_zone_id: shippingZone?.id,
      }

      const result = await processOrder(orderPayload)

      setShowCheckout(false)
      navigate(`/order-confirmation?order=${result.order.id}`)
    } catch (error) {
      console.error('Checkout error:', error)
      alert(error instanceof Error ? error.message : 'Failed to process order')
    } finally {
      setProcessing(false)
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.products.price * item.quantity, 0)
  const shippingCost = selectedRate ? calculateShippingCost(selectedRate, subtotal) : { cost: 0, isFree: false }
  const total = subtotal + shippingCost.cost

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">{t('cart.signInRequired')}</h2>
        <Link to="/signin" className="text-amber-600 hover:text-amber-700 font-semibold">
          {t('cart.signInButton')}
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-32 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Link
          to="/products"
          className="inline-block bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => {
            const imageUrl = item.products.images && item.products.images.length > 0
              ? (typeof item.products.images === 'string' ? JSON.parse(item.products.images)[0] : item.products.images[0])
              : 'https://images.pexels.com/photos/1070971/pexels-photo-1070971.jpeg?auto=compress&cs=tinysrgb&w=800'

            return (
              <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex gap-4">
                <Link to={`/product/${item.products.id}`}>
                  <img
                    src={imageUrl}
                    alt={item.products.title}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                </Link>
                <div className="flex-1">
                  <Link to={`/product/${item.products.id}`}>
                    <h3 className="font-semibold text-gray-900 hover:text-amber-600">
                      {item.products.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-500">by {item.products.makers.business_name}</p>
                  <p className="text-lg font-bold text-amber-600 mt-2">
                    €{item.products.price.toFixed(2)}
                  </p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 hover:bg-gray-100"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 hover:bg-gray-100"
                      disabled={item.quantity >= item.products.stock_quantity}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-20">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">€{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold">
                  {shippingCost.isFree ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    `€${shippingCost.cost.toFixed(2)}`
                  )}
                </span>
              </div>
              {selectedRate && !shippingCost.isFree && (
                <p className="text-sm text-gray-500">
                  Add €{(selectedRate.free_shipping_threshold - subtotal).toFixed(2)} more for free shipping!
                </p>
              )}
              <div className="border-t pt-3 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-amber-600">€{total.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={() => setShowCheckout(true)}
              className="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>

      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Checkout</h2>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCheckout} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.full_name}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, full_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.address_line1}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, address_line1: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.address_line2}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, address_line2: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.postal_code}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, postal_code: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country *
                  </label>
                  <select
                    required
                    value={shippingAddress.country}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    {SUPPORTED_COUNTRIES.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>

                {shippingRates.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shipping Method *
                    </label>
                    <div className="space-y-2">
                      {shippingRates.map(rate => {
                        const cost = calculateShippingCost(rate, subtotal)
                        return (
                          <label
                            key={rate.id}
                            className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedRate?.id === rate.id
                                ? 'border-amber-500 bg-amber-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="shipping"
                              checked={selectedRate?.id === rate.id}
                              onChange={() => setSelectedRate(rate)}
                              className="text-amber-600 focus:ring-amber-500"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                {rate.method === 'economy' && <Clock className="w-4 h-4 text-gray-500" />}
                                {rate.method === 'standard' && <Truck className="w-4 h-4 text-blue-500" />}
                                {rate.method === 'express' && <Zap className="w-4 h-4 text-amber-500" />}
                                <span className="font-medium">{getMethodLabel(rate.method)}</span>
                              </div>
                              <p className="text-sm text-gray-500">{formatDeliveryEstimate(rate)}</p>
                            </div>
                            <div className="text-right">
                              {cost.isFree ? (
                                <span className="text-green-600 font-semibold">FREE</span>
                              ) : (
                                <span className="font-semibold">€{cost.cost.toFixed(2)}</span>
                              )}
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mt-6">
                  <h3 className="font-semibold mb-2">Order Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>€{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping ({selectedRate ? getMethodLabel(selectedRate.method) : 'Standard'})</span>
                      <span>{shippingCost.isFree ? 'FREE' : `€${shippingCost.cost.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base pt-2 border-t">
                      <span>Total</span>
                      <span className="text-amber-600">€{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? 'Processing...' : 'Place Order'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

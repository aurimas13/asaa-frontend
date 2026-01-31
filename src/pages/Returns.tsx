import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { RefreshCw, Clock, CheckCircle, XCircle, AlertCircle, Package, ArrowLeft, Send } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { generateRMANumber } from '../services/shippingService'
import { useTranslation } from 'react-i18next'

interface Order {
  id: string
  order_number: string
  total_amount: number
  created_at: string
  status: string
  order_items: {
    id: string
    quantity: number
    price: number
    products: {
      id: string
      title: string
      images: string[]
    }
  }[]
}

interface ReturnRequest {
  id: string
  rma_number: string
  reason: string
  status: string
  created_at: string
  orders: {
    order_number: string
  }
}

const RETURN_REASONS = [
  { value: 'defective', label: 'Item is defective or damaged' },
  { value: 'wrong_item', label: 'Received wrong item' },
  { value: 'not_as_described', label: 'Item not as described' },
  { value: 'changed_mind', label: 'Changed my mind' },
  { value: 'arrived_late', label: 'Arrived too late' },
  { value: 'other', label: 'Other reason' },
]

export const Returns: React.FC = () => {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const orderId = searchParams.get('order')

  const [order, setOrder] = useState<Order | null>(null)
  const [myReturns, setMyReturns] = useState<ReturnRequest[]>([])
  const [showForm, setShowForm] = useState(!!orderId)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadMyReturns()
      if (orderId) {
        loadOrder(orderId)
      }
    }
  }, [user, orderId])

  const loadOrder = async (id: string) => {
    const { data } = await supabase
      .from('orders')
      .select(`
        id, order_number, total_amount, created_at, status,
        order_items(id, quantity, price, products(id, title, images))
      `)
      .eq('id', id)
      .eq('user_id', user?.id)
      .maybeSingle()

    if (data) {
      setOrder(data as unknown as Order)
      setSelectedItems(data.order_items?.map((i: { id: string }) => i.id) || [])
    }
  }

  const loadMyReturns = async () => {
    const { data } = await supabase
      .from('return_requests')
      .select('id, rma_number, reason, status, created_at, orders(order_number)')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })

    if (data) setMyReturns(data as unknown as ReturnRequest[])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!order || !user || selectedItems.length === 0 || !reason) return

    setSubmitting(true)

    try {
      const rmaNumber = generateRMANumber()
      const itemsToReturn = order.order_items
        .filter(item => selectedItems.includes(item.id))
        .map(item => ({
          order_item_id: item.id,
          product_id: item.products.id,
          title: item.products.title,
          quantity: item.quantity,
          price: item.price,
        }))

      const refundAmount = itemsToReturn.reduce((sum, item) => sum + (item.price * item.quantity), 0)

      const { error } = await supabase.from('return_requests').insert({
        order_id: order.id,
        user_id: user.id,
        rma_number: rmaNumber,
        reason,
        description: description.trim() || null,
        items: itemsToReturn,
        refund_amount: refundAmount,
        status: 'pending',
      })

      if (error) throw error

      setSuccess(rmaNumber)
      loadMyReturns()
    } catch (err) {
      console.error('Return request error:', err)
      alert('Failed to submit return request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'approved': return 'bg-green-100 text-green-700'
      case 'rejected': return 'bg-red-100 text-red-700'
      case 'shipped': return 'bg-blue-100 text-blue-700'
      case 'received': return 'bg-blue-100 text-blue-700'
      case 'refunded': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getImageUrl = (images: string[] | string | null) => {
    if (!images) return 'https://images.pexels.com/photos/1070971/pexels-photo-1070971.jpeg?auto=compress&cs=tinysrgb&w=200'
    const parsed = typeof images === 'string' ? JSON.parse(images) : images
    return parsed[0] || 'https://images.pexels.com/photos/1070971/pexels-photo-1070971.jpeg?auto=compress&cs=tinysrgb&w=200'
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-green-50 rounded-2xl p-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Return Request Submitted</h2>
          <p className="text-gray-600 mb-4">
            Your return request has been submitted successfully.
          </p>
          <div className="bg-white rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500">Your RMA Number</p>
            <p className="text-2xl font-mono font-bold text-amber-600">{success}</p>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Please keep this number for your records. You will receive an email with further instructions within 1-2 business days.
          </p>
          <Link
            to="/orders"
            className="inline-block bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
          >
            View My Orders
          </Link>
        </div>
      </div>
    )
  }

  if (showForm && order && user) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => { setShowForm(false); setOrder(null) }}
          className="flex items-center gap-2 text-gray-600 hover:text-amber-600 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Returns Policy
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-gray-900">Request a Return</h1>
            <p className="text-gray-600 mt-1">Order {order.order_number}</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select items to return
              </label>
              <div className="space-y-3">
                {order.order_items?.map(item => (
                  <label
                    key={item.id}
                    className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedItems.includes(item.id)
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems([...selectedItems, item.id])
                        } else {
                          setSelectedItems(selectedItems.filter(id => id !== item.id))
                        }
                      }}
                      className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
                    />
                    <img
                      src={getImageUrl(item.products?.images)}
                      alt={item.products?.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.products?.title}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">{(item.price * item.quantity).toFixed(2)}</p>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for return *
              </label>
              <select
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">Select a reason</option>
                {RETURN_REASONS.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional details (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide any additional details about your return..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="bg-amber-50 p-4 rounded-lg">
              <p className="text-sm text-amber-800">
                By submitting this request, you confirm that the items are in their original condition and packaging. Return shipping costs may apply unless the return is due to a defect or error on our part.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting || selectedItems.length === 0 || !reason}
              className="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? 'Submitting...' : <><Send className="w-5 h-5" /> Submit Return Request</>}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('returns.title')}</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {t('returns.subtitle')}
        </p>
      </div>

      {user && myReturns.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('returns.myRequests', 'My Return Requests')}</h2>
          <div className="space-y-3">
            {myReturns.map(ret => (
              <div key={ret.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">RMA: {ret.rma_number}</p>
                  <p className="text-sm text-gray-500">
                    {t('returns.order', 'Order')} {ret.orders?.order_number} - {RETURN_REASONS.find(r => r.value === ret.reason)?.label}
                  </p>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${getStatusColor(ret.status)}`}>
                  {ret.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
          <Clock className="w-10 h-10 text-amber-600 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">{t('returns.thirtyDayReturns')}</h3>
          <p className="text-sm text-gray-600">{t('returns.thirtyDayReturnsDesc')}</p>
        </div>
        <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
          <RefreshCw className="w-10 h-10 text-amber-600 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">{t('returns.easyProcess')}</h3>
          <p className="text-sm text-gray-600">{t('returns.easyProcessDesc')}</p>
        </div>
        <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
          <Package className="w-10 h-10 text-amber-600 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">{t('returns.originalCondition')}</h3>
          <p className="text-sm text-gray-600">{t('returns.originalConditionDesc')}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-green-50 rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            {t('returns.eligibleTitle')}
          </h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
              <span>{t('returns.eligibleItems.standard')}</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
              <span>{t('returns.eligibleItems.defects')}</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
              <span>{t('returns.eligibleItems.different')}</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
              <span>{t('returns.eligibleItems.wrong')}</span>
            </li>
          </ul>
        </div>

        <div className="bg-red-50 rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <XCircle className="w-6 h-6 text-red-500" />
            {t('returns.notEligibleTitle')}
          </h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
              <span>{t('returns.notEligibleItems.custom')}</span>
            </li>
            <li className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
              <span>{t('returns.notEligibleItems.used')}</span>
            </li>
            <li className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
              <span>{t('returns.notEligibleItems.late')}</span>
            </li>
            <li className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
              <span>{t('returns.notEligibleItems.food')}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('returns.howToReturn')}</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { step: 1, title: t('returns.steps.step1.title'), desc: t('returns.steps.step1.desc') },
            { step: 2, title: t('returns.steps.step2.title'), desc: t('returns.steps.step2.desc') },
            { step: 3, title: t('returns.steps.step3.title'), desc: t('returns.steps.step3.desc') },
            { step: 4, title: t('returns.steps.step4.title'), desc: t('returns.steps.step4.desc') },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-10 h-10 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-3">
                {item.step}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 rounded-2xl p-8 mb-12">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('returns.handmadeNotice.title')}</h3>
            <p className="text-gray-600">
              {t('returns.handmadeNotice.desc')}
            </p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-gray-600 mb-4">{t('returns.needHelp')}</p>
        <div className="flex justify-center gap-4">
          <Link
            to="/orders"
            className="bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
          >
            {t('returns.viewOrders')}
          </Link>
          <Link
            to="/contact"
            className="bg-white text-amber-600 border-2 border-amber-600 px-6 py-3 rounded-lg font-semibold hover:bg-amber-50 transition-colors"
          >
            {t('returns.contactSupport')}
          </Link>
        </div>
      </div>
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import {
  Package, Truck, CheckCircle, XCircle, Clock, AlertTriangle,
  Search, Eye, Flag, RefreshCw,
  DollarSign, ShoppingBag
} from 'lucide-react'
import { Link } from 'react-router-dom'

interface OrderSummary {
  id: string
  order_number: string
  status: string
  total_amount: number
  currency: string
  created_at: string
  updated_at: string
  paid_at: string | null
  shipping_method: string
  tracking_number: string | null
  shipping_carrier: string | null
  shipping_address: any
  notes: string | null
  manual_review: boolean
  profiles: { full_name: string; email: string } | null
}

interface OrderDetail extends OrderSummary {
  order_items: {
    id: string
    quantity: number
    price: number
    products: { id: string; title: string; images: any; price: number }
  }[]
}

interface Stats {
  total_orders: number
  total_revenue: number
  pending: number
  processing: number
  shipped: number
  delivered: number
  cancelled: number
  flagged: number
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-4 h-4" /> },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700', icon: <Package className="w-4 h-4" /> },
  shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-700', icon: <Truck className="w-4 h-4" /> },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-4 h-4" /> },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: <XCircle className="w-4 h-4" /> },
  payment_failed: { label: 'Payment Failed', color: 'bg-red-100 text-red-700', icon: <XCircle className="w-4 h-4" /> },
  manual_review: { label: 'Manual Review', color: 'bg-orange-100 text-orange-700', icon: <AlertTriangle className="w-4 h-4" /> },
  refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-700', icon: <RefreshCw className="w-4 h-4" /> },
  returned: { label: 'Returned', color: 'bg-gray-100 text-gray-700', icon: <RefreshCw className="w-4 h-4" /> },
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled', 'manual_review'],
  shipped: ['delivered', 'returned'],
  delivered: ['returned', 'refunded'],
  payment_failed: ['pending', 'cancelled'],
  manual_review: ['processing', 'cancelled'],
  returned: ['refunded'],
}

export const Admin: React.FC = () => {
  const { user } = useAuth()
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [trackingUrl, setTrackingUrl] = useState('')
  const [carrier, setCarrier] = useState('')
  const [statusNotes, setStatusNotes] = useState('')
  const [tab, setTab] = useState<'orders' | 'returns'>('orders')
  const [returns, setReturns] = useState<any[]>([])

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

  useEffect(() => {
    checkAuth()
  }, [user])

  useEffect(() => {
    if (authorized) {
      loadStats()
      loadOrders()
      if (tab === 'returns') loadReturns()
    }
  }, [authorized, statusFilter, page, searchQuery, tab])

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token
  }

  const checkAuth = async () => {
    if (!user) { setAuthorized(false); setLoading(false); return }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    setAuthorized(profile?.role === 'admin' || profile?.role === 'maker')
    setLoading(false)
  }

  const loadStats = async () => {
    try {
      const token = await getToken()
      const res = await fetch(`${backendUrl}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) setStats(await res.json())
    } catch (err) { console.error('Stats error:', err) }
  }

  const loadOrders = async () => {
    try {
      const token = await getToken()
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchQuery && { search: searchQuery }),
      })
      const res = await fetch(`${backendUrl}/admin/orders?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders)
        setTotal(data.total)
      }
    } catch (err) { console.error('Orders error:', err) }
  }

  const loadOrderDetail = async (orderId: string) => {
    try {
      const token = await getToken()
      const res = await fetch(`${backendUrl}/admin/orders/${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setSelectedOrder(data)
        setTrackingNumber(data.tracking_number || '')
        setTrackingUrl(data.tracking_url || '')
        setCarrier(data.shipping_carrier || '')
      }
    } catch (err) { console.error('Order detail error:', err) }
  }

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdating(true)
    try {
      const token = await getToken()
      const res = await fetch(`${backendUrl}/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          tracking_number: trackingNumber || undefined,
          tracking_url: trackingUrl || undefined,
          shipping_carrier: carrier || undefined,
          notes: statusNotes || undefined,
        }),
      })
      if (res.ok) {
        loadOrders()
        loadStats()
        if (selectedOrder) loadOrderDetail(selectedOrder.id)
        setStatusNotes('')
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to update status')
      }
    } catch (err) { console.error('Status update error:', err) }
    setUpdating(false)
  }

  const flagOrder = async (orderId: string, flagged: boolean) => {
    try {
      const token = await getToken()
      await fetch(`${backendUrl}/admin/orders/${orderId}/flag`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ manual_review: flagged }),
      })
      loadOrders()
      loadStats()
    } catch (err) { console.error('Flag error:', err) }
  }

  const loadReturns = async () => {
    try {
      const token = await getToken()
      const res = await fetch(`${backendUrl}/admin/returns`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) setReturns(await res.json())
    } catch (err) { console.error('Returns error:', err) }
  }

  const updateReturn = async (returnId: string, status: string, adminNotes?: string) => {
    try {
      const token = await getToken()
      await fetch(`${backendUrl}/admin/returns/${returnId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status, admin_notes: adminNotes }),
      })
      loadReturns()
    } catch (err) { console.error('Return update error:', err) }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}
          </div>
        </div>
      </div>
    )
  }

  if (!authorized) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">You need admin or maker permissions to access this page.</p>
        <Link to="/" className="text-amber-600 hover:text-amber-700 font-semibold">Back to Home</Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setTab('orders')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${tab === 'orders' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Orders
          </button>
          <button
            onClick={() => setTab('returns')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${tab === 'returns' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Returns
          </button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<ShoppingBag className="w-6 h-6" />} label="Total Orders" value={stats.total_orders} color="text-blue-600" bg="bg-blue-50" />
          <StatCard icon={<DollarSign className="w-6 h-6" />} label="Revenue" value={`€${stats.total_revenue.toFixed(2)}`} color="text-green-600" bg="bg-green-50" />
          <StatCard icon={<Clock className="w-6 h-6" />} label="Pending" value={stats.pending} color="text-yellow-600" bg="bg-yellow-50" />
          <StatCard icon={<AlertTriangle className="w-6 h-6" />} label="Flagged" value={stats.flagged} color="text-red-600" bg="bg-red-50" />
          <StatCard icon={<Package className="w-6 h-6" />} label="Processing" value={stats.processing} color="text-blue-600" bg="bg-blue-50" />
          <StatCard icon={<Truck className="w-6 h-6" />} label="Shipped" value={stats.shipped} color="text-purple-600" bg="bg-purple-50" />
          <StatCard icon={<CheckCircle className="w-6 h-6" />} label="Delivered" value={stats.delivered} color="text-green-600" bg="bg-green-50" />
          <StatCard icon={<XCircle className="w-6 h-6" />} label="Cancelled" value={stats.cancelled} color="text-gray-600" bg="bg-gray-50" />
        </div>
      )}

      {tab === 'orders' && (
        <>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order number..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Order</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Customer</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Total</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Date</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((order) => {
                    const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
                    return (
                      <tr key={order.id} className={`hover:bg-gray-50 ${order.manual_review ? 'bg-orange-50' : ''}`}>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900 text-sm">{order.order_number}</div>
                          {order.manual_review && (
                            <span className="text-xs text-orange-600 font-medium flex items-center gap-1">
                              <Flag className="w-3 h-3" /> Flagged
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-900">{order.profiles?.full_name || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{order.profiles?.email || ''}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${sc.color}`}>
                            {sc.icon} {sc.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          €{order.total_amount.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString('lt-LT')}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => loadOrderDetail(order.id)}
                              className="text-amber-600 hover:text-amber-700 p-1"
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => flagOrder(order.id, !order.manual_review)}
                              className={`p-1 ${order.manual_review ? 'text-orange-600' : 'text-gray-400 hover:text-orange-600'}`}
                              title={order.manual_review ? 'Remove flag' : 'Flag for review'}
                            >
                              <Flag className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No orders found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {total > 20 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-600">
                Page {page} of {Math.ceil(total / 20)}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * 20 >= total}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {tab === 'returns' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">RMA</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Order</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Customer</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Reason</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Amount</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {returns.map((ret: any) => (
                  <tr key={ret.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono font-medium">{ret.rma_number}</td>
                    <td className="px-4 py-3 text-sm">{ret.orders?.order_number || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm">{ret.profiles?.full_name || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{ret.reason}</td>
                    <td className="px-4 py-3 text-sm font-medium">€{ret.refund_amount?.toFixed(2) || '0.00'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                        ret.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        ret.status === 'approved' ? 'bg-green-100 text-green-700' :
                        ret.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {ret.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {ret.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateReturn(ret.id, 'approved')}
                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateReturn(ret.id, 'rejected')}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {ret.status === 'approved' && (
                        <button
                          onClick={() => updateReturn(ret.id, 'refunded')}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Mark Refunded
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {returns.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">No return requests</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedOrder.order_number}</h2>
                  <p className="text-sm text-gray-500">
                    {new Date(selectedOrder.created_at).toLocaleString('lt-LT')}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  &times;
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Customer</h3>
                  <p className="text-sm">{selectedOrder.profiles?.full_name || 'N/A'}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.profiles?.email || ''}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Shipping Address</h3>
                  {selectedOrder.shipping_address && (
                    <div className="text-sm text-gray-600">
                      <p>{selectedOrder.shipping_address.full_name}</p>
                      <p>{selectedOrder.shipping_address.address_line1}</p>
                      {selectedOrder.shipping_address.address_line2 && <p>{selectedOrder.shipping_address.address_line2}</p>}
                      <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.postal_code}</p>
                      <p>{selectedOrder.shipping_address.country}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Items</h3>
                <div className="space-y-2">
                  {selectedOrder.order_items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.products?.title || 'Product'}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity} × €{item.price.toFixed(2)}</p>
                      </div>
                      <p className="font-medium text-sm">€{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-3 pt-3 border-t font-bold">
                  <span>Total</span>
                  <span className="text-amber-600">€{selectedOrder.total_amount.toFixed(2)}</span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Status & Shipping</h3>
                <div className="space-y-3">
                  {(selectedOrder.status === 'processing' || selectedOrder.status === 'shipped') && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Tracking number"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
                        />
                        <input
                          type="text"
                          placeholder="Tracking URL"
                          value={trackingUrl}
                          onChange={(e) => setTrackingUrl(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <select
                        value={carrier}
                        onChange={(e) => setCarrier(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="">Select carrier</option>
                        <option value="lietuvos_pastas">Lietuvos Paštas</option>
                        <option value="omniva">Omniva</option>
                        <option value="dpd">DPD</option>
                      </select>
                    </>
                  )}

                  <input
                    type="text"
                    placeholder="Notes (optional)"
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
                  />

                  <div className="flex flex-wrap gap-2">
                    {(VALID_TRANSITIONS[selectedOrder.status] || []).map((nextStatus) => {
                      const sc = STATUS_CONFIG[nextStatus] || { label: nextStatus, color: 'bg-gray-100 text-gray-700' }
                      return (
                        <button
                          key={nextStatus}
                          onClick={() => updateStatus(selectedOrder.id, nextStatus)}
                          disabled={updating}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                            nextStatus === 'cancelled' || nextStatus === 'manual_review'
                              ? 'bg-red-50 text-red-700 hover:bg-red-100'
                              : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                          }`}
                        >
                          {updating ? '...' : `→ ${sc.label}`}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800"><strong>Notes:</strong> {selectedOrder.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, color, bg }: {
  icon: React.ReactNode; label: string; value: string | number; color: string; bg: string
}) {
  return (
    <div className={`${bg} rounded-xl p-4`}>
      <div className={`${color} mb-2`}>{icon}</div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  )
}

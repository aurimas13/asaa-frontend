import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { User, Mail, MapPin, Camera, CreditCard, CheckCircle, AlertCircle, ExternalLink, DollarSign } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface Profile {
  full_name: string
  email: string
  bio: string
  country: string
  avatar_url: string
  is_maker: boolean
}

interface StripeStatus {
  connected: boolean
  account_status: string | null
  charges_enabled: boolean
  payouts_enabled: boolean
  details_submitted: boolean
}

interface EarningsSummary {
  total_gross: number
  total_fees: number
  total_paid: number
  pending_reserve: number
}

export const Profile: React.FC = () => {
  const { user, signOut, session } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [profile, setProfile] = useState<Profile>({
    full_name: '',
    email: '',
    bio: '',
    country: 'Lithuania',
    avatar_url: '',
    is_maker: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null)
  const [stripeLoading, setStripeLoading] = useState(false)
  const [earnings, setEarnings] = useState<EarningsSummary | null>(null)

  useEffect(() => {
    if (user) loadProfile()
  }, [user])

  useEffect(() => {
    const stripeParam = searchParams.get('stripe')
    if (stripeParam === 'success') {
      setMessage('Stripe account setup in progress. Status will update shortly.')
      if (profile.is_maker) {
        loadStripeStatus()
      }
    } else if (stripeParam === 'refresh') {
      setMessage('Please complete your Stripe account setup.')
    }
  }, [searchParams, profile.is_maker])

  const loadProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .single()

    if (data) {
      setProfile({
        full_name: data.full_name || '',
        email: data.email || '',
        bio: data.bio || '',
        country: data.country || 'Lithuania',
        avatar_url: data.avatar_url || '',
        is_maker: data.is_maker || false,
      })

      if (data.is_maker) {
        const { data: maker } = await supabase
          .from('makers')
          .select('id')
          .eq('user_id', user?.id)
          .maybeSingle()

        if (maker) {
          loadStripeStatus()
          loadEarnings(maker.id)
        }
      }
    }
    setLoading(false)
  }

  const loadStripeStatus = async () => {
    if (!session?.access_token) return

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-connect-onboarding`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ action: 'status' }),
        }
      )

      if (response.ok) {
        const data = await response.json()
        setStripeStatus(data)
      }
    } catch (error) {
      console.error('Error loading Stripe status:', error)
    }
  }

  const loadEarnings = async (mId: string) => {
    const { data: transfers } = await supabase
      .from('stripe_transfers')
      .select('gross_amount, platform_fee, immediate_amount, reserve_amount, reserve_released, status')
      .eq('maker_id', mId)

    if (transfers) {
      const summary: EarningsSummary = {
        total_gross: 0,
        total_fees: 0,
        total_paid: 0,
        pending_reserve: 0,
      }

      for (const t of transfers) {
        if (t.status !== 'failed' && t.status !== 'refunded') {
          summary.total_gross += Number(t.gross_amount)
          summary.total_fees += Number(t.platform_fee)
          summary.total_paid += Number(t.immediate_amount)
          if (t.reserve_released) {
            summary.total_paid += Number(t.reserve_amount)
          } else {
            summary.pending_reserve += Number(t.reserve_amount)
          }
        }
      }

      setEarnings(summary)
    }
  }

  const handleConnectStripe = async () => {
    if (!session?.access_token) return

    setStripeLoading(true)
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-connect-onboarding`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            action: stripeStatus?.connected ? 'refresh' : 'create',
            return_url: `${window.location.origin}/profile?stripe=success`,
            refresh_url: `${window.location.origin}/profile?stripe=refresh`,
          }),
        }
      )

      if (response.ok) {
        const data = await response.json()
        if (data.url) {
          window.location.href = data.url
        }
      } else {
        const error = await response.json()
        setMessage(error.error || 'Failed to connect Stripe')
      }
    } catch (error) {
      setMessage('Failed to connect Stripe account')
    } finally {
      setStripeLoading(false)
    }
  }

  const handleStripeDashboard = async () => {
    if (!session?.access_token) return

    setStripeLoading(true)
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-connect-onboarding`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ action: 'dashboard' }),
        }
      )

      if (response.ok) {
        const data = await response.json()
        if (data.url) {
          window.open(data.url, '_blank')
        }
      }
    } catch (error) {
      setMessage('Failed to open Stripe dashboard')
    } finally {
      setStripeLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        bio: profile.bio,
        country: profile.country,
      })
      .eq('id', user?.id)

    if (error) {
      setMessage('Failed to update profile')
    } else {
      setMessage('Profile updated successfully')
    }
    setSaving(false)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Please sign in to view your profile</h2>
        <Link to="/signin" className="text-amber-600 hover:text-amber-700 font-semibold">
          Sign In
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="bg-gray-200 h-32 rounded-xl" />
          <div className="bg-gray-200 h-64 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center overflow-hidden">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-amber-600" />
              )}
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border border-gray-200">
              <Camera className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-semibold">{profile.full_name || 'Add your name'}</h2>
            <p className="text-gray-500">{profile.email}</p>
            {profile.is_maker && (
              <span className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                Maker Account
              </span>
            )}
          </div>
        </div>
      </div>

      {profile.is_maker && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-gray-600" />
            Payment Setup
          </h3>

          {stripeStatus === null ? (
            <div className="animate-pulse h-20 bg-gray-100 rounded-lg" />
          ) : stripeStatus.connected ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
                {stripeStatus.charges_enabled && stripeStatus.payouts_enabled ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-medium">
                    {stripeStatus.charges_enabled && stripeStatus.payouts_enabled
                      ? 'Stripe account active'
                      : 'Stripe setup incomplete'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {stripeStatus.charges_enabled && stripeStatus.payouts_enabled
                      ? 'Your account is ready to receive payments from sales.'
                      : 'Please complete your account setup to receive payments.'}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${stripeStatus.charges_enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {stripeStatus.charges_enabled ? 'Charges Enabled' : 'Charges Pending'}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${stripeStatus.payouts_enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {stripeStatus.payouts_enabled ? 'Payouts Enabled' : 'Payouts Pending'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                {!stripeStatus.charges_enabled || !stripeStatus.payouts_enabled ? (
                  <button
                    onClick={handleConnectStripe}
                    disabled={stripeLoading}
                    className="flex-1 bg-amber-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {stripeLoading ? 'Loading...' : 'Complete Setup'}
                    <ExternalLink className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleStripeDashboard}
                    disabled={stripeLoading}
                    className="flex-1 bg-gray-900 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {stripeLoading ? 'Loading...' : 'Open Stripe Dashboard'}
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">
                Connect your Stripe account to receive payments when customers purchase your products.
                We use Stripe for secure, reliable payments.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  <strong>How it works:</strong> When a customer buys your product, 90% goes to you
                  (85% immediately, 15% after 30 days). The platform keeps 10% commission.
                </p>
              </div>
              <button
                onClick={handleConnectStripe}
                disabled={stripeLoading}
                className="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {stripeLoading ? 'Loading...' : 'Connect Stripe Account'}
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {profile.is_maker && earnings && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-gray-600" />
            Earnings Summary
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">{earnings.total_gross.toFixed(2)} EUR</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Platform Fees</p>
              <p className="text-2xl font-bold text-gray-500">{earnings.total_fees.toFixed(2)} EUR</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-700">Paid to You</p>
              <p className="text-2xl font-bold text-green-700">{earnings.total_paid.toFixed(2)} EUR</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-4">
              <p className="text-sm text-amber-700">Pending Reserve</p>
              <p className="text-2xl font-bold text-amber-700">{earnings.pending_reserve.toFixed(2)} EUR</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Reserve funds are released 30 days after purchase to protect against refunds.
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {message && (
          <div className={`p-4 rounded-lg mb-6 ${message.includes('success') || message.includes('progress') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={profile.country}
                onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="Lithuania">Lithuania</option>
                <option value="Latvia">Latvia</option>
                <option value="Estonia">Estonia</option>
                <option value="Poland">Poland</option>
                <option value="Germany">Germany</option>
                <option value="France">France</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, MapPin, CheckCircle, XCircle, AlertCircle, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'

interface Maker {
  id: string
  business_name: string
  description: string
  cover_image: string
  country: string
  city: string
  verified: boolean
  rating: number
  total_sales: number
}

export const Makers: React.FC = () => {
  const [makers, setMakers] = useState<Maker[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const { t } = useTranslation()

  useEffect(() => {
    loadMakers()
  }, [filter])

  const loadMakers = async () => {
    setLoading(true)
    let query = supabase
      .from('makers')
      .select('id, business_name, description, cover_image, country, city, verified, rating, total_sales')
      .order('rating', { ascending: false })

    if (filter === 'verified') {
      query = query.eq('verified', true)
    } else if (filter === 'unverified') {
      query = query.eq('verified', false)
    }

    const { data, error } = await query.limit(50)
    if (error) console.error('Error:', error)
    if (data) setMakers(data)
    setLoading(false)
  }

  const verifiedCount = makers.filter(m => m.verified).length
  const unverifiedCount = makers.filter(m => !m.verified).length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gradient-to-r from-secondary-50 to-primary-50 rounded-2xl p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-secondary-600" />
              </div>
              {t('makers.title')}
            </h1>
            <p className="text-gray-600 mt-2">{t('makers.subtitle')}</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white rounded-xl px-4 py-3 shadow-sm text-center">
              <p className="text-2xl font-bold text-secondary-600">{makers.length}</p>
              <p className="text-sm text-gray-500">{t('makers.total', 'Total Makers')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-8 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-primary-800 font-medium">{t('makers.verificationNotice.title', 'Verification Notice')}</p>
          <p className="text-primary-700 text-sm mt-1">
            {t('makers.verificationNotice.desc', 'We are currently contacting makers for verification before Kaziuko muge 2026 (March 6-8). Unverified makers are awaiting approval confirmation.')}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setFilter('')}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
            filter === ''
              ? 'bg-gray-900 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          {t('makers.filter.all', 'All Makers')} ({makers.length})
        </button>
        <button
          onClick={() => setFilter('verified')}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 ${
            filter === 'verified'
              ? 'bg-secondary-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-secondary-50 border border-gray-200'
          }`}
        >
          <CheckCircle className="w-4 h-4" /> {t('makers.verified')} ({verifiedCount})
        </button>
        <button
          onClick={() => setFilter('unverified')}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 ${
            filter === 'unverified'
              ? 'bg-gray-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <XCircle className="w-4 h-4" /> {t('makers.unverified', 'Not Verified')} ({unverifiedCount})
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-xl" />
              <div className="mt-4 bg-gray-200 h-4 rounded w-3/4" />
              <div className="mt-2 bg-gray-200 h-4 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : makers.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900">{t('makers.noResults', 'No makers found')}</h3>
          <p className="text-gray-600 mt-2">{t('makers.noResultsDesc', 'Try adjusting your filters')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {makers.map((maker, index) => (
            <Link
              key={maker.id}
              to={`/maker/${maker.id}`}
              className="group animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary-200">
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={maker.cover_image || 'https://images.pexels.com/photos/3094218/pexels-photo-3094218.jpeg?auto=compress&cs=tinysrgb&w=800'}
                    alt={maker.business_name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute top-3 right-3">
                    {maker.verified ? (
                      <span className="bg-secondary-500 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium shadow-lg">
                        <CheckCircle className="w-3.5 h-3.5" /> {t('makers.verified')}
                      </span>
                    ) : (
                      <span className="bg-gray-500/90 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium">
                        <XCircle className="w-3.5 h-3.5" /> {t('makers.unverified', 'Not Verified')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                    {maker.business_name}
                  </h3>
                  {(maker.city || maker.country) && (
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {[maker.city, maker.country].filter(Boolean).join(', ')}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mt-3 line-clamp-2">{maker.description}</p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    {maker.rating > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 fill-primary-400 text-primary-400" />
                        <span className="font-semibold text-gray-900">{maker.rating.toFixed(1)}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">{t('makers.newMaker', 'New maker')}</span>
                    )}
                    {maker.total_sales > 0 && (
                      <span className="text-sm text-gray-500">{maker.total_sales} {t('makers.sales')}</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-16 bg-gradient-to-r from-secondary-600 to-primary-500 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-bold">{t('makers.becomeMaker.title', 'Are you a Lithuanian craftsperson?')}</h2>
        <p className="mt-2 text-secondary-100 max-w-xl mx-auto">
          {t('makers.becomeMaker.desc', 'Join our growing community of artisans and share your traditional crafts with customers across Europe.')}
        </p>
        <Link
          to="/become-maker"
          className="mt-6 inline-block bg-white text-secondary-600 px-8 py-3 rounded-xl font-semibold hover:bg-primary-50 transition-colors shadow-lg"
        >
          {t('nav.becomeMaker')}
        </Link>
      </div>
    </div>
  )
}

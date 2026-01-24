import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, MapPin, CheckCircle } from 'lucide-react'
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
    }

    const { data, error } = await query.limit(20)
    if (error) console.error('Error:', error)
    if (data) setMakers(data)
    setLoading(false)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Our Artisans</h1>
          <p className="text-gray-600 mt-1">Meet the talented makers behind our products</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilter('')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === '' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Makers
          </button>
          <button
            onClick={() => setFilter('verified')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              filter === 'verified' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <CheckCircle className="w-4 h-4" /> Verified
          </button>
        </div>
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
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {makers.map((maker) => (
            <Link key={maker.id} to={`/maker/${maker.id}`} className="group">
              <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="h-48 overflow-hidden">
                  <img
                    src={maker.cover_image || 'https://images.pexels.com/photos/3094218/pexels-photo-3094218.jpeg?auto=compress&cs=tinysrgb&w=800'}
                    alt={maker.business_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg text-gray-900">{maker.business_name}</h3>
                    {maker.verified && (
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                  {(maker.city || maker.country) && (
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {[maker.city, maker.country].filter(Boolean).join(', ')}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{maker.description}</p>
                  <div className="flex items-center justify-between mt-4">
                    {maker.rating > 0 && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="font-medium">{maker.rating.toFixed(1)}</span>
                      </div>
                    )}
                    {maker.total_sales > 0 && (
                      <span className="text-sm text-gray-500">{maker.total_sales} sales</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

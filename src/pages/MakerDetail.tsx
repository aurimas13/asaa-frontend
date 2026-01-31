import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star, MapPin, CheckCircle, Globe, Instagram, ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useTranslation } from 'react-i18next'

interface Maker {
  id: string
  business_name: string
  description: string
  description_lt: string | null
  description_fr: string | null
  cover_image: string
  country: string
  city: string
  verified: boolean
  rating: number
  total_sales: number
  website: string
  instagram: string
}

interface Product {
  id: string
  title: string
  price: number
  images: string[]
  rating: number
}

export const MakerDetail: React.FC = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const { t, i18n } = useTranslation()
  const [maker, setMaker] = useState<Maker | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)

  const getLocalizedDescription = (m: Maker) => {
    const lang = i18n.language
    if (lang === 'lt' && m.description_lt) return m.description_lt
    if (lang === 'fr' && m.description_fr) return m.description_fr
    return m.description
  }

  useEffect(() => {
    if (id) {
      loadMaker()
      loadProducts()
      if (user) checkFollow()
    }
  }, [id, user])

  const loadMaker = async () => {
    const { data } = await supabase.from('makers').select('*').eq('id', id).single()
    if (data) setMaker(data)
    setLoading(false)
  }

  const loadProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('id, title, price, images, rating')
      .eq('maker_id', id)
      .eq('status', 'active')
      .limit(12)

    if (data) setProducts(data)
  }

  const checkFollow = async () => {
    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('maker_id', id)
      .eq('user_id', user?.id)
      .maybeSingle()

    setIsFollowing(!!data)
  }

  const toggleFollow = async () => {
    if (!user) {
      alert('Please sign in to follow makers')
      return
    }

    if (isFollowing) {
      await supabase.from('follows').delete().eq('maker_id', id).eq('user_id', user.id)
      setIsFollowing(false)
    } else {
      await supabase.from('follows').insert({ maker_id: id, user_id: user.id })
      setIsFollowing(true)
    }
  }

  const getImageUrl = (images: string[] | string | null) => {
    if (!images) return 'https://images.pexels.com/photos/1070971/pexels-photo-1070971.jpeg?auto=compress&cs=tinysrgb&w=800'
    const parsed = typeof images === 'string' ? JSON.parse(images) : images
    return parsed[0] || 'https://images.pexels.com/photos/1070971/pexels-photo-1070971.jpeg?auto=compress&cs=tinysrgb&w=800'
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="bg-gray-200 h-64 rounded-xl" />
          <div className="mt-6 bg-gray-200 h-8 rounded w-1/3" />
        </div>
      </div>
    )
  }

  if (!maker) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold">{t('makerDetail.notFound', 'Maker not found')}</h2>
        <Link to="/makers" className="text-amber-600 hover:underline mt-4 inline-block">
          {t('makerDetail.browseAll', 'Browse all makers')}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/makers" className="flex items-center gap-2 text-gray-600 hover:text-amber-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> {t('makerDetail.backToMakers', 'Back to Makers')}
      </Link>

      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
        <div className="h-64 relative">
          <img
            src={maker.cover_image || 'https://images.pexels.com/photos/3094218/pexels-photo-3094218.jpeg?auto=compress&cs=tinysrgb&w=1200'}
            alt={maker.business_name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{maker.business_name}</h1>
              {maker.verified && (
                <span className="bg-green-500 text-white text-sm px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> {t('makers.verified')}
                </span>
              )}
            </div>
            {(maker.city || maker.country) && (
              <p className="flex items-center gap-2 mt-2 text-white/90">
                <MapPin className="w-4 h-4" />
                {[maker.city, maker.country].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            {maker.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span className="font-semibold">{maker.rating.toFixed(1)}</span>
              </div>
            )}
            {maker.total_sales > 0 && (
              <span className="text-gray-600">{maker.total_sales} {t('makers.sales')}</span>
            )}
            {maker.website && (
              <a href={maker.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-amber-600 hover:underline">
                <Globe className="w-4 h-4" /> {t('makerDetail.website', 'Website')}
              </a>
            )}
            {maker.instagram && (
              <a href={`https://instagram.com/${maker.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-amber-600 hover:underline">
                <Instagram className="w-4 h-4" /> @{maker.instagram}
              </a>
            )}
          </div>

          <p className="text-gray-700 leading-relaxed">{getLocalizedDescription(maker)}</p>

          <button
            onClick={toggleFollow}
            className={`mt-6 px-6 py-2 rounded-lg font-semibold transition-colors ${
              isFollowing
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-amber-600 text-white hover:bg-amber-700'
            }`}
          >
            {isFollowing ? t('makerDetail.following', 'Following') : t('makerDetail.follow', 'Follow')}
          </button>
        </div>
      </div>

      {products.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('makerDetail.productsBy', 'Products by')} {maker.business_name}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link key={product.id} to={`/product/${product.id}`} className="group">
                <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={getImageUrl(product.images)}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{product.title}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-lg font-bold text-amber-600">€{product.price.toFixed(2)}</span>
                      {product.rating > 0 && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          {product.rating.toFixed(1)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

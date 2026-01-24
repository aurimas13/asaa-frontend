import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Star, TrendingUp, Award } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'

interface Product {
  id: string
  title: string
  price: number
  images: string[]
  rating: number
  makers: { business_name: string }
}

interface Maker {
  id: string
  business_name: string
  cover_image: string
  rating: number
  verified: boolean
}

export const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [topMakers, setTopMakers] = useState<Maker[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useTranslation()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [productsRes, makersRes] = await Promise.all([
        supabase
          .from('products')
          .select('id, title, price, images, rating, makers(business_name)')
          .eq('status', 'active')
          .eq('featured', true)
          .limit(8),
        supabase
          .from('makers')
          .select('id, business_name, cover_image, rating, verified')
          .eq('verified', true)
          .order('rating', { ascending: false })
          .limit(4)
      ])

      if (productsRes.data) setFeaturedProducts(productsRes.data as unknown as Product[])
      if (makersRes.data) setTopMakers(makersRes.data)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getImageUrl = (images: string[] | string | null) => {
    if (!images) return 'https://images.pexels.com/photos/1070971/pexels-photo-1070971.jpeg?auto=compress&cs=tinysrgb&w=800'
    const parsed = typeof images === 'string' ? JSON.parse(images) : images
    return parsed[0] || 'https://images.pexels.com/photos/1070971/pexels-photo-1070971.jpeg?auto=compress&cs=tinysrgb&w=800'
  }

  return (
    <div>
      <section className="relative bg-gradient-to-br from-amber-50 to-orange-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                {t('home.hero.title')} <span className="text-amber-600">{t('home.hero.titleHighlight')}</span>
              </h1>
              <p className="mt-6 text-lg text-gray-600">
                {t('home.hero.subtitle')}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/products"
                  className="bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors flex items-center gap-2"
                >
                  {t('home.hero.exploreProducts')} <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/makers"
                  className="bg-white text-amber-600 border-2 border-amber-600 px-6 py-3 rounded-lg font-semibold hover:bg-amber-50 transition-colors"
                >
                  {t('home.hero.meetMakers')}
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.pexels.com/photos/6044266/pexels-photo-6044266.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Handcrafted pottery"
                className="rounded-2xl shadow-lg"
              />
              <img
                src="https://images.pexels.com/photos/4219654/pexels-photo-4219654.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Artisan at work"
                className="rounded-2xl shadow-lg mt-8"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-amber-600">500+</p>
              <p className="text-gray-600">{t('home.features.unique.title')}</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-600">150+</p>
              <p className="text-gray-600">{t('makers.verified')}</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-600">15+</p>
              <p className="text-gray-600">{t('home.features.support.title')}</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-600">10k+</p>
              <p className="text-gray-600">{t('home.features.events.title')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-8 h-8 text-amber-600" />
                {t('home.featured')}
              </h2>
              <p className="text-gray-600 mt-2">{t('home.features.unique.description')}</p>
            </div>
            <Link to="/products" className="text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1">
              {t('home.viewAll')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-64 rounded-xl" />
                  <div className="mt-4 bg-gray-200 h-4 rounded w-3/4" />
                  <div className="mt-2 bg-gray-200 h-4 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <Link key={product.id} to={`/product/${product.id}`} className="group">
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={getImageUrl(product.images)}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 group-hover:text-amber-600 transition-colors line-clamp-1">
                        {product.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">{product.makers?.business_name}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-lg font-bold text-amber-600">{product.price.toFixed(2)}</span>
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
          )}
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Award className="w-8 h-8 text-amber-600" />
                {t('makers.title')}
              </h2>
              <p className="text-gray-600 mt-2">{t('makers.subtitle')}</p>
            </div>
            <Link to="/makers" className="text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1">
              {t('home.viewAll')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topMakers.map((maker) => (
              <Link key={maker.id} to={`/maker/${maker.id}`} className="group">
                <div className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={maker.cover_image || 'https://images.pexels.com/photos/3094218/pexels-photo-3094218.jpeg?auto=compress&cs=tinysrgb&w=800'}
                      alt={maker.business_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{maker.business_name}</h3>
                      {maker.verified && (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">{t('makers.verified')}</span>
                      )}
                    </div>
                    {maker.rating > 0 && (
                      <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        {maker.rating.toFixed(1)}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-amber-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">{t('home.becomeMakerCTA.title')}</h2>
          <p className="mt-4 text-amber-100 max-w-2xl mx-auto">
            {t('home.becomeMakerCTA.subtitle')}
          </p>
          <Link
            to="/become-maker"
            className="mt-8 inline-block bg-white text-amber-600 px-8 py-3 rounded-lg font-semibold hover:bg-amber-50 transition-colors"
          >
            {t('home.becomeMakerCTA.button')}
          </Link>
        </div>
      </section>
    </div>
  )
}

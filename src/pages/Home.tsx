import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Star, TrendingUp, Award, ShoppingBag, Truck, Shield, Clock, ChevronRight } from 'lucide-react'
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
  city: string
  country: string
}

interface Category {
  id: string
  name: string
  slug: string
  image_url: string
}

export const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [topMakers, setTopMakers] = useState<Maker[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useTranslation()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [productsRes, makersRes, categoriesRes] = await Promise.all([
        supabase
          .from('products')
          .select('id, title, price, images, rating, makers(business_name)')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(8),
        supabase
          .from('makers')
          .select('id, business_name, cover_image, rating, verified, city, country')
          .order('rating', { ascending: false })
          .limit(4),
        supabase
          .from('categories')
          .select('id, name, slug, image_url')
          .is('parent_id', null)
          .limit(6)
      ])

      if (productsRes.data) setFeaturedProducts(productsRes.data as unknown as Product[])
      if (makersRes.data) setTopMakers(makersRes.data)
      if (categoriesRes.data) setCategories(categoriesRes.data)
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
    <div className="animate-fade-in">
      <section className="relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 flex">
          <div className="flex-1 bg-lithuanian-yellow"></div>
          <div className="flex-1 bg-lithuanian-green"></div>
          <div className="flex-1 bg-lithuanian-red"></div>
        </div>
        <div className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-8 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="animate-slide-up">
                <div className="inline-flex items-center gap-2 bg-secondary-100 text-secondary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <span className="w-2 h-2 bg-secondary-500 rounded-full animate-pulse"></span>
                  {t('home.hero.badge', 'Preparing for Kaziuko muge 2026')}
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  {t('home.hero.title')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500">{t('home.hero.titleHighlight')}</span>
                </h1>
                <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                  {t('home.hero.subtitle')}
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    to="/products"
                    className="group bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-300 flex items-center gap-2 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5"
                  >
                    {t('home.hero.exploreProducts')} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/makers"
                    className="group bg-white text-secondary-600 border-2 border-secondary-500 px-8 py-4 rounded-xl font-semibold hover:bg-secondary-50 transition-all duration-300 flex items-center gap-2"
                  >
                    {t('home.hero.meetMakers')} <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 animate-scale-in">
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
                    <img
                      src="https://images.pexels.com/photos/6044266/pexels-photo-6044266.jpeg?auto=compress&cs=tinysrgb&w=600"
                      alt="Handcrafted pottery"
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
                    <img
                      src="https://images.pexels.com/photos/5708069/pexels-photo-5708069.jpeg?auto=compress&cs=tinysrgb&w=600"
                      alt="Straw ornaments"
                      className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
                    <img
                      src="https://images.pexels.com/photos/4219654/pexels-photo-4219654.jpeg?auto=compress&cs=tinysrgb&w=600"
                      alt="Artisan at work"
                      className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
                    <img
                      src="https://images.pexels.com/photos/5370697/pexels-photo-5370697.jpeg?auto=compress&cs=tinysrgb&w=600"
                      alt="Baltic amber"
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-sm font-medium text-gray-900">Baltic Amber</p>
                      <p className="text-xs text-gray-600">From Palanga masters</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3 p-4 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <Truck className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{t('home.trustBadges.shipping', 'Free Shipping')}</p>
                <p className="text-sm text-gray-500">{t('home.trustBadges.shippingDesc', 'On orders over 50')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-secondary-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{t('home.trustBadges.secure', 'Secure Payment')}</p>
                <p className="text-sm text-gray-500">{t('home.trustBadges.secureDesc', '100% protected')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-accent-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{t('home.trustBadges.returns', '30-Day Returns')}</p>
                <p className="text-sm text-gray-500">{t('home.trustBadges.returnsDesc', 'Easy returns')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{t('home.trustBadges.authentic', 'Authentic Crafts')}</p>
                <p className="text-sm text-gray-500">{t('home.trustBadges.authenticDesc', 'Verified makers')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-600 group-hover:scale-110 transition-transform inline-block">30+</p>
              <p className="text-gray-600 mt-1">{t('home.stats.products', 'Handcrafted Products')}</p>
            </div>
            <div className="group">
              <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-secondary-500 to-secondary-600 group-hover:scale-110 transition-transform inline-block">14+</p>
              <p className="text-gray-600 mt-1">{t('home.stats.makers', 'Lithuanian Makers')}</p>
            </div>
            <div className="group">
              <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-500 to-accent-600 group-hover:scale-110 transition-transform inline-block">8</p>
              <p className="text-gray-600 mt-1">{t('home.stats.categories', 'Craft Categories')}</p>
            </div>
            <div className="group">
              <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500 group-hover:scale-110 transition-transform inline-block">4.8</p>
              <p className="text-gray-600 mt-1">{t('home.stats.rating', 'Average Rating')}</p>
            </div>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{t('home.categories')}</h2>
                <p className="text-gray-600 mt-2">{t('home.categoriesDesc', 'Explore traditional Lithuanian crafts')}</p>
              </div>
              <Link to="/categories" className="text-secondary-600 hover:text-secondary-700 font-semibold flex items-center gap-1 group">
                {t('home.viewAll')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category, index) => (
                <Link
                  key={category.id}
                  to={`/products?category=${category.id}`}
                  className="group relative rounded-2xl overflow-hidden aspect-square"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <img
                    src={category.image_url || 'https://images.pexels.com/photos/1070971/pexels-photo-1070971.jpeg?auto=compress&cs=tinysrgb&w=400'}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-semibold text-sm md:text-base">{category.name}</h3>
                  </div>
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary-500 rounded-2xl transition-colors"></div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary-600" />
                </div>
                {t('home.featured')}
              </h2>
              <p className="text-gray-600 mt-2">{t('home.features.unique.description')}</p>
            </div>
            <Link to="/products" className="text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1 group">
              {t('home.viewAll')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-square rounded-2xl" />
                  <div className="mt-4 bg-gray-200 h-4 rounded w-3/4" />
                  <div className="mt-2 bg-gray-200 h-4 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product, index) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="group animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary-200">
                    <div className="aspect-square overflow-hidden relative">
                      <img
                        src={getImageUrl(product.images)}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-primary-500 hover:text-white transition-colors">
                          <ShoppingBag className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                        {product.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">{product.makers?.business_name}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xl font-bold text-primary-600">{product.price.toFixed(2)}</span>
                        {product.rating > 0 && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Star className="w-4 h-4 fill-primary-400 text-primary-400" />
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

      <section className="py-16 bg-gradient-to-br from-secondary-50 to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary-100 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-secondary-600" />
                </div>
                {t('makers.title')}
              </h2>
              <p className="text-gray-600 mt-2">{t('makers.subtitle')}</p>
            </div>
            <Link to="/makers" className="text-secondary-600 hover:text-secondary-700 font-semibold flex items-center gap-1 group">
              {t('home.viewAll')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topMakers.map((maker, index) => (
              <Link
                key={maker.id}
                to={`/maker/${maker.id}`}
                className="group animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="aspect-video overflow-hidden relative">
                    <img
                      src={maker.cover_image || 'https://images.pexels.com/photos/3094218/pexels-photo-3094218.jpeg?auto=compress&cs=tinysrgb&w=800'}
                      alt={maker.business_name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3">
                      {maker.verified ? (
                        <span className="bg-secondary-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                          {t('makers.verified')}
                        </span>
                      ) : (
                        <span className="bg-gray-500/80 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-medium">
                          {t('makers.unverified', 'Not Verified')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 group-hover:text-secondary-600 transition-colors">
                      {maker.business_name}
                    </h3>
                    {(maker.city || maker.country) && (
                      <p className="text-sm text-gray-500 mt-1">
                        {[maker.city, maker.country].filter(Boolean).join(', ')}
                      </p>
                    )}
                    {maker.rating > 0 && (
                      <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                        <Star className="w-4 h-4 fill-primary-400 text-primary-400" />
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

      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary-600 via-secondary-500 to-primary-500"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white">{t('home.becomeMakerCTA.title')}</h2>
          <p className="mt-4 text-secondary-100 max-w-2xl mx-auto text-lg">
            {t('home.becomeMakerCTA.subtitle')}
          </p>
          <Link
            to="/become-maker"
            className="mt-8 inline-flex items-center gap-2 bg-white text-secondary-600 px-8 py-4 rounded-xl font-semibold hover:bg-primary-50 hover:text-primary-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            {t('home.becomeMakerCTA.button')} <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-accent-50 to-primary-50 rounded-3xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {t('home.kaziuko.title', 'Kaziuko Muge 2026')}
                </h3>
                <p className="mt-4 text-gray-600">
                  {t('home.kaziuko.desc', 'Join us at the traditional Kaziuko Fair in Vilnius, March 6-8, 2026. Meet our makers in person and discover authentic Lithuanian crafts.')}
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <div className="bg-white rounded-xl px-4 py-3 shadow-sm">
                    <p className="text-sm text-gray-500">{t('home.kaziuko.date', 'Date')}</p>
                    <p className="font-bold text-gray-900">March 6-8, 2026</p>
                  </div>
                  <div className="bg-white rounded-xl px-4 py-3 shadow-sm">
                    <p className="text-sm text-gray-500">{t('home.kaziuko.location', 'Location')}</p>
                    <p className="font-bold text-gray-900">Vilnius, Lithuania</p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <img
                  src="https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Kaziuko muge fair"
                  className="rounded-2xl shadow-xl"
                />
                <div className="absolute -bottom-4 -right-4 bg-accent-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg">
                  {t('home.kaziuko.countdown', '34 days to go!')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

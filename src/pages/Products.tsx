import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, Filter, Grid, List, Package } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'

interface Product {
  id: string
  title: string
  description: string
  price: number
  images: string[]
  rating: number
  category_id: string
  makers: { business_name: string }
  categories: { name: string } | null
}

interface Category {
  id: string
  name: string
  slug: string
}

export const Products: React.FC = () => {
  const { t } = useTranslation()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    loadCategories()
    loadProducts()
  }, [selectedCategory, sortBy])

  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('id, name, slug')
    if (data) setCategories(data)
  }

  const loadProducts = async () => {
    setLoading(true)
    let query = supabase
      .from('products')
      .select('id, title, description, price, images, rating, category_id, makers(business_name), categories(name)')
      .eq('status', 'active')

    if (selectedCategory) {
      query = query.eq('category_id', selectedCategory)
    }

    switch (sortBy) {
      case 'price_low':
        query = query.order('price', { ascending: true })
        break
      case 'price_high':
        query = query.order('price', { ascending: false })
        break
      case 'rating':
        query = query.order('rating', { ascending: false })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    const { data, error } = await query.limit(24)
    if (error) console.error('Error loading products:', error)
    if (data) setProducts(data as unknown as Product[])
    setLoading(false)
  }

  const getImageUrl = (images: string[] | string | null) => {
    if (!images) return 'https://images.pexels.com/photos/1070971/pexels-photo-1070971.jpeg?auto=compress&cs=tinysrgb&w=800'
    const parsed = typeof images === 'string' ? JSON.parse(images) : images
    return parsed[0] || 'https://images.pexels.com/photos/1070971/pexels-photo-1070971.jpeg?auto=compress&cs=tinysrgb&w=800'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-primary-600" />
              </div>
              {t('products.title')}
            </h1>
            <p className="text-gray-600 mt-2">{t('products.subtitle')}</p>
          </div>
          <div className="bg-white rounded-xl px-4 py-3 shadow-sm text-center">
            <p className="text-2xl font-bold text-primary-600">{products.length}+</p>
            <p className="text-sm text-gray-500">{t('products.items')}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-8">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white shadow-sm max-h-60 overflow-y-auto"
        >
          <option value="">{t('products.allCategories')}</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{t(`categories.${cat.slug || cat.name.toLowerCase().replace(/\s+/g, '')}`, cat.name)}</option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white shadow-sm"
        >
          <option value="newest">{t('products.newest')}</option>
          <option value="price_low">{t('products.priceLow')}</option>
          <option value="price_high">{t('products.priceHigh')}</option>
          <option value="rating">{t('products.topRated')}</option>
        </select>

        <div className="flex border border-gray-200 rounded-xl overflow-hidden shadow-sm ml-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2.5 ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2.5 ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6' : 'space-y-4'}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-64 rounded-xl" />
              <div className="mt-4 bg-gray-200 h-4 rounded w-3/4" />
              <div className="mt-2 bg-gray-200 h-4 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900">{t('products.noProducts')}</h3>
          <p className="text-gray-600 mt-2">{t('products.noProductsDesc')}</p>
        </div>
      ) : viewMode === 'grid' ? (
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
                  <p className="text-xs text-amber-600 font-medium mb-1">{product.categories?.name}</p>
                  <h3 className="font-semibold text-gray-900 group-hover:text-amber-600 transition-colors line-clamp-1">
                    {product.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{product.makers?.business_name}</p>
                  <div className="flex items-center justify-between mt-3">
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
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <Link key={product.id} to={`/product/${product.id}`} className="block group">
              <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex">
                <div className="w-48 h-48 flex-shrink-0">
                  <img
                    src={getImageUrl(product.images)}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 flex-1">
                  <p className="text-xs text-amber-600 font-medium mb-1">{product.categories?.name}</p>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{product.makers?.business_name}</p>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{product.description}</p>
                  <div className="flex items-center gap-4 mt-4">
                    <span className="text-xl font-bold text-amber-600">€{product.price.toFixed(2)}</span>
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
  )
}

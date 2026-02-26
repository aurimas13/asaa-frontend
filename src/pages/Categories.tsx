import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'

interface Category {
  id: string
  name: string
  slug: string
  description: string
  image_url: string
  product_count?: number
}

export const Categories: React.FC = () => {
  const { t } = useTranslation()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('id, name, slug, description, image_url')
      .is('parent_id', null)
      .order('name')

    if (data) {
      const countsPromises = data.map(async (cat) => {
        const { count } = await supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'active')
          .eq('category_id', cat.id)
        return { ...cat, product_count: count || 0 }
      })
      const catsWithCounts = await Promise.all(countsPromises)
      setCategories(catsWithCounts)
    }
    setLoading(false)
  }

  const defaultImages: Record<string, string> = {
    ceramics: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&fit=crop&q=80',
    textiles: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&fit=crop&q=80',
    woodwork: 'https://images.unsplash.com/photo-1594040226829-7f251ab46d80?w=600&fit=crop&q=80',
    jewelry: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&fit=crop&q=80',
    'wool-felting': 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&fit=crop&q=80',
    'straw-ornaments': 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=600&fit=crop&q=80',
    blacksmithing: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&fit=crop&q=80',
    leather: 'https://images.unsplash.com/photo-1473188588951-bf5fcf23a6af?w=600&fit=crop&q=80',
    candles: 'https://images.unsplash.com/photo-1602607753498-b8485b090245?w=600&fit=crop&q=80',
    glass: 'https://images.unsplash.com/photo-1518911710364-17ec553bde5d?w=600&fit=crop&q=80',
    painting: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&fit=crop&q=80',
    'easter-eggs': 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=600&fit=crop&q=80',
    amber: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&fit=crop&q=80',
    default: 'https://images.unsplash.com/photo-1452860606245-08f8e384cc1c?w=600&fit=crop&q=80',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('categories.title')}</h1>
        <p className="text-gray-600 mt-1">{t('categories.subtitle')}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-xl" />
              <div className="mt-4 bg-gray-200 h-4 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${category.id}`}
              className="group relative overflow-hidden rounded-xl"
            >
              <div className="aspect-[4/3]">
                <img
                  src={category.image_url || defaultImages[category.slug] || defaultImages.default}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { (e.target as HTMLImageElement).src = defaultImages[category.slug] || defaultImages.default }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-bold text-white">{t(`categories.${category.slug}`, category.name)} ({category.product_count ?? 0})</h3>
                  {category.description && (
                    <p className="text-white/80 text-sm mt-1 line-clamp-2">{t(`categoryDescriptions.${category.slug}`, category.description)}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

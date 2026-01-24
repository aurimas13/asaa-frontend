import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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

    if (data) setCategories(data)
    setLoading(false)
  }

  const defaultImages: Record<string, string> = {
    ceramics: 'https://images.pexels.com/photos/6044266/pexels-photo-6044266.jpeg?auto=compress&cs=tinysrgb&w=600',
    textiles: 'https://images.pexels.com/photos/4219654/pexels-photo-4219654.jpeg?auto=compress&cs=tinysrgb&w=600',
    woodwork: 'https://images.pexels.com/photos/4219528/pexels-photo-4219528.jpeg?auto=compress&cs=tinysrgb&w=600',
    jewelry: 'https://images.pexels.com/photos/2735970/pexels-photo-2735970.jpeg?auto=compress&cs=tinysrgb&w=600',
    default: 'https://images.pexels.com/photos/1070971/pexels-photo-1070971.jpeg?auto=compress&cs=tinysrgb&w=600',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
        <p className="text-gray-600 mt-1">Browse products by category</p>
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
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-bold text-white">{category.name}</h3>
                  {category.description && (
                    <p className="text-white/80 text-sm mt-1 line-clamp-2">{category.description}</p>
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

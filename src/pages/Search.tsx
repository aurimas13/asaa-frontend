import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search as SearchIcon, Star } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Product {
  id: string
  title: string
  description: string
  price: number
  images: string[]
  rating: number
  makers: { business_name: string }
}

export const Search: React.FC = () => {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (query) {
      searchProducts()
    } else {
      setProducts([])
      setLoading(false)
    }
  }, [query])

  const searchProducts = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('products')
      .select('id, title, description, price, images, rating, makers(business_name)')
      .eq('status', 'active')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(20)

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Search Results</h1>
        {query && (
          <p className="text-gray-600 mt-2">
            Showing results for "<span className="font-semibold">{query}</span>"
          </p>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-64 rounded-xl" />
              <div className="mt-4 bg-gray-200 h-4 rounded w-3/4" />
              <div className="mt-2 bg-gray-200 h-4 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : !query ? (
        <div className="text-center py-16">
          <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900">Enter a search term</h3>
          <p className="text-gray-600 mt-2">Search for products, artisans, or categories</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900">No results found</h3>
          <p className="text-gray-600 mt-2">Try different keywords or browse our categories</p>
          <Link
            to="/products"
            className="inline-block mt-6 bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
          >
            Browse All Products
          </Link>
        </div>
      ) : (
        <>
          <p className="text-gray-600 mb-6">{products.length} products found</p>
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
        </>
      )}
    </div>
  )
}

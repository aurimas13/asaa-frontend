import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Star, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface WishlistItem {
  id: string
  products: {
    id: string
    title: string
    price: number
    images: string[]
    rating: number
    makers: { business_name: string }
  }
}

export const Wishlist: React.FC = () => {
  const { user } = useAuth()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) loadWishlist()
  }, [user])

  const loadWishlist = async () => {
    const { data } = await supabase
      .from('wishlists')
      .select('id, products(id, title, price, images, rating, makers(business_name))')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })

    if (data) setItems(data as unknown as WishlistItem[])
    setLoading(false)
  }

  const removeItem = async (itemId: string) => {
    await supabase.from('wishlists').delete().eq('id', itemId)
    setItems(items.filter(item => item.id !== itemId))
  }

  const getImageUrl = (images: string[] | string | null) => {
    if (!images) return 'https://images.pexels.com/photos/1070971/pexels-photo-1070971.jpeg?auto=compress&cs=tinysrgb&w=800'
    const parsed = typeof images === 'string' ? JSON.parse(images) : images
    return parsed[0] || 'https://images.pexels.com/photos/1070971/pexels-photo-1070971.jpeg?auto=compress&cs=tinysrgb&w=800'
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Please sign in to view your wishlist</h2>
        <Link to="/signin" className="text-amber-600 hover:text-amber-700 font-semibold">
          Sign In
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-64 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Your wishlist is empty</h2>
        <p className="text-gray-600 mb-6">Save items you love to find them easily later</p>
        <Link
          to="/products"
          className="inline-block bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
        >
          Discover Products
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 group">
            <Link to={`/product/${item.products.id}`}>
              <div className="aspect-square overflow-hidden relative">
                <img
                  src={getImageUrl(item.products.images)}
                  alt={item.products.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </Link>
            <div className="p-4">
              <Link to={`/product/${item.products.id}`}>
                <h3 className="font-semibold text-gray-900 hover:text-amber-600 transition-colors line-clamp-1">
                  {item.products.title}
                </h3>
              </Link>
              <p className="text-sm text-gray-500 mt-1">{item.products.makers?.business_name}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-lg font-bold text-amber-600">€{item.products.price.toFixed(2)}</span>
                {item.products.rating > 0 && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    {item.products.rating.toFixed(1)}
                  </div>
                )}
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="mt-3 w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 py-2 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

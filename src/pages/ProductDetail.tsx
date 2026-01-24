import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star, Heart, ShoppingCart, Truck, Shield, ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface Product {
  id: string
  title: string
  description: string
  price: number
  compare_at_price: number | null
  images: string[]
  materials: string[]
  dimensions: string
  shipping_time: string
  stock_quantity: number
  is_customizable: boolean
  customization_notes: string
  rating: number
  makers: {
    id: string
    business_name: string
    cover_image: string
    verified: boolean
  }
  categories: { name: string } | null
}

interface Review {
  id: string
  rating: number
  title: string
  comment: string
  created_at: string
  profiles: { full_name: string }
}

export const ProductDetail: React.FC = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    if (id) {
      loadProduct()
      loadReviews()
      if (user) checkWishlist()
    }
  }, [id, user])

  const loadProduct = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*, makers(id, business_name, cover_image, verified), categories(name)')
      .eq('id', id)
      .single()

    if (error) console.error('Error:', error)
    if (data) setProduct(data as Product)
    setLoading(false)
  }

  const loadReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('id, rating, title, comment, created_at, profiles(full_name)')
      .eq('product_id', id)
      .order('created_at', { ascending: false })
      .limit(5)

    if (data) setReviews(data as unknown as Review[])
  }

  const checkWishlist = async () => {
    const { data } = await supabase
      .from('wishlists')
      .select('id')
      .eq('product_id', id)
      .eq('user_id', user?.id)
      .maybeSingle()

    setIsInWishlist(!!data)
  }

  const toggleWishlist = async () => {
    if (!user) {
      alert('Please sign in to add items to wishlist')
      return
    }

    if (isInWishlist) {
      await supabase.from('wishlists').delete().eq('product_id', id).eq('user_id', user.id)
      setIsInWishlist(false)
    } else {
      await supabase.from('wishlists').insert({ product_id: id, user_id: user.id })
      setIsInWishlist(true)
    }
  }

  const addToCart = async () => {
    if (!user) {
      alert('Please sign in to add items to cart')
      return
    }

    setAddingToCart(true)
    try {
      const { data: existing } = await supabase
        .from('carts')
        .select('id, quantity')
        .eq('product_id', id)
        .eq('user_id', user.id)
        .maybeSingle()

      if (existing) {
        await supabase
          .from('carts')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id)
      } else {
        await supabase.from('carts').insert({
          user_id: user.id,
          product_id: id,
          quantity,
        })
      }
      alert('Added to cart!')
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Failed to add to cart')
    } finally {
      setAddingToCart(false)
    }
  }

  const getImages = () => {
    if (!product?.images) return ['https://images.pexels.com/photos/1070971/pexels-photo-1070971.jpeg?auto=compress&cs=tinysrgb&w=800']
    const parsed = typeof product.images === 'string' ? JSON.parse(product.images) : product.images
    return parsed.length > 0 ? parsed : ['https://images.pexels.com/photos/1070971/pexels-photo-1070971.jpeg?auto=compress&cs=tinysrgb&w=800']
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse grid md:grid-cols-2 gap-8">
          <div className="bg-gray-200 aspect-square rounded-xl" />
          <div className="space-y-4">
            <div className="bg-gray-200 h-8 rounded w-3/4" />
            <div className="bg-gray-200 h-6 rounded w-1/2" />
            <div className="bg-gray-200 h-32 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold">Product not found</h2>
        <Link to="/products" className="text-amber-600 hover:underline mt-4 inline-block">
          Browse all products
        </Link>
      </div>
    )
  }

  const images = getImages()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/products" className="flex items-center gap-2 text-gray-600 hover:text-amber-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
            <img
              src={images[selectedImage]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto">
              {images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 ${
                    selectedImage === idx ? 'border-amber-500' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.categories && (
            <p className="text-sm text-amber-600 font-medium mb-2">{product.categories.name}</p>
          )}
          <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>

          <Link to={`/maker/${product.makers?.id}`} className="flex items-center gap-3 mt-4">
            <img
              src={product.makers?.cover_image || 'https://images.pexels.com/photos/3094218/pexels-photo-3094218.jpeg?auto=compress&cs=tinysrgb&w=200'}
              alt={product.makers?.business_name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="font-medium text-gray-900 flex items-center gap-2">
                {product.makers?.business_name}
                {product.makers?.verified && (
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">Verified</span>
                )}
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2 mt-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i < Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-gray-600">({reviews.length} reviews)</span>
          </div>

          <div className="mt-6">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-amber-600">€{product.price.toFixed(2)}</span>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <span className="text-lg text-gray-400 line-through">€{product.compare_at_price.toFixed(2)}</span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
            </p>
          </div>

          <p className="text-gray-700 mt-6 leading-relaxed">{product.description}</p>

          {product.materials && product.materials.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-900">Materials:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {product.materials.map((material, idx) => (
                  <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    {material}
                  </span>
                ))}
              </div>
            </div>
          )}

          {product.dimensions && (
            <p className="text-sm text-gray-600 mt-4">
              <span className="font-medium">Dimensions:</span> {product.dimensions}
            </p>
          )}

          <div className="flex items-center gap-4 mt-8">
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100"
              >
                -
              </button>
              <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100"
              >
                +
              </button>
            </div>

            <button
              onClick={addToCart}
              disabled={addingToCart || product.stock_quantity === 0}
              className="flex-1 bg-amber-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              {addingToCart ? 'Adding...' : 'Add to Cart'}
            </button>

            <button
              onClick={toggleWishlist}
              className={`p-3 rounded-lg border transition-colors ${
                isInWishlist
                  ? 'bg-red-50 border-red-200 text-red-600'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Truck className="w-6 h-6 text-amber-600" />
              <div>
                <p className="font-medium text-sm">Shipping</p>
                <p className="text-xs text-gray-500">{product.shipping_time}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Shield className="w-6 h-6 text-amber-600" />
              <div>
                <p className="font-medium text-sm">Secure Purchase</p>
                <p className="text-xs text-gray-500">Buyer protection</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {reviews.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white p-6 rounded-xl border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                {review.title && <h4 className="font-semibold mt-2">{review.title}</h4>}
                <p className="text-gray-600 mt-2">{review.comment}</p>
                <p className="text-sm text-gray-500 mt-2">- {review.profiles?.full_name || 'Anonymous'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

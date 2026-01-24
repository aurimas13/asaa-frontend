import React, { useState, useRef, useEffect } from 'react'
import { X, Send, Sparkles, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

interface Message {
  role: 'user' | 'assistant'
  content: string
  products?: Product[]
}

interface Product {
  id: string
  title: string
  price: number
  images: string[]
}

const SUGGESTIONS = [
  'Gift for a wedding',
  'Traditional Lithuanian amber',
  'Handmade pottery',
  'Unique home decor',
  'Minimalist jewelry',
]

export const CraftConcierge: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your Craft Concierge. I can help you find the perfect handcrafted item. What are you looking for today?",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const getImageUrl = (images: string[] | string | null) => {
    if (!images) return 'https://images.pexels.com/photos/1070971/pexels-photo-1070971.jpeg?auto=compress&cs=tinysrgb&w=200'
    const parsed = typeof images === 'string' ? JSON.parse(images) : images
    return parsed[0] || 'https://images.pexels.com/photos/1070971/pexels-photo-1070971.jpeg?auto=compress&cs=tinysrgb&w=200'
  }

  const searchProducts = async (query: string): Promise<Product[]> => {
    const keywords = query.toLowerCase().split(' ').filter(w => w.length > 2)

    let searchQuery = supabase
      .from('products')
      .select('id, title, price, images')
      .eq('status', 'active')

    if (query.toLowerCase().includes('gift') || query.toLowerCase().includes('wedding')) {
      searchQuery = searchQuery.gte('price', 30)
    }

    if (query.toLowerCase().includes('amber')) {
      searchQuery = searchQuery.ilike('title', '%amber%')
    } else if (query.toLowerCase().includes('pottery') || query.toLowerCase().includes('ceramic')) {
      searchQuery = searchQuery.ilike('title', '%potter%')
    } else if (query.toLowerCase().includes('jewelry') || query.toLowerCase().includes('minimalist')) {
      searchQuery = searchQuery.ilike('title', '%jewelry%')
    } else if (query.toLowerCase().includes('wood')) {
      searchQuery = searchQuery.ilike('title', '%wood%')
    } else if (query.toLowerCase().includes('textile') || query.toLowerCase().includes('weav')) {
      searchQuery = searchQuery.ilike('title', '%weav%')
    } else {
      const orConditions = keywords.map(k => `title.ilike.%${k}%`).join(',')
      if (orConditions) {
        searchQuery = searchQuery.or(orConditions)
      }
    }

    const { data } = await searchQuery.limit(4)
    return (data || []) as Product[]
  }

  const generateResponse = async (userMessage: string): Promise<{ text: string; products: Product[] }> => {
    const products = await searchProducts(userMessage)

    let text = ''
    const lowerMsg = userMessage.toLowerCase()

    if (products.length === 0) {
      text = "I couldn't find exact matches, but I'd recommend browsing our categories. Our artisans create unique pieces across pottery, jewelry, woodwork, and textiles. Would you like me to help narrow down what you're looking for?"
    } else if (lowerMsg.includes('gift')) {
      text = `I found some wonderful gift options for you! These handcrafted pieces make meaningful presents. Each one is made by a verified Lithuanian artisan.`
    } else if (lowerMsg.includes('amber')) {
      text = `Lithuanian amber is truly special - it's called "Baltic gold"! Here are some authentic amber pieces from our artisans:`
    } else if (lowerMsg.includes('wedding')) {
      text = `Congratulations! For weddings, our artisans offer beautiful handcrafted items that make memorable gifts. Here are my recommendations:`
    } else if (lowerMsg.includes('minimalist')) {
      text = `I love minimalist style! Here are some elegant, understated pieces that would work perfectly:`
    } else {
      text = `Great choice! Here are some handcrafted items that match what you're looking for:`
    }

    return { text, products }
  }

  const handleSend = async (message?: string) => {
    const userMessage = message || input.trim()
    if (!userMessage || loading) return

    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const response = await generateResponse(userMessage)
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: response.text, products: response.products },
      ])
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: "I'm having trouble searching right now. Please try again or browse our products directly." },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion)
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-amber-600 text-white rounded-full shadow-lg hover:bg-amber-700 transition-all hover:scale-105 flex items-center justify-center z-50"
      >
        <Sparkles className="w-6 h-6" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Craft Concierge</h3>
            <p className="text-amber-100 text-xs">Find your perfect craft</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-2 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, idx) => (
          <div
            key={idx}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              {message.products && message.products.length > 0 && (
                <div className="mt-3 space-y-2">
                  {message.products.map((product) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 bg-white rounded-lg p-2 hover:shadow-md transition-shadow"
                    >
                      <img
                        src={getImageUrl(product.images)}
                        alt={product.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.title}
                        </p>
                        <p className="text-sm text-amber-600 font-semibold">
                          {product.price.toFixed(2)}
                        </p>
                      </div>
                    </Link>
                  ))}
                  <Link
                    to="/products"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 text-sm text-amber-600 hover:text-amber-700 pt-2"
                  >
                    <ShoppingBag className="w-4 h-4" /> Browse all products
                  </Link>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-gray-500 mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full hover:bg-amber-100 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 border-t border-gray-100">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What are you looking for?"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-10 h-10 bg-amber-600 text-white rounded-full flex items-center justify-center hover:bg-amber-700 transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  )
}

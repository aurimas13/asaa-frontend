import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Gift, Search, Heart, Sparkles, ArrowRight, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface Suggestion {
  id: string
  title: string
  description: string
  price: number
  images: string[] | string | null
  rating: number
  score: number
  reason: string
  categories: { name: string } | null
  makers: { name: string; location: string } | null
}

const RECIPIENTS = [
  { value: 'woman', label: 'Woman' },
  { value: 'man', label: 'Man' },
  { value: 'child', label: 'Child' },
  { value: 'teen', label: 'Teenager' },
  { value: 'couple', label: 'Couple' },
  { value: 'parent', label: 'Parent' },
  { value: 'friend', label: 'Friend' },
  { value: 'colleague', label: 'Colleague' },
]

const OCCASIONS = [
  { value: 'birthday', label: 'Birthday' },
  { value: 'christmas', label: 'Christmas' },
  { value: 'anniversary', label: 'Anniversary' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'housewarming', label: 'Housewarming' },
  { value: 'mothers day', label: "Mother's Day" },
  { value: 'fathers day', label: "Father's Day" },
  { value: 'graduation', label: 'Graduation' },
  { value: 'thank you', label: 'Thank You' },
  { value: 'just because', label: 'Just Because' },
]

const BUDGETS = [
  { value: { min: 5, max: 25 }, label: '€5 – €25' },
  { value: { min: 25, max: 50 }, label: '€25 – €50' },
  { value: { min: 50, max: 100 }, label: '€50 – €100' },
  { value: { min: 100, max: 250 }, label: '€100 – €250' },
  { value: { min: 250, max: 1000 }, label: '€250+' },
]

export const GiftFinder: React.FC = () => {
  const { t } = useTranslation()
  const [step, setStep] = useState(1)
  const [recipient, setRecipient] = useState('')
  const [occasion, setOccasion] = useState('')
  const [budget, setBudget] = useState<{ min: number; max: number } | null>(null)
  const [interests, setInterests] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const backendUrl = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:3001'

  const findGifts = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${backendUrl}/ai/gift-finder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient,
          occasion,
          budget: budget || { min: 10, max: 100 },
          interests,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setSuggestions(data.suggestions || [])
        setMessage(data.message || '')
        setStep(5)
      } else {
        setMessage('Could not find suggestions. Please try again.')
        setStep(5)
      }
    } catch {
      setMessage('Something went wrong. Please try again later.')
      setStep(5)
    }
    setLoading(false)
  }

  const getImageUrl = (images: string[] | string | null) => {
    if (!images) return 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=400&fit=crop&q=80'
    const parsed = typeof images === 'string' ? JSON.parse(images) : images
    return parsed[0] || 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=400&fit=crop&q=80'
  }

  const reset = () => {
    setStep(1)
    setRecipient('')
    setOccasion('')
    setBudget(null)
    setInterests('')
    setSuggestions([])
    setMessage('')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Gift className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          {t('giftFinder.title', 'AI Gift Finder')}
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          {t('giftFinder.subtitle', 'Tell us about the person and occasion, and we\'ll find the perfect handcrafted gift from our Lithuanian artisans.')}
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <React.Fragment key={s}>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                  step >= s
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {s}
              </div>
              {s < 4 && (
                <div className={`w-8 h-0.5 ${step > s ? 'bg-amber-600' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Who is this gift for?</h2>
          <p className="text-gray-500 mb-6">Select the recipient type</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {RECIPIENTS.map((r) => (
              <button
                key={r.value}
                onClick={() => { setRecipient(r.value); setStep(2) }}
                className={`p-4 rounded-xl border-2 text-center font-medium transition-all hover:border-amber-500 hover:bg-amber-50 ${
                  recipient === r.value
                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                    : 'border-gray-200 text-gray-700'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">What's the occasion?</h2>
          <p className="text-gray-500 mb-6">Choose the event or reason for the gift</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {OCCASIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => { setOccasion(o.value); setStep(3) }}
                className={`p-4 rounded-xl border-2 text-center font-medium transition-all hover:border-amber-500 hover:bg-amber-50 ${
                  occasion === o.value
                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                    : 'border-gray-200 text-gray-700'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
          <button onClick={() => setStep(1)} className="mt-4 text-sm text-gray-500 hover:text-amber-600">
            ← Back
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">What's your budget?</h2>
          <p className="text-gray-500 mb-6">Select a price range</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {BUDGETS.map((b) => (
              <button
                key={b.label}
                onClick={() => { setBudget(b.value); setStep(4) }}
                className={`p-4 rounded-xl border-2 text-center font-medium transition-all hover:border-amber-500 hover:bg-amber-50 ${
                  budget?.min === b.value.min
                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                    : 'border-gray-200 text-gray-700'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
          <button onClick={() => setStep(2)} className="mt-4 text-sm text-gray-500 hover:text-amber-600">
            ← Back
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Any specific interests?</h2>
          <p className="text-gray-500 mb-6">Optional: help us narrow down the perfect gift</p>
          <textarea
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="e.g., loves cooking, enjoys nature, into minimalist design, likes jewelry..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none mb-6"
          />

          <div className="bg-amber-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Your Gift Search
            </h3>
            <div className="text-sm text-amber-700 space-y-1">
              <p><strong>For:</strong> {RECIPIENTS.find(r => r.value === recipient)?.label}</p>
              <p><strong>Occasion:</strong> {OCCASIONS.find(o => o.value === occasion)?.label}</p>
              <p><strong>Budget:</strong> {BUDGETS.find(b => b.value.min === budget?.min)?.label}</p>
              {interests && <p><strong>Interests:</strong> {interests}</p>}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(3)} className="px-6 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50">
              ← Back
            </button>
            <button
              onClick={findGifts}
              disabled={loading}
              className="flex-1 bg-amber-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Finding gifts...</>
              ) : (
                <><Search className="w-5 h-5" /> Find Perfect Gifts</>
              )}
            </button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div>
          {message && (
            <div className="bg-amber-50 rounded-xl p-4 mb-8 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-amber-800">{message}</p>
            </div>
          )}

          {suggestions.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {suggestions.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={getImageUrl(product.images)}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=400&fit=crop&q=80'
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 group-hover:text-amber-600 transition-colors line-clamp-2">
                        {product.title}
                      </h3>
                      <span className="font-bold text-amber-600 whitespace-nowrap ml-2">
                        €{product.price.toFixed(2)}
                      </span>
                    </div>

                    {product.categories?.name && (
                      <span className="inline-block text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full mb-2">
                        {product.categories.name}
                      </span>
                    )}

                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.reason}</p>

                    <div className="flex items-center justify-between">
                      {product.rating > 0 && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Heart className="w-3.5 h-3.5 text-red-400 fill-current" />
                          {product.rating.toFixed(1)}
                        </div>
                      )}
                      <span className="text-sm text-amber-600 font-medium flex items-center gap-1">
                        View <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center mb-8">
              <Gift className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No exact matches found</h3>
              <p className="text-gray-500">Try adjusting your budget or interests for more results.</p>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={reset}
              className="bg-amber-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-amber-700 transition-colors"
            >
              Start New Search
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search as SearchIcon, Star, Filter, ChevronDown, X, TrendingUp, Clock, Grid, List } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'

interface Product {
  id: string
  title: string
  description: string
  price: number
  images: string[]
  rating: number
  view_count: number
  created_at: string
  category_id: string
  makers: { business_name: string }
  categories: { name: string; slug: string } | null
}

interface Category {
  id: string
  name: string
  slug: string
}

type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popular'

export const Search: React.FC = () => {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [recommendations, setRecommendations] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    rating: searchParams.get('rating') || '',
    sort: (searchParams.get('sort') as SortOption) || 'relevance',
  })

  useEffect(() => {
    loadCategories()
    loadRecentSearches()
    loadRecommendations()
  }, [])

  useEffect(() => {
    if (query) {
      saveRecentSearch(query)
      searchProducts()
    } else {
      setProducts([])
      setLoading(false)
    }
  }, [query, filters])

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('id, name, slug')
      .order('name')
    if (data) setCategories(data)
  }

  const loadRecentSearches = () => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved).slice(0, 5))
    }
  }

  const saveRecentSearch = (term: string) => {
    const saved = localStorage.getItem('recentSearches')
    let searches = saved ? JSON.parse(saved) : []
    searches = [term, ...searches.filter((s: string) => s !== term)].slice(0, 10)
    localStorage.setItem('recentSearches', JSON.stringify(searches))
    setRecentSearches(searches.slice(0, 5))
  }

  const loadRecommendations = async () => {
    const { data } = await supabase
      .from('products')
      .select('id, title, price, images, rating, makers(business_name)')
      .eq('status', 'active')
      .eq('featured', true)
      .limit(4)
    if (data) setRecommendations(data as unknown as Product[])
  }

  const searchProducts = async () => {
    setLoading(true)

    let queryBuilder = supabase
      .from('products')
      .select('id, title, description, price, images, rating, view_count, created_at, category_id, makers(business_name), categories(name, slug)')
      .eq('status', 'active')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)

    if (filters.category) {
      queryBuilder = queryBuilder.eq('category_id', filters.category)
    }

    if (filters.minPrice) {
      queryBuilder = queryBuilder.gte('price', parseFloat(filters.minPrice))
    }

    if (filters.maxPrice) {
      queryBuilder = queryBuilder.lte('price', parseFloat(filters.maxPrice))
    }

    if (filters.rating) {
      queryBuilder = queryBuilder.gte('rating', parseFloat(filters.rating))
    }

    switch (filters.sort) {
      case 'price_asc':
        queryBuilder = queryBuilder.order('price', { ascending: true })
        break
      case 'price_desc':
        queryBuilder = queryBuilder.order('price', { ascending: false })
        break
      case 'rating':
        queryBuilder = queryBuilder.order('rating', { ascending: false })
        break
      case 'newest':
        queryBuilder = queryBuilder.order('created_at', { ascending: false })
        break
      case 'popular':
        queryBuilder = queryBuilder.order('view_count', { ascending: false })
        break
      default:
        queryBuilder = queryBuilder.order('rating', { ascending: false })
    }

    const { data } = await queryBuilder.limit(48)
    if (data) setProducts(data as unknown as Product[])
    setLoading(false)
  }

  const updateFilter = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)

    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set(key, value)
    } else {
      newParams.delete(key)
    }
    setSearchParams(newParams)
  }

  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      rating: '',
      sort: 'relevance',
    })
    const newParams = new URLSearchParams()
    if (query) newParams.set('q', query)
    setSearchParams(newParams)
  }

  const getImageUrl = (images: string[] | string | null) => {
    if (!images) return 'https://images.pexels.com/photos/1070971/pexels-photo-1070971.jpeg?auto=compress&cs=tinysrgb&w=800'
    const parsed = typeof images === 'string' ? JSON.parse(images) : images
    return parsed[0] || 'https://images.pexels.com/photos/1070971/pexels-photo-1070971.jpeg?auto=compress&cs=tinysrgb&w=800'
  }

  const hasActiveFilters = filters.category || filters.minPrice || filters.maxPrice || filters.rating

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'relevance', label: t('search.relevance', 'Relevance') },
    { value: 'popular', label: t('search.popular', 'Most Popular') },
    { value: 'newest', label: t('search.newest', 'Newest') },
    { value: 'rating', label: t('search.topRated', 'Top Rated') },
    { value: 'price_asc', label: t('search.priceLow', 'Price: Low to High') },
    { value: 'price_desc', label: t('search.priceHigh', 'Price: High to Low') },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {query ? t('search.resultsFor', 'Search Results') : t('search.title', 'Search')}
        </h1>
        {query && (
          <p className="text-gray-600 mt-1">
            {t('search.showingResultsFor', 'Showing results for')} "<span className="font-semibold text-gray-900">{query}</span>"
          </p>
        )}
      </div>

      {!query && recentSearches.length > 0 && (
        <div className="mb-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-gray-400" />
            <h2 className="font-semibold text-gray-900">{t('search.recentSearches', 'Recent Searches')}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((term) => (
              <Link
                key={term}
                to={`/search?q=${encodeURIComponent(term)}`}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      )}

      {query && (
        <>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5" />
              {t('search.filters', 'Filters')}
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
              )}
            </button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{t('search.sortBy', 'Sort by')}:</span>
              <div className="relative">
                <select
                  value={filters.sort}
                  onChange={(e) => updateFilter('sort', e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-1 ml-auto">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-amber-100 text-amber-600' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-amber-100 text-amber-600' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{t('search.filterResults', 'Filter Results')}</h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    {t('search.clearAll', 'Clear all')}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('search.category', 'Category')}
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => updateFilter('category', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="">{t('search.allCategories', 'All Categories')}</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {t(`categories.${cat.slug}`, cat.name)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('search.minPrice', 'Min Price')} (EUR)
                  </label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => updateFilter('minPrice', e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('search.maxPrice', 'Max Price')} (EUR)
                  </label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => updateFilter('maxPrice', e.target.value)}
                    placeholder="1000"
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('search.minRating', 'Minimum Rating')}
                  </label>
                  <select
                    value={filters.rating}
                    onChange={(e) => updateFilter('rating', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="">{t('search.anyRating', 'Any Rating')}</option>
                    <option value="4">4+ {t('search.stars', 'Stars')}</option>
                    <option value="3">3+ {t('search.stars', 'Stars')}</option>
                    <option value="2">2+ {t('search.stars', 'Stars')}</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </>
      )}

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
          <h3 className="text-xl font-semibold text-gray-900">{t('search.enterTerm', 'Enter a search term')}</h3>
          <p className="text-gray-600 mt-2">{t('search.searchHint', 'Search for products, artisans, or categories')}</p>

          {recommendations.length > 0 && (
            <div className="mt-12 text-left">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-amber-600" />
                <h2 className="text-lg font-semibold text-gray-900">{t('search.recommended', 'Recommended for You')}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recommendations.map((product) => (
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
            </div>
          )}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900">{t('search.noResults', 'No results found')}</h3>
          <p className="text-gray-600 mt-2">{t('search.tryDifferent', 'Try different keywords or browse our categories')}</p>
          <Link
            to="/products"
            className="inline-block mt-6 bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
          >
            {t('search.browseAll', 'Browse All Products')}
          </Link>
        </div>
      ) : (
        <>
          <p className="text-gray-600 mb-6">{products.length} {t('search.productsFound', 'products found')}</p>

          {viewMode === 'grid' ? (
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
                      <p className="text-xs text-amber-600 font-medium mb-1">
                        {product.categories ? t(`categories.${product.categories.slug}`, product.categories.name) : ''}
                      </p>
                      <h3 className="font-semibold text-gray-900 group-hover:text-amber-600 transition-colors line-clamp-2">
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
                <Link key={product.id} to={`/product/${product.id}`} className="group">
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex">
                    <div className="w-48 h-48 flex-shrink-0 overflow-hidden">
                      <img
                        src={getImageUrl(product.images)}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 flex-1">
                      <p className="text-xs text-amber-600 font-medium mb-1">
                        {product.categories ? t(`categories.${product.categories.slug}`, product.categories.name) : ''}
                      </p>
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
        </>
      )}
    </div>
  )
}

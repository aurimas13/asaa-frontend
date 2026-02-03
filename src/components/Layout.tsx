import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, Heart, User, Search, Menu, X, Store, RotateCcw, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { LanguageSwitcher } from './LanguageSwitcher'
import { CraftConcierge } from './CraftConcierge'
import { supabase } from '../lib/supabase'

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [cartCount, setCartCount] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const accountMenuTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (user) {
      loadCartCount()
    }
  }, [user])

  const loadCartCount = async () => {
    if (!user) return
    const { count } = await supabase
      .from('carts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
    setCartCount(count || 0)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
    }
  }

  const isActive = (path: string) => location.pathname === path

  const handleAccountMenuEnter = () => {
    if (accountMenuTimeoutRef.current) {
      clearTimeout(accountMenuTimeoutRef.current)
      accountMenuTimeoutRef.current = null
    }
    setAccountMenuOpen(true)
  }

  const handleAccountMenuLeave = () => {
    accountMenuTimeoutRef.current = setTimeout(() => {
      setAccountMenuOpen(false)
    }, 150)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-600 text-white px-4 py-2 rounded-lg z-[60]">
        Skip to main content
      </a>

      <div className="bg-gradient-to-r from-secondary-600 via-secondary-500 to-primary-500 text-white text-center py-2 text-sm font-medium">
        <span className="hidden sm:inline">{t('announcement.kaziukoMuge')}</span>
        <span className="sm:hidden">{t('announcement.kaziukoMuge')}</span>
      </div>

      <header className={`bg-white sticky top-0 z-50 transition-shadow duration-300 ${scrolled ? 'shadow-md' : 'shadow-sm'}`} role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="relative">
                  <Store className="w-8 h-8 text-primary-500 group-hover:text-primary-600 transition-colors" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary-500 rounded-full"></div>
                </div>
                <span className="text-xl font-bold text-gray-900 hidden sm:block">Crafts And Hands</span>
              </Link>

              <nav className="hidden lg:flex items-center gap-1">
                <Link
                  to="/products"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive('/products') ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                  }`}
                >
                  {t('nav.products')}
                </Link>
                <Link
                  to="/makers"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive('/makers') ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                  }`}
                >
                  {t('nav.makers')}
                </Link>
                <Link
                  to="/categories"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive('/categories') ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                  }`}
                >
                  {t('nav.categories')}
                </Link>
                <Link
                  to="/events"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive('/events') ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                  }`}
                >
                  {t('nav.events')}
                </Link>
              </nav>
            </div>

            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('nav.search')}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-colors"
                />
              </div>
            </form>

            <div className="flex items-center gap-2">
              <LanguageSwitcher />

              <Link
                to="/returns"
                className="hidden sm:flex items-center gap-1 px-3 py-2 text-gray-600 hover:text-accent-600 transition-colors rounded-lg hover:bg-accent-50"
                aria-label="Returns"
              >
                <RotateCcw className="w-5 h-5" />
                <span className="text-sm font-medium hidden lg:inline">{t('nav.returns', 'Returns')}</span>
              </Link>

              {user ? (
                <>
                  <Link
                    to="/wishlist"
                    className="p-2 text-gray-600 hover:text-accent-600 transition-colors rounded-lg hover:bg-accent-50"
                    aria-label="View wishlist"
                  >
                    <Heart className="w-6 h-6" aria-hidden="true" />
                  </Link>
                  <Link
                    to="/cart"
                    className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors rounded-lg hover:bg-primary-50"
                    aria-label="View shopping cart"
                  >
                    <ShoppingCart className="w-6 h-6" aria-hidden="true" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-accent-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {cartCount > 10 ? '10+' : cartCount}
                      </span>
                    )}
                  </Link>
                  <div
                    className="relative"
                    onMouseEnter={handleAccountMenuEnter}
                    onMouseLeave={handleAccountMenuLeave}
                  >
                    <button
                      className="flex items-center gap-1 p-2 text-gray-600 hover:text-primary-600 transition-colors rounded-lg hover:bg-primary-50"
                      aria-label="User menu"
                      aria-haspopup="true"
                      aria-expanded={accountMenuOpen}
                      onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                    >
                      <User className="w-6 h-6" aria-hidden="true" />
                      <ChevronDown className="w-4 h-4 hidden sm:block" />
                    </button>
                    {accountMenuOpen && (
                      <div className="absolute right-0 pt-2 z-50">
                        <div className="w-56 bg-white rounded-xl shadow-lg py-2 border border-gray-100">
                          <div className="px-4 py-2 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900">{user.email}</p>
                          </div>
                          <Link
                            to="/profile"
                            className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-gray-50"
                            onClick={() => setAccountMenuOpen(false)}
                          >
                            {t('nav.profile')}
                          </Link>
                          <Link
                            to="/orders"
                            className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-gray-50"
                            onClick={() => setAccountMenuOpen(false)}
                          >
                            {t('nav.myOrders')}
                          </Link>
                          <Link
                            to="/wishlist"
                            className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-gray-50"
                            onClick={() => setAccountMenuOpen(false)}
                          >
                            {t('nav.wishlist')}
                          </Link>
                          <hr className="my-2" />
                          <Link
                            to="/become-maker"
                            className="flex items-center gap-2 px-4 py-2.5 text-secondary-600 hover:bg-secondary-50 font-medium"
                            onClick={() => setAccountMenuOpen(false)}
                          >
                            {t('nav.becomeMaker')}
                          </Link>
                          <hr className="my-2" />
                          <button
                            onClick={() => {
                              setAccountMenuOpen(false)
                              signOut()
                            }}
                            className="w-full text-left px-4 py-2.5 text-accent-600 hover:bg-accent-50"
                          >
                            {t('nav.signOut')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/cart"
                    className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors rounded-lg hover:bg-primary-50"
                    aria-label="View shopping cart"
                  >
                    <ShoppingCart className="w-6 h-6" aria-hidden="true" />
                  </Link>
                  <Link
                    to="/signin"
                    className="hidden sm:block text-gray-700 hover:text-primary-600 transition-colors font-medium px-3 py-2"
                  >
                    {t('nav.signIn')}
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:from-primary-600 hover:to-primary-700 transition-all shadow-sm hover:shadow"
                  >
                    {t('nav.signUp')}
                  </Link>
                </>
              )}

              <button
                className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white animate-fade-in">
            <nav className="px-4 py-4 space-y-1">
              <Link
                to="/products"
                className={`block py-3 px-4 rounded-lg font-medium ${isActive('/products') ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.products')}
              </Link>
              <Link
                to="/makers"
                className={`block py-3 px-4 rounded-lg font-medium ${isActive('/makers') ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.makers')}
              </Link>
              <Link
                to="/categories"
                className={`block py-3 px-4 rounded-lg font-medium ${isActive('/categories') ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.categories')}
              </Link>
              <Link
                to="/events"
                className={`block py-3 px-4 rounded-lg font-medium ${isActive('/events') ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.events')}
              </Link>
              <Link
                to="/cart"
                className={`block py-3 px-4 rounded-lg font-medium ${isActive('/cart') ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.cart')}
              </Link>
              <Link
                to="/returns"
                className={`block py-3 px-4 rounded-lg font-medium ${isActive('/returns') ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.returns', 'Returns')}
              </Link>
              <hr className="my-2" />
              <form onSubmit={handleSearch} className="pt-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('nav.search')}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg"
                />
              </form>
            </nav>
          </div>
        )}
      </header>

      <main className="min-h-[calc(100vh-4rem)]" id="main-content" role="main">{children}</main>

      <footer className="bg-gray-900 text-white mt-16" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Store className="w-6 h-6 text-primary-400" />
                <span className="text-lg font-bold">Crafts And Hands</span>
              </div>
              <p className="text-gray-400 text-sm">
                {t('footer.description')}
              </p>
              <div className="flex gap-2 mt-4">
                <div className="w-6 h-4 bg-lithuanian-yellow rounded-sm"></div>
                <div className="w-6 h-4 bg-lithuanian-green rounded-sm"></div>
                <div className="w-6 h-4 bg-lithuanian-red rounded-sm"></div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-primary-400">{t('footer.shop')}</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/products" className="hover:text-white transition-colors">{t('footer.allProducts')}</Link></li>
                <li><Link to="/categories" className="hover:text-white transition-colors">{t('nav.categories')}</Link></li>
                <li><Link to="/makers" className="hover:text-white transition-colors">{t('nav.makers')}</Link></li>
                <li><Link to="/events" className="hover:text-white transition-colors">{t('nav.events')}</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-secondary-400">{t('footer.support')}</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/help" className="hover:text-white transition-colors">{t('footer.helpCenter')}</Link></li>
                <li><Link to="/shipping" className="hover:text-white transition-colors">{t('footer.shipping')}</Link></li>
                <li><Link to="/returns" className="hover:text-white transition-colors">{t('footer.returns')}</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">{t('footer.contact')}</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-accent-400">{t('footer.sell')}</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/become-maker" className="hover:text-white transition-colors">{t('nav.becomeMaker')}</Link></li>
                <li><Link to="/maker-resources" className="hover:text-white transition-colors">{t('footer.makerResources')}</Link></li>
                <li><Link to="/maker-guidelines" className="hover:text-white transition-colors">{t('footer.makerGuidelines', 'Maker Guidelines')}</Link></li>
                <li><Link to="/success-stories" className="hover:text-white transition-colors">{t('footer.successStories')}</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <p>&copy; 2026 {t('footer.copyright')}</p>
            <div className="flex gap-6">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>

      <CraftConcierge />
    </div>
  )
}

import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Heart, User, Search, Menu, X, Store } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useTranslation } from 'react-i18next'

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2">
                <Store className="w-8 h-8 text-primary-600" />
                <span className="text-xl font-bold text-gray-900">Crafts And Hands</span>
              </Link>

              <nav className="hidden md:flex gap-6">
                <Link to="/products" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Products
                </Link>
                <Link to="/makers" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Makers
                </Link>
                <Link to="/events" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Events
                </Link>
                <Link to="/categories" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Categories
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
                  placeholder="Search handcrafted treasures..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </form>

            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              {user ? (
                <>
                  <Link to="/wishlist" className="p-2 text-gray-700 hover:text-primary-600 transition-colors">
                    <Heart className="w-6 h-6" />
                  </Link>
                  <Link to="/cart" className="p-2 text-gray-700 hover:text-primary-600 transition-colors">
                    <ShoppingCart className="w-6 h-6" />
                  </Link>
                  <div className="relative group">
                    <button className="p-2 text-gray-700 hover:text-primary-600 transition-colors">
                      <User className="w-6 h-6" />
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 hidden group-hover:block">
                      <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                        My Profile
                      </Link>
                      <Link to="/orders" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                        My Orders
                      </Link>
                      <Link to="/become-maker" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                        Become a Maker
                      </Link>
                      <button
                        onClick={() => signOut()}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/signin"
                    className="text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}

              <button
                className="md:hidden p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <nav className="px-4 py-4 space-y-2">
              <Link to="/products" className="block py-2 text-gray-700 hover:text-primary-600">
                Products
              </Link>
              <Link to="/makers" className="block py-2 text-gray-700 hover:text-primary-600">
                Makers
              </Link>
              <Link to="/events" className="block py-2 text-gray-700 hover:text-primary-600">
                Events
              </Link>
              <Link to="/categories" className="block py-2 text-gray-700 hover:text-primary-600">
                Categories
              </Link>
              <form onSubmit={handleSearch} className="pt-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </form>
            </nav>
          </div>
        )}
      </header>

      <main className="min-h-[calc(100vh-4rem)]">{children}</main>

      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Store className="w-6 h-6 text-primary-400" />
                <span className="text-lg font-bold">Artisan Baltic</span>
              </div>
              <p className="text-gray-400 text-sm">
                Discover unique handcrafted goods from talented artisans across the Baltic region and Europe.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Shop</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/products" className="hover:text-white">All Products</Link></li>
                <li><Link to="/categories" className="hover:text-white">Categories</Link></li>
                <li><Link to="/makers" className="hover:text-white">Artisans</Link></li>
                <li><Link to="/events" className="hover:text-white">Events</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link to="/shipping" className="hover:text-white">Shipping Info</Link></li>
                <li><Link to="/returns" className="hover:text-white">Returns</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Sell</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/become-maker" className="hover:text-white">Become a Maker</Link></li>
                <li><Link to="/maker-resources" className="hover:text-white">Resources</Link></li>
                <li><Link to="/success-stories" className="hover:text-white">Success Stories</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-gray-400 text-center">
            <p>&copy; 2026 Crafts And Hands. {t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Cookie, X, Settings } from 'lucide-react'

const COOKIE_CONSENT_KEY = 'cookie_consent'

interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
}

export const CookieConsent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) {
      const timer = setTimeout(() => setShowBanner(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAcceptAll = () => {
    const allConsent: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    }
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(allConsent))
    setShowBanner(false)
  }

  const handleAcceptNecessary = () => {
    const necessaryOnly: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    }
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(necessaryOnly))
    setShowBanner(false)
  }

  const handleSavePreferences = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(preferences))
    setShowBanner(false)
    setShowSettings(false)
  }

  if (!showBanner) return null

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          {!showSettings ? (
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Cookie className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg mb-2">
                    We value your privacy
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies. You can also customize your preferences.{' '}
                    <Link to="/privacy" className="text-amber-600 hover:underline">
                      Learn more
                    </Link>
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleAcceptAll}
                      className="bg-amber-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-amber-700 transition-colors"
                    >
                      Accept All
                    </button>
                    <button
                      onClick={handleAcceptNecessary}
                      className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      Necessary Only
                    </button>
                    <button
                      onClick={() => setShowSettings(true)}
                      className="flex items-center gap-2 text-gray-600 px-4 py-2 hover:text-amber-600 transition-colors"
                    >
                      <Settings className="w-4 h-4" /> Customize
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleAcceptNecessary}
                  className="text-gray-400 hover:text-gray-600 p-1"
                  aria-label="Close cookie banner"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900 text-lg">Cookie Preferences</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close settings"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Necessary Cookies</p>
                    <p className="text-sm text-gray-500">Required for the website to function. Cannot be disabled.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="w-5 h-5 text-amber-600 rounded"
                  />
                </div>

                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900">Analytics Cookies</p>
                    <p className="text-sm text-gray-500">Help us understand how visitors interact with our website.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                    className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900">Marketing Cookies</p>
                    <p className="text-sm text-gray-500">Used to deliver personalized advertisements.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                    className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
                  />
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSavePreferences}
                  className="flex-1 bg-amber-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-amber-700 transition-colors"
                >
                  Save Preferences
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="flex-1 border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Accept All
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={handleAcceptNecessary} />
    </>
  )
}

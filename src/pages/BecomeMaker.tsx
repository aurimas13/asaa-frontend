import React, { useState } from 'react'
import { CheckCircle, Users, Globe, TrendingUp, Shield, Send } from 'lucide-react'

export const BecomeMaker: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    businessName: '',
    craftType: '',
    experience: '',
    portfolio: '',
    motivation: ''
  })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')

    try {
      const response = await fetch('https://formspree.io/f/xrblgezj', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          type: 'maker_application'
        })
      })

      if (response.ok) {
        setStatus('success')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-green-50 rounded-2xl p-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your interest in joining Crafts And Hands. Our team will review your application and contact you within 5-7 business days.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Become a Maker</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Join our community of talented Lithuanian artisans and share your craft with customers across Europe.
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-16">
        <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
          <Users className="w-10 h-10 text-amber-600 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">Growing Community</h3>
          <p className="text-sm text-gray-600">Join 150+ verified Lithuanian artisans</p>
        </div>
        <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
          <Globe className="w-10 h-10 text-amber-600 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">Global Reach</h3>
          <p className="text-sm text-gray-600">Sell to customers across Europe</p>
        </div>
        <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
          <TrendingUp className="w-10 h-10 text-amber-600 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">Low Fees</h3>
          <p className="text-sm text-gray-600">Only 10% commission on sales</p>
        </div>
        <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
          <Shield className="w-10 h-10 text-amber-600 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">Verified Badge</h3>
          <p className="text-sm text-gray-600">Build trust with verification</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Sell With Us?</h2>
          <div className="space-y-4">
            {[
              'Free shop setup and product listings',
              'Professional photography tips and resources',
              'Marketing and promotion support',
              'Secure payment processing',
              'Shipping label generation',
              'Customer service support',
              'Analytics and sales insights',
              'Community events and networking'
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-amber-50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Eligible Crafts</h3>
            <div className="flex flex-wrap gap-2">
              {['Pottery', 'Weaving', 'Basketry', 'Woodwork', 'Blacksmithing', 'Jewelry', 'Felting', 'Leather', 'Paper Art', 'Textiles'].map((craft) => (
                <span key={craft} className="bg-white px-3 py-1 rounded-full text-sm text-gray-700 border border-amber-200">
                  {craft}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Apply to Become a Maker</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business/Studio Name</label>
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Craft Type</label>
              <select
                required
                value={formData.craftType}
                onChange={(e) => setFormData({ ...formData, craftType: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">Select your craft...</option>
                <option value="pottery">Pottery / Ceramics</option>
                <option value="weaving">Weaving / Textiles</option>
                <option value="basketry">Basketry</option>
                <option value="woodwork">Woodwork</option>
                <option value="blacksmithing">Blacksmithing</option>
                <option value="jewelry">Jewelry</option>
                <option value="felting">Wool Felting</option>
                <option value="leather">Leather Goods</option>
                <option value="paper">Paper Art / Karpiniai</option>
                <option value="other">Other Traditional Craft</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
              <select
                required
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">Select...</option>
                <option value="1-2">1-2 years</option>
                <option value="3-5">3-5 years</option>
                <option value="5-10">5-10 years</option>
                <option value="10+">10+ years</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio Link (optional)</label>
              <input
                type="url"
                value={formData.portfolio}
                onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                placeholder="https://instagram.com/your-profile"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Why do you want to join?</label>
              <textarea
                required
                rows={4}
                value={formData.motivation}
                onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                placeholder="Tell us about your craft and what makes it special..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {status === 'submitting' ? 'Submitting...' : <><Send className="w-5 h-5" /> Submit Application</>}
            </button>
            {status === 'error' && (
              <p className="text-red-600 text-center">Something went wrong. Please try again.</p>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import { CheckCircle, Users, Globe, TrendingUp, Shield, Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'

export const BecomeMaker: React.FC = () => {
  const { t } = useTranslation()
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
      const { error } = await supabase.from('maker_applications').insert({
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone || null,
        business_name: formData.businessName,
        craft_type: formData.craftType,
        experience_years: formData.experience,
        portfolio_url: formData.portfolio || null,
        motivation: formData.motivation,
        status: 'pending'
      })

      if (error) throw error
      setStatus('success')
    } catch (err) {
      console.error('Application error:', err)
      setStatus('error')
    }
  }

  const craftKeys = ['pottery', 'weaving', 'basketry', 'woodwork', 'blacksmithing', 'jewelry', 'felting', 'leather', 'paperArt', 'textiles']
  const benefitKeys = ['freeSetup', 'photoTips', 'marketing', 'securePayment', 'shippingLabels', 'customerService', 'analytics', 'communityEvents']

  if (status === 'success') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-green-50 rounded-2xl p-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('becomeMaker.success.title')}</h2>
          <p className="text-gray-600 mb-6">
            {t('becomeMaker.success.message')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('becomeMaker.title')}</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {t('becomeMaker.subtitle')}
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-16">
        <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
          <Users className="w-10 h-10 text-amber-600 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">{t('becomeMaker.growingCommunity')}</h3>
          <p className="text-sm text-gray-600">{t('becomeMaker.growingCommunityDesc')}</p>
        </div>
        <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
          <Globe className="w-10 h-10 text-amber-600 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">{t('becomeMaker.globalReach')}</h3>
          <p className="text-sm text-gray-600">{t('becomeMaker.globalReachDesc')}</p>
        </div>
        <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
          <TrendingUp className="w-10 h-10 text-amber-600 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">{t('becomeMaker.lowFees')}</h3>
          <p className="text-sm text-gray-600">{t('becomeMaker.lowFeesDesc')}</p>
        </div>
        <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
          <Shield className="w-10 h-10 text-amber-600 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">{t('becomeMaker.verifiedBadge')}</h3>
          <p className="text-sm text-gray-600">{t('becomeMaker.verifiedBadgeDesc')}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('becomeMaker.whySell')}</h2>
          <div className="space-y-4">
            {benefitKeys.map((key) => (
              <div key={key} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">{t(`becomeMaker.benefits.${key}`)}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-amber-50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-3">{t('becomeMaker.eligibleCrafts')}</h3>
            <div className="flex flex-wrap gap-2">
              {craftKeys.map((key) => (
                <span key={key} className="bg-white px-3 py-1 rounded-full text-sm text-gray-700 border border-amber-200">
                  {t(`becomeMaker.crafts.${key}`)}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('becomeMaker.applyTitle')}</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('becomeMaker.form.fullName')}</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('becomeMaker.form.email')}</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('becomeMaker.form.phone')}</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('becomeMaker.form.businessName')}</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('becomeMaker.form.craftType')}</label>
              <select
                required
                value={formData.craftType}
                onChange={(e) => setFormData({ ...formData, craftType: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">{t('becomeMaker.form.selectCraft')}</option>
                <option value="pottery">{t('becomeMaker.form.craftOptions.pottery')}</option>
                <option value="weaving">{t('becomeMaker.form.craftOptions.weaving')}</option>
                <option value="basketry">{t('becomeMaker.form.craftOptions.basketry')}</option>
                <option value="woodwork">{t('becomeMaker.form.craftOptions.woodwork')}</option>
                <option value="blacksmithing">{t('becomeMaker.form.craftOptions.blacksmithing')}</option>
                <option value="jewelry">{t('becomeMaker.form.craftOptions.jewelry')}</option>
                <option value="felting">{t('becomeMaker.form.craftOptions.felting')}</option>
                <option value="leather">{t('becomeMaker.form.craftOptions.leather')}</option>
                <option value="paper">{t('becomeMaker.form.craftOptions.paper')}</option>
                <option value="other">{t('becomeMaker.form.craftOptions.other')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('becomeMaker.form.experience')}</label>
              <select
                required
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">{t('becomeMaker.form.selectExperience')}</option>
                <option value="1-2">1-2</option>
                <option value="3-5">3-5</option>
                <option value="5-10">5-10</option>
                <option value="10+">10+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('becomeMaker.form.portfolio')}</label>
              <input
                type="url"
                value={formData.portfolio}
                onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                placeholder={t('becomeMaker.form.portfolioPlaceholder')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('becomeMaker.form.motivation')}</label>
              <textarea
                required
                rows={4}
                value={formData.motivation}
                onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                placeholder={t('becomeMaker.form.motivationPlaceholder')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {status === 'submitting' ? t('becomeMaker.form.submitting') : <><Send className="w-5 h-5" /> {t('becomeMaker.form.submit')}</>}
            </button>
            {status === 'error' && (
              <p className="text-red-600 text-center">{t('becomeMaker.error')}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

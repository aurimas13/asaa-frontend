import React, { useState } from 'react'
import { CheckCircle, Users, Globe, TrendingUp, Shield, Send, AlertCircle, FileText, Camera, Package, MessageSquare } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xyzgkpvn'

export const BecomeMaker: React.FC = () => {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    businessName: '',
    craftType: '',
    craftDescription: '',
    experience: '',
    portfolio: '',
    socialMedia: '',
    motivation: '',
    priceRange: '',
    agreeTerms: false
  })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')

    try {
      const formspreeResponse = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          businessName: formData.businessName,
          craftType: formData.craftType,
          craftDescription: formData.craftDescription,
          experience: formData.experience,
          portfolio: formData.portfolio,
          socialMedia: formData.socialMedia,
          motivation: formData.motivation,
          priceRange: formData.priceRange,
          _subject: `New Maker Application: ${formData.businessName}`,
        }),
      })

      if (!formspreeResponse.ok) {
        throw new Error('Formspree submission failed')
      }

      await supabase.from('maker_applications').insert({
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

      setStatus('success')
    } catch (err) {
      console.error('Application error:', err)
      setStatus('error')
    }
  }

  const craftOptions = [
    { value: 'ceramics', label: t('becomeMaker.form.craftOptions.pottery') },
    { value: 'amber', label: 'Amber / Gintaras' },
    { value: 'straw-art', label: 'Straw Art / Siaudiniai sodai' },
    { value: 'weaving', label: t('becomeMaker.form.craftOptions.weaving') },
    { value: 'basketry', label: t('becomeMaker.form.craftOptions.basketry') },
    { value: 'woodwork', label: t('becomeMaker.form.craftOptions.woodwork') },
    { value: 'blacksmithing', label: t('becomeMaker.form.craftOptions.blacksmithing') },
    { value: 'jewelry', label: t('becomeMaker.form.craftOptions.jewelry') },
    { value: 'felting', label: t('becomeMaker.form.craftOptions.felting') },
    { value: 'leather', label: t('becomeMaker.form.craftOptions.leather') },
    { value: 'paper', label: t('becomeMaker.form.craftOptions.paper') },
    { value: 'multi-craft', label: 'Multi-craft / Various' },
    { value: 'other', label: t('becomeMaker.form.craftOptions.other') },
  ]

  const benefitKeys = ['freeSetup', 'photoTips', 'marketing', 'securePayment', 'shippingLabels', 'customerService', 'analytics', 'communityEvents']

  if (status === 'success') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="bg-secondary-50 rounded-3xl p-8 border border-secondary-200">
          <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-secondary-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('becomeMaker.success.title')}</h2>
          <p className="text-gray-600 mb-6">
            {t('becomeMaker.success.message')}
          </p>
          <div className="bg-white rounded-xl p-4 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">{t('becomeMaker.success.nextSteps', 'What happens next?')}</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                {t('becomeMaker.success.step1', 'Our team will review your application within 5-7 business days')}
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                {t('becomeMaker.success.step2', 'We may contact you for additional information or photos')}
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                {t('becomeMaker.success.step3', 'Once approved, you will receive setup instructions')}
              </li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-secondary-100 text-secondary-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Users className="w-4 h-4" />
          {t('becomeMaker.badge', 'Join 14+ Lithuanian artisans')}
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('becomeMaker.title')}</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {t('becomeMaker.subtitle')}
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-16">
        <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all group">
          <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-200 transition-colors">
            <Users className="w-7 h-7 text-primary-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">{t('becomeMaker.growingCommunity')}</h3>
          <p className="text-sm text-gray-600">{t('becomeMaker.growingCommunityDesc')}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-md hover:border-secondary-200 transition-all group">
          <div className="w-14 h-14 bg-secondary-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary-200 transition-colors">
            <Globe className="w-7 h-7 text-secondary-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">{t('becomeMaker.globalReach')}</h3>
          <p className="text-sm text-gray-600">{t('becomeMaker.globalReachDesc')}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-md hover:border-accent-200 transition-all group">
          <div className="w-14 h-14 bg-accent-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-accent-200 transition-colors">
            <TrendingUp className="w-7 h-7 text-accent-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">{t('becomeMaker.lowFees')}</h3>
          <p className="text-sm text-gray-600">{t('becomeMaker.lowFeesDesc')}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all group">
          <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-200 transition-colors">
            <Shield className="w-7 h-7 text-primary-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">{t('becomeMaker.verifiedBadge')}</h3>
          <p className="text-sm text-gray-600">{t('becomeMaker.verifiedBadgeDesc')}</p>
        </div>
      </div>

      <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-12 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-primary-800 font-medium">{t('becomeMaker.kaziukoNotice.title', 'Kaziuko Muge 2026 Applications Open')}</p>
          <p className="text-primary-700 text-sm mt-1">
            {t('becomeMaker.kaziukoNotice.desc', 'We are actively recruiting artisans for Kaziuko Muge 2026 (March 6-8, Vilnius). Apply now to be featured in our marketplace!')}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('becomeMaker.whySell')}</h2>
          <div className="space-y-4">
            {benefitKeys.map((key) => (
              <div key={key} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-secondary-200 transition-colors">
                <CheckCircle className="w-5 h-5 text-secondary-500 flex-shrink-0" />
                <span className="text-gray-700">{t(`becomeMaker.benefits.${key}`)}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-gradient-to-br from-secondary-50 to-primary-50 rounded-2xl p-6 border border-secondary-100">
            <h3 className="font-semibold text-gray-900 mb-4">{t('becomeMaker.eligibleCrafts')}</h3>
            <div className="flex flex-wrap gap-2">
              {craftOptions.slice(0, -1).map((craft) => (
                <span key={craft.value} className="bg-white px-3 py-1.5 rounded-full text-sm text-gray-700 border border-gray-200">
                  {craft.label}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8 bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">{t('becomeMaker.requirements.title', 'Requirements')}</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                {t('becomeMaker.requirements.1', 'Valid business registration or artisan certification')}
              </li>
              <li className="flex items-start gap-2">
                <Camera className="w-4 h-4 text-gray-400 mt-0.5" />
                {t('becomeMaker.requirements.2', 'High-quality photos of your work')}
              </li>
              <li className="flex items-start gap-2">
                <Package className="w-4 h-4 text-gray-400 mt-0.5" />
                {t('becomeMaker.requirements.3', 'Ability to ship within Lithuania and EU')}
              </li>
              <li className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                {t('becomeMaker.requirements.4', 'Responsive communication (within 48 hours)')}
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('becomeMaker.applyTitle')}</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('becomeMaker.form.fullName')} *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('becomeMaker.form.email')} *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
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
                  placeholder="+370..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('becomeMaker.form.businessName')} *</label>
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('becomeMaker.form.craftType')} *</label>
              <select
                required
                value={formData.craftType}
                onChange={(e) => setFormData({ ...formData, craftType: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              >
                <option value="">{t('becomeMaker.form.selectCraft')}</option>
                {craftOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('becomeMaker.form.craftDescription', 'Describe your craft')} *</label>
              <textarea
                required
                rows={3}
                value={formData.craftDescription}
                onChange={(e) => setFormData({ ...formData, craftDescription: e.target.value })}
                placeholder={t('becomeMaker.form.craftDescriptionPlaceholder', 'Tell us about your craft, techniques, and what makes your work unique...')}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('becomeMaker.form.experience')} *</label>
                <select
                  required
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                >
                  <option value="">{t('becomeMaker.form.selectExperience')}</option>
                  <option value="0-1">0-1 {t('becomeMaker.form.years', 'years')}</option>
                  <option value="1-3">1-3 {t('becomeMaker.form.years', 'years')}</option>
                  <option value="3-5">3-5 {t('becomeMaker.form.years', 'years')}</option>
                  <option value="5-10">5-10 {t('becomeMaker.form.years', 'years')}</option>
                  <option value="10+">10+ {t('becomeMaker.form.years', 'years')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('becomeMaker.form.priceRange', 'Typical price range')} *</label>
                <select
                  required
                  value={formData.priceRange}
                  onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                >
                  <option value="">{t('becomeMaker.form.selectPriceRange', 'Select...')}</option>
                  <option value="under-50">Under 50</option>
                  <option value="50-100">50 - 100</option>
                  <option value="100-250">100 - 250</option>
                  <option value="250-500">250 - 500</option>
                  <option value="500+">500+</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('becomeMaker.form.portfolio')}</label>
              <input
                type="url"
                value={formData.portfolio}
                onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                placeholder={t('becomeMaker.form.portfolioPlaceholder')}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('becomeMaker.form.socialMedia', 'Social media (Facebook, Instagram)')}</label>
              <input
                type="text"
                value={formData.socialMedia}
                onChange={(e) => setFormData({ ...formData, socialMedia: e.target.value })}
                placeholder="@yourusername or full URL"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('becomeMaker.form.motivation')} *</label>
              <textarea
                required
                rows={4}
                value={formData.motivation}
                onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                placeholder={t('becomeMaker.form.motivationPlaceholder')}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
              />
            </div>
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="agreeTerms"
                required
                checked={formData.agreeTerms}
                onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="agreeTerms" className="text-sm text-gray-600">
                {t('becomeMaker.form.agreeTerms', 'I agree to the Terms of Service and Privacy Policy, and consent to being contacted about my application.')}
              </label>
            </div>
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full bg-gradient-to-r from-secondary-500 to-secondary-600 text-white py-4 rounded-xl font-semibold hover:from-secondary-600 hover:to-secondary-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg hover:shadow-xl"
            >
              {status === 'submitting' ? t('becomeMaker.form.submitting') : <><Send className="w-5 h-5" /> {t('becomeMaker.form.submit')}</>}
            </button>
            {status === 'error' && (
              <p className="text-accent-600 text-center">{t('becomeMaker.error')}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

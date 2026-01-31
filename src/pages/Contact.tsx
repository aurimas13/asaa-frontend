import React, { useState } from 'react'
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const Contact: React.FC = () => {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
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
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setStatus('success')
        setFormData({ name: '', email: '', subject: '', message: '' })
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('contact.success.title', 'Message Sent!')}</h2>
          <p className="text-gray-600 mb-6">
            {t('contact.success.message', "Thank you for reaching out. We'll get back to you within 24-48 hours.")}
          </p>
          <button
            onClick={() => setStatus('idle')}
            className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors"
          >
            {t('contact.success.sendAnother', 'Send Another Message')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('contact.title', 'Contact Us')}</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {t('contact.subtitle', "Have questions about our products, makers, or platform? We're here to help.")}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
          <Mail className="w-10 h-10 text-amber-600 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">{t('contact.email', 'Email')}</h3>
          <a href="mailto:craftsandhands@pm.me" className="text-amber-600 hover:text-amber-700">craftsandhands@pm.me</a>
        </div>
        <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
          <Phone className="w-10 h-10 text-amber-600 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">{t('contact.phone', 'Phone')}</h3>
          <a href="tel:+447355549475" className="text-gray-600 hover:text-amber-600">+44 7355 549475</a>
        </div>
        <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
          <MapPin className="w-10 h-10 text-amber-600 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">{t('contact.location', 'Location')}</h3>
          <p className="text-gray-600">{t('contact.address', 'Lithuania')}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('contact.form.title', 'Send us a message')}</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('contact.form.name', 'Name')}</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder={t('contact.form.namePlaceholder', 'Your name')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('contact.form.email', 'Email')}</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder={t('contact.form.emailPlaceholder', 'your@email.com')}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('contact.form.subject', 'Subject')}</label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder={t('contact.form.subjectPlaceholder', 'How can we help?')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('contact.form.message', 'Message')}</label>
              <textarea
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                placeholder={t('contact.form.messagePlaceholder', 'Tell us more...')}
              />
            </div>
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {status === 'submitting' ? (
                t('contact.form.sending', 'Sending...')
              ) : (
                <>
                  <Send className="w-5 h-5" /> {t('contact.form.send', 'Send Message')}
                </>
              )}
            </button>
            {status === 'error' && (
              <p className="text-red-600 text-center">{t('contact.error', 'Something went wrong. Please try again.')}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

import React from 'react'
import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation()

  const languages = [
    { code: 'lt', name: 'Lietuvių', flag: '🇱🇹' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ]

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
        <Globe className="w-5 h-5" />
        <span className="hidden md:inline text-sm font-medium">
          {languages.find(l => l.code === i18n.language)?.flag || '🌐'}
        </span>
      </button>
      <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg py-2 hidden group-hover:block z-50">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`block w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors ${
              i18n.language === lang.code ? 'bg-primary-50 font-semibold' : ''
            }`}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.name}
          </button>
        ))}
      </div>
    </div>
  )
}

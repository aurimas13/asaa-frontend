import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ShoppingBag, Truck, RefreshCw, CreditCard, User, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react'

const faqs = [
  {
    category: 'Shopping',
    icon: ShoppingBag,
    questions: [
      {
        q: 'How do I place an order?',
        a: 'Browse our products, add items to your cart, and proceed to checkout. You can pay securely with credit card or other supported payment methods.'
      },
      {
        q: 'Can I customize products?',
        a: 'Many of our artisans offer customization options. Look for the "Customizable" badge on product pages, or contact the maker directly through their profile.'
      },
      {
        q: 'How long does shipping take?',
        a: 'Shipping times vary by product and maker location. Most orders within Lithuania arrive in 2-5 business days. International shipping typically takes 7-14 business days.'
      }
    ]
  },
  {
    category: 'Shipping',
    icon: Truck,
    questions: [
      {
        q: 'Do you ship internationally?',
        a: 'Yes! We ship to most European countries. Shipping costs and times vary by destination. You can see exact costs at checkout.'
      },
      {
        q: 'How can I track my order?',
        a: 'Once your order ships, you will receive a tracking number via email. You can also view tracking information in your order history.'
      },
      {
        q: 'What if my package is delayed?',
        a: 'Contact us if your package has not arrived within the estimated delivery window. We will work with the carrier and maker to resolve the issue.'
      }
    ]
  },
  {
    category: 'Returns',
    icon: RefreshCw,
    questions: [
      {
        q: 'What is your return policy?',
        a: 'We accept returns within 14 days of delivery for non-customized items in original condition. Custom orders are generally non-refundable.'
      },
      {
        q: 'How do I initiate a return?',
        a: 'Go to your order history, select the item you wish to return, and follow the return request process. The maker will provide return instructions.'
      },
      {
        q: 'When will I receive my refund?',
        a: 'Refunds are processed within 5-7 business days after we receive the returned item. It may take additional time to appear on your statement.'
      }
    ]
  },
  {
    category: 'Payments',
    icon: CreditCard,
    questions: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit cards (Visa, Mastercard, American Express), as well as PayPal and bank transfers for larger orders.'
      },
      {
        q: 'Is my payment information secure?',
        a: 'Yes, all payments are processed through secure, PCI-compliant payment processors. We never store your full card details.'
      },
      {
        q: 'Can I pay in my local currency?',
        a: 'All prices are displayed in EUR. Your bank will handle currency conversion if needed.'
      }
    ]
  },
  {
    category: 'Account',
    icon: User,
    questions: [
      {
        q: 'How do I create an account?',
        a: 'Click "Sign Up" in the top navigation, enter your email and create a password. You can also sign up during checkout.'
      },
      {
        q: 'How do I reset my password?',
        a: 'Click "Sign In" then "Forgot Password". Enter your email and we will send you a password reset link.'
      },
      {
        q: 'Can I save items for later?',
        a: 'Yes! Use the heart icon to add items to your wishlist. You can view your wishlist anytime from your account.'
      }
    ]
  }
]

export const Help: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [openQuestion, setOpenQuestion] = useState<string | null>(null)

  const toggleQuestion = (id: string) => {
    setOpenQuestion(openQuestion === id ? null : id)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Help Center</h1>
        <p className="text-gray-600 max-w-2xl mx-auto mb-8">
          Find answers to common questions or get in touch with our support team.
        </p>
        <div className="max-w-xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for answers..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-4 mb-12">
        {faqs.map((section) => (
          <a
            key={section.category}
            href={`#${section.category.toLowerCase()}`}
            className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <section.icon className="w-8 h-8 text-amber-600 mx-auto mb-2" />
            <span className="font-medium text-gray-900">{section.category}</span>
          </a>
        ))}
      </div>

      <div className="space-y-12">
        {faqs.map((section) => (
          <div key={section.category} id={section.category.toLowerCase()}>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <section.icon className="w-6 h-6 text-amber-600" />
              {section.category}
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
              {section.questions.map((item, index) => {
                const id = `${section.category}-${index}`
                const isOpen = openQuestion === id
                return (
                  <div key={index}>
                    <button
                      onClick={() => toggleQuestion(id)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-gray-900">{item.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-4 text-gray-600">
                        {item.a}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 bg-amber-50 rounded-2xl p-8 text-center">
        <MessageCircle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Still need help?</h2>
        <p className="text-gray-600 mb-6">
          Our support team is here to assist you with any questions.
        </p>
        <Link
          to="/contact"
          className="inline-block bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
        >
          Contact Support
        </Link>
      </div>
    </div>
  )
}

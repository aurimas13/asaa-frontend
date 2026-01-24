import React from 'react'
import { Link } from 'react-router-dom'
import { RefreshCw, Clock, CheckCircle, XCircle, AlertCircle, Package } from 'lucide-react'

export const Returns: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Returns & Refunds</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          We want you to love your handcrafted purchase. If something is not right, we're here to help.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
          <Clock className="w-10 h-10 text-amber-600 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">14-Day Returns</h3>
          <p className="text-sm text-gray-600">Return eligible items within 14 days of delivery</p>
        </div>
        <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
          <RefreshCw className="w-10 h-10 text-amber-600 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">Easy Process</h3>
          <p className="text-sm text-gray-600">Start a return from your order history</p>
        </div>
        <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
          <Package className="w-10 h-10 text-amber-600 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">Original Condition</h3>
          <p className="text-sm text-gray-600">Items must be unused and in original packaging</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-green-50 rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            Eligible for Return
          </h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
              <span>Standard (non-customized) items in original condition</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
              <span>Items with manufacturing defects or damage during shipping</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
              <span>Items that significantly differ from the product description</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
              <span>Wrong item received</span>
            </li>
          </ul>
        </div>

        <div className="bg-red-50 rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <XCircle className="w-6 h-6 text-red-500" />
            Not Eligible for Return
          </h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
              <span>Custom or personalized items made to your specifications</span>
            </li>
            <li className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
              <span>Items that have been used, worn, or altered</span>
            </li>
            <li className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
              <span>Items returned after 14 days</span>
            </li>
            <li className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
              <span>Food items or consumables</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">How to Return an Item</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { step: 1, title: 'Request Return', desc: 'Go to Orders in your account and select the item to return' },
            { step: 2, title: 'Get Approval', desc: 'Wait for return approval from the maker (usually 1-2 days)' },
            { step: 3, title: 'Ship Item', desc: 'Pack the item safely and ship to the provided address' },
            { step: 4, title: 'Receive Refund', desc: 'Refund processed within 5-7 days of receiving the item' },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-10 h-10 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-3">
                {item.step}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 rounded-2xl p-8 mb-12">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Important: Handmade Variations</h3>
            <p className="text-gray-600">
              Each item is handcrafted by skilled artisans, which means slight variations in color, size, or pattern are normal and part of what makes each piece unique. These natural variations are not considered defects and are not eligible for return. If you have specific requirements, please contact the maker before ordering.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-gray-600 mb-4">Need help with a return?</p>
        <div className="flex justify-center gap-4">
          <Link
            to="/orders"
            className="bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
          >
            View My Orders
          </Link>
          <Link
            to="/contact"
            className="bg-white text-amber-600 border-2 border-amber-600 px-6 py-3 rounded-lg font-semibold hover:bg-amber-50 transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  )
}

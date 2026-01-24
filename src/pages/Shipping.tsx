import React from 'react'
import { Link } from 'react-router-dom'
import { Truck, Clock, Globe, Package, MapPin, CheckCircle } from 'lucide-react'

export const Shipping: React.FC = () => {
  const shippingZones = [
    { zone: 'Lithuania', time: '2-4 business days', cost: 'Free over 50 EUR' },
    { zone: 'Baltic States (Latvia, Estonia)', time: '3-5 business days', cost: 'From 5 EUR' },
    { zone: 'EU Countries', time: '5-10 business days', cost: 'From 10 EUR' },
    { zone: 'UK & Switzerland', time: '7-14 business days', cost: 'From 15 EUR' },
    { zone: 'Rest of Europe', time: '10-14 business days', cost: 'From 15 EUR' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Shipping Information</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          We deliver handcrafted treasures from Lithuanian artisans to customers across Europe.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
          <Truck className="w-10 h-10 text-amber-600 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">Careful Packaging</h3>
          <p className="text-sm text-gray-600">Each item is carefully packaged by the artisan to ensure safe delivery.</p>
        </div>
        <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
          <Clock className="w-10 h-10 text-amber-600 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">Processing Time</h3>
          <p className="text-sm text-gray-600">Most orders ship within 1-3 business days. Custom items may take longer.</p>
        </div>
        <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
          <Globe className="w-10 h-10 text-amber-600 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">Track Your Order</h3>
          <p className="text-sm text-gray-600">Receive tracking information via email once your order ships.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-12">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-600" />
            Shipping Zones & Rates
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {shippingZones.map((zone) => (
            <div key={zone.zone} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-medium text-gray-900">{zone.zone}</h3>
                <p className="text-sm text-gray-500">{zone.time}</p>
              </div>
              <span className="text-amber-600 font-semibold">{zone.cost}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-amber-50 rounded-2xl p-8">
          <Package className="w-10 h-10 text-amber-600 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Free Shipping</h2>
          <p className="text-gray-600 mb-4">
            Enjoy free shipping on orders over 50 EUR within Lithuania. For international orders over 100 EUR, shipping is discounted.
          </p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-gray-700">
              <CheckCircle className="w-4 h-4 text-green-500" /> Free shipping in Lithuania (50 EUR+)
            </li>
            <li className="flex items-center gap-2 text-gray-700">
              <CheckCircle className="w-4 h-4 text-green-500" /> 50% off EU shipping (100 EUR+)
            </li>
            <li className="flex items-center gap-2 text-gray-700">
              <CheckCircle className="w-4 h-4 text-green-500" /> Combined shipping for multi-item orders
            </li>
          </ul>
        </div>

        <div className="bg-gray-50 rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Important Notes</h2>
          <ul className="space-y-3 text-gray-600">
            <li>
              <strong className="text-gray-900">Handmade Items:</strong> Each product is crafted by hand, so slight variations are normal and add to the uniqueness.
            </li>
            <li>
              <strong className="text-gray-900">Custom Orders:</strong> Customized items may have longer processing times. Check the product page for details.
            </li>
            <li>
              <strong className="text-gray-900">Fragile Items:</strong> Pottery and glass items are double-packaged for extra protection.
            </li>
            <li>
              <strong className="text-gray-900">Customs & Duties:</strong> Orders outside the EU may be subject to import duties and taxes.
            </li>
          </ul>
        </div>
      </div>

      <div className="text-center">
        <p className="text-gray-600 mb-4">Have questions about shipping?</p>
        <Link
          to="/contact"
          className="inline-block bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
        >
          Contact Us
        </Link>
      </div>
    </div>
  )
}

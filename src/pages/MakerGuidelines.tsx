import React from 'react'
import { Link } from 'react-router-dom'
import { Camera, Package, Shield, CheckCircle, XCircle, AlertTriangle, Image, Box, Truck } from 'lucide-react'

export const MakerGuidelines: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Maker Guidelines</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Follow these standards to ensure your products look their best and reach customers safely.
        </p>
      </div>

      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
            <Camera className="w-6 h-6 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Photo Standards</h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Required Photo Specifications</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Technical Requirements</h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <span>Minimum 1200 x 1200 pixels</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <span>JPEG, PNG, or WebP format</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <span>Maximum file size: 10MB</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <span>Square or 4:3 aspect ratio preferred</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Minimum Photo Count</h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <Image className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" />
                  <span>At least 3 photos per product</span>
                </li>
                <li className="flex items-start gap-2">
                  <Image className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" />
                  <span>1 main hero shot (white/neutral background)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Image className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" />
                  <span>1 lifestyle/context shot</span>
                </li>
                <li className="flex items-start gap-2">
                  <Image className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" />
                  <span>1 detail/texture close-up</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-green-50 rounded-xl p-6">
            <h3 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" /> Good Photos
            </h3>
            <ul className="space-y-2 text-green-700">
              <li>Natural daylight or soft studio lighting</li>
              <li>Clean, uncluttered backgrounds</li>
              <li>Sharp focus on the product</li>
              <li>True-to-life colors</li>
              <li>Shows scale (hand, ruler, common object)</li>
              <li>Multiple angles</li>
            </ul>
          </div>

          <div className="bg-red-50 rounded-xl p-6">
            <h3 className="font-semibold text-red-800 mb-4 flex items-center gap-2">
              <XCircle className="w-5 h-5" /> Avoid
            </h3>
            <ul className="space-y-2 text-red-700">
              <li>Blurry or out-of-focus images</li>
              <li>Poor lighting (too dark/washed out)</li>
              <li>Cluttered backgrounds</li>
              <li>Watermarks or text overlays</li>
              <li>Heavy filters that alter colors</li>
              <li>Stock photos or images from other sellers</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Package className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Packaging Standards</h2>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-amber-800 mb-2">Shipping Damage Prevention</h3>
              <p className="text-amber-700">
                Proper packaging is essential to protect handmade items during transit. Damaged items result in returns, refunds, and unhappy customers. Follow these guidelines to minimize damage.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Packaging by Product Type</h3>
          </div>

          <div className="divide-y divide-gray-100">
            <div className="p-6">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Box className="w-5 h-5 text-red-500" /> Fragile Items (Ceramics, Glass, Pottery)
              </h4>
              <ul className="space-y-2 text-gray-600 ml-7">
                <li>Wrap each piece individually in bubble wrap (minimum 2 layers)</li>
                <li>Use foam peanuts or crumpled paper to fill empty space</li>
                <li>Double-box: place wrapped item in inner box, then in outer box with padding</li>
                <li>Mark package as "FRAGILE" on multiple sides</li>
                <li>Consider shipping insurance for items over EUR50</li>
              </ul>
            </div>

            <div className="p-6">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Box className="w-5 h-5 text-amber-500" /> Textiles (Woven, Felted, Leather)
              </h4>
              <ul className="space-y-2 text-gray-600 ml-7">
                <li>Fold neatly with tissue paper between layers</li>
                <li>Use waterproof inner bag or wrap</li>
                <li>Avoid plastic bags that can cause moisture buildup</li>
                <li>Include silica gel packets for humidity control</li>
              </ul>
            </div>

            <div className="p-6">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Box className="w-5 h-5 text-green-500" /> Wooden Items
              </h4>
              <ul className="space-y-2 text-gray-600 ml-7">
                <li>Wrap in soft cloth or tissue paper to prevent scratches</li>
                <li>Protect corners and edges with cardboard</li>
                <li>Use moisture barrier for untreated wood</li>
                <li>Secure moving parts to prevent damage</li>
              </ul>
            </div>

            <div className="p-6">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Box className="w-5 h-5 text-blue-500" /> Jewelry & Small Items
              </h4>
              <ul className="space-y-2 text-gray-600 ml-7">
                <li>Use jewelry boxes or padded pouches</li>
                <li>Separate pieces to prevent tangling or scratching</li>
                <li>Place small box inside larger padded envelope or box</li>
                <li>Include anti-tarnish strips for silver items</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-gray-600" /> General Packaging Rules
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                <span>Use new, sturdy boxes (not recycled damaged boxes)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                <span>Include packing slip with order details</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                <span>Add care instructions for the product</span>
              </li>
            </ul>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                <span>Seal all openings with strong packing tape</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                <span>Perform the "shake test" before sealing</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                <span>Consider eco-friendly packaging materials</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Quality Assurance</h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Before Listing Checklist</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <input type="checkbox" className="w-5 h-5 text-amber-600 rounded mt-0.5" />
              <span className="text-gray-700">Product is free from defects</span>
            </label>
            <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <input type="checkbox" className="w-5 h-5 text-amber-600 rounded mt-0.5" />
              <span className="text-gray-700">Photos meet quality standards</span>
            </label>
            <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <input type="checkbox" className="w-5 h-5 text-amber-600 rounded mt-0.5" />
              <span className="text-gray-700">Description is accurate and complete</span>
            </label>
            <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <input type="checkbox" className="w-5 h-5 text-amber-600 rounded mt-0.5" />
              <span className="text-gray-700">Dimensions and materials listed</span>
            </label>
            <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <input type="checkbox" className="w-5 h-5 text-amber-600 rounded mt-0.5" />
              <span className="text-gray-700">Price covers materials + labor + shipping margin</span>
            </label>
            <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <input type="checkbox" className="w-5 h-5 text-amber-600 rounded mt-0.5" />
              <span className="text-gray-700">Packaging materials ready</span>
            </label>
          </div>
        </div>
      </section>

      <div className="bg-amber-600 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-4">Ready to List Your Products?</h2>
        <p className="mb-6 text-amber-100">
          Follow these guidelines and your products will shine on the marketplace.
        </p>
        <Link
          to="/become-maker"
          className="inline-block bg-white text-amber-600 px-8 py-3 rounded-lg font-semibold hover:bg-amber-50 transition-colors"
        >
          Apply to Become a Maker
        </Link>
      </div>
    </div>
  )
}

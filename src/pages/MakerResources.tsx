import React from 'react'
import { Link } from 'react-router-dom'
import { Camera, Package, TrendingUp, Users, FileText, Video, Download, ExternalLink } from 'lucide-react'

export const MakerResources: React.FC = () => {
  const resources = [
    {
      icon: Camera,
      title: 'Product Photography Guide',
      description: 'Learn how to take stunning photos of your crafts using just your smartphone.',
      type: 'PDF Guide',
      link: '#'
    },
    {
      icon: Package,
      title: 'Packaging Best Practices',
      description: 'Tips for safely packaging pottery, textiles, and other handmade items for shipping.',
      type: 'Article',
      link: '#'
    },
    {
      icon: TrendingUp,
      title: 'Pricing Your Crafts',
      description: 'Calculate fair prices that cover your costs and value your time appropriately.',
      type: 'Calculator Tool',
      link: '#'
    },
    {
      icon: FileText,
      title: 'Writing Product Descriptions',
      description: 'Craft compelling descriptions that tell your story and sell your products.',
      type: 'Template',
      link: '#'
    },
    {
      icon: Users,
      title: 'Building Your Brand',
      description: 'Develop a memorable brand identity that reflects your craft and values.',
      type: 'Video Course',
      link: '#'
    },
    {
      icon: Video,
      title: 'Craft Process Videos',
      description: 'Examples of how to create engaging behind-the-scenes content.',
      type: 'Video Examples',
      link: '#'
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Maker Resources</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Everything you need to succeed as an artisan on Crafts And Hands. Free guides, templates, and tools.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {resources.map((resource, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <resource.icon className="w-10 h-10 text-amber-600 mb-4" />
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
              {resource.type}
            </span>
            <h3 className="font-semibold text-gray-900 mt-3 mb-2">{resource.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{resource.description}</p>
            <button className="text-amber-600 font-medium text-sm flex items-center gap-1 hover:text-amber-700">
              Access Resource <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 rounded-2xl p-8 md:p-12 text-white mb-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-bold mb-4">Maker Starter Kit</h2>
            <p className="text-gray-300 mb-6">
              Download our comprehensive starter kit with everything you need to set up your shop: photography tips, pricing calculator, listing templates, and more.
            </p>
            <button className="bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors flex items-center gap-2">
              <Download className="w-5 h-5" /> Download Starter Kit
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-3xl font-bold text-amber-500">20+</p>
              <p className="text-sm text-gray-400">Templates included</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-3xl font-bold text-amber-500">5</p>
              <p className="text-sm text-gray-400">Video tutorials</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-3xl font-bold text-amber-500">3</p>
              <p className="text-sm text-gray-400">Calculator tools</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-3xl font-bold text-amber-500">100%</p>
              <p className="text-sm text-gray-400">Free forever</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 rounded-2xl p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">Upcoming Maker Workshops</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: 'Product Photography Basics', date: 'Feb 15, 2026', spots: '12 spots left' },
            { title: 'Social Media for Artisans', date: 'Feb 22, 2026', spots: '8 spots left' },
            { title: 'Shipping & Logistics', date: 'Mar 1, 2026', spots: '15 spots left' },
          ].map((workshop, index) => (
            <div key={index} className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-gray-900">{workshop.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{workshop.date}</p>
              <p className="text-xs text-amber-600 mt-2">{workshop.spots}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link to="/events" className="text-amber-600 font-medium hover:text-amber-700">
            View All Workshops
          </Link>
        </div>
      </div>

      <div className="text-center mt-12">
        <p className="text-gray-600 mb-4">Ready to start selling?</p>
        <Link
          to="/become-maker"
          className="inline-block bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
        >
          Become a Maker
        </Link>
      </div>
    </div>
  )
}

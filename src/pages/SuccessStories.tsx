import React from 'react'
import { Link } from 'react-router-dom'
import { Quote, MapPin, Star, ArrowRight } from 'lucide-react'

const stories = [
  {
    name: 'Deividas Jotautis',
    craft: 'Traditional Pottery',
    location: 'Kaunas',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
    quote: 'Crafts And Hands helped me reach customers I never could have found on my own. My pottery now ships across Europe, and I can focus on what I love - creating.',
    stats: { sales: 250, rating: 4.9, years: 2 }
  },
  {
    name: 'Virginija Stigaitė',
    craft: 'Traditional Weaving',
    location: 'Vilnius',
    image: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&h=400&fit=crop',
    quote: 'The platform made it easy to share my weaving with the world. I especially love the community of fellow artisans - we support each other.',
    stats: { sales: 180, rating: 4.8, years: 1.5 }
  },
  {
    name: 'Kazys Morkūnas',
    craft: 'Basketry',
    location: 'Anykščiai',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    quote: 'At 65, I thought my basket weaving was just a hobby. Now it is a thriving business. Young people appreciate traditional crafts more than I expected.',
    stats: { sales: 320, rating: 5.0, years: 3 }
  },
  {
    name: 'Rasa Balsevičienė',
    craft: 'Wool Felting',
    location: 'Kretinga',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    quote: 'The felted slippers I make by hand are now worn in homes across Lithuania and beyond. It is incredibly rewarding to preserve this tradition.',
    stats: { sales: 420, rating: 4.9, years: 2 }
  },
]

export const SuccessStories: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Success Stories</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Meet the artisans who have built thriving businesses sharing their traditional Lithuanian crafts with the world.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-16">
        {stories.map((story, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <img
                  src={story.image}
                  alt={story.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{story.name}</h3>
                  <p className="text-amber-600">{story.craft}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" /> {story.location}
                  </p>
                </div>
              </div>
              <div className="relative">
                <Quote className="w-8 h-8 text-amber-200 absolute -top-2 -left-2" />
                <p className="text-gray-600 italic pl-6">{story.quote}</p>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-600">{story.stats.sales}+</p>
                  <p className="text-xs text-gray-500">Sales</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-600 flex items-center justify-center gap-1">
                    {story.stats.rating} <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  </p>
                  <p className="text-xs text-gray-500">Rating</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-600">{story.stats.years}</p>
                  <p className="text-xs text-gray-500">Years</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 rounded-2xl p-8 md:p-12 text-center text-white mb-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Our Impact</h2>
        <p className="text-gray-300 max-w-2xl mx-auto mb-8">
          Together, we're preserving Lithuanian craft traditions while creating economic opportunities for artisans.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-4xl font-bold text-amber-500">150+</p>
            <p className="text-gray-400">Active Makers</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-amber-500">10,000+</p>
            <p className="text-gray-400">Products Sold</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-amber-500">15</p>
            <p className="text-gray-400">Countries Reached</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-amber-500">500K EUR</p>
            <p className="text-gray-400">Paid to Artisans</p>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Write Your Success Story</h2>
        <p className="text-gray-600 max-w-xl mx-auto mb-6">
          Join our community of artisans and share your traditional craft with customers who value authentic, handmade products.
        </p>
        <Link
          to="/become-maker"
          className="inline-flex items-center gap-2 bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
        >
          Start Your Journey <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  )
}

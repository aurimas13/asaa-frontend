import React, { useEffect, useState } from 'react'
import { Calendar, MapPin, Users, Clock, ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface Event {
  id: string
  title: string
  description: string
  event_type: string
  start_date: string
  end_date: string
  location: string
  city: string
  country: string
  online_url: string
  price: number
  max_attendees: number
  image_url: string
  status: string
  makers: { business_name: string }
}

export const Events: React.FC = () => {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('upcoming')
  const [registrations, setRegistrations] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadEvents()
    if (user) loadRegistrations()
  }, [filter, user])

  const loadEvents = async () => {
    setLoading(true)
    let query = supabase
      .from('events')
      .select('*, makers(business_name)')
      .order('start_date', { ascending: true })

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data } = await query.limit(20)
    if (data) setEvents(data as Event[])
    setLoading(false)
  }

  const loadRegistrations = async () => {
    const { data } = await supabase
      .from('event_registrations')
      .select('event_id')
      .eq('user_id', user?.id)

    if (data) {
      setRegistrations(new Set(data.map(r => r.event_id)))
    }
  }

  const toggleRegistration = async (eventId: string) => {
    if (!user) {
      alert('Please sign in to register for events')
      return
    }

    if (registrations.has(eventId)) {
      await supabase
        .from('event_registrations')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id)
      setRegistrations(prev => {
        const next = new Set(prev)
        next.delete(eventId)
        return next
      })
    } else {
      await supabase.from('event_registrations').insert({
        event_id: eventId,
        user_id: user.id,
      })
      setRegistrations(prev => new Set([...prev, eventId]))
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getEventTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      market: t('events.types.market'),
      workshop: t('events.types.workshop'),
      exhibition: t('events.types.exhibition'),
      online: t('events.types.online'),
      fair: t('events.types.fair'),
    }
    return types[type] || type
  }

  const getFilterLabel = (f: string) => {
    const labels: Record<string, string> = {
      upcoming: t('events.upcoming'),
      ongoing: t('events.ongoing'),
      all: t('events.all'),
    }
    return labels[f] || f
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('events.title')}</h1>
          <p className="text-gray-600 mt-1">{t('events.subtitle')}</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {['upcoming', 'ongoing', 'all'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {getFilterLabel(f)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-48 rounded-xl" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900">{t('events.noEvents')}</h3>
          <p className="text-gray-600 mt-2">{t('events.noEventsDesc')}</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col md:flex-row">
              <div className="w-full md:w-72 h-48 md:h-auto flex-shrink-0">
                <img
                  src={event.image_url || 'https://images.pexels.com/photos/7688460/pexels-photo-7688460.jpeg?auto=compress&cs=tinysrgb&w=800'}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      event.event_type === 'online' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {getEventTypeLabel(event.event_type)}
                    </span>
                    <h3 className="text-xl font-semibold text-gray-900 mt-2">{event.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">by {event.makers?.business_name}</p>
                  </div>
                  {event.price > 0 && (
                    <span className="text-lg font-bold text-amber-600">€{event.price}</span>
                  )}
                </div>

                <p className="text-gray-600 mt-3 line-clamp-2">{event.description}</p>

                <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDate(event.start_date)}
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {[event.location, event.city, event.country].filter(Boolean).join(', ')}
                    </div>
                  )}
                  {event.max_attendees && (
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {t('events.maxAttendees')}: {event.max_attendees}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-6">
                  <button
                    onClick={() => toggleRegistration(event.id)}
                    className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                      registrations.has(event.id)
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-amber-600 text-white hover:bg-amber-700'
                    }`}
                  >
                    {registrations.has(event.id) ? t('events.registered') : t('events.register')}
                  </button>
                  {event.online_url && (
                    <a
                      href={event.online_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-amber-600 hover:underline"
                    >
                      {t('events.joinOnline')} <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

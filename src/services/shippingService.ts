import { supabase } from '../lib/supabase'

export interface ShippingZone {
  id: string
  name: string
  countries: string[]
}

export interface ShippingRate {
  id: string
  zone_id: string
  method: 'economy' | 'standard' | 'express'
  price: number
  estimated_days_min: number
  estimated_days_max: number
  free_shipping_threshold: number
}

const COUNTRY_CODES: Record<string, string> = {
  'Lithuania': 'LT',
  'Latvia': 'LV',
  'Estonia': 'EE',
  'Poland': 'PL',
  'Germany': 'DE',
  'France': 'FR',
  'Netherlands': 'NL',
  'Belgium': 'BE',
  'Austria': 'AT',
  'Italy': 'IT',
  'Spain': 'ES',
  'Portugal': 'PT',
  'Sweden': 'SE',
  'Denmark': 'DK',
  'Finland': 'FI',
  'Czech Republic': 'CZ',
  'Slovakia': 'SK',
  'Hungary': 'HU',
  'Romania': 'RO',
  'Bulgaria': 'BG',
  'Greece': 'GR',
  'Ireland': 'IE',
  'Croatia': 'HR',
  'Slovenia': 'SI',
  'United Kingdom': 'GB',
  'United States': 'US',
  'Canada': 'CA',
  'Australia': 'AU',
  'Japan': 'JP',
  'Switzerland': 'CH',
  'Norway': 'NO',
}

export const SUPPORTED_COUNTRIES = Object.keys(COUNTRY_CODES)

export async function getShippingZoneForCountry(country: string): Promise<ShippingZone | null> {
  const countryCode = COUNTRY_CODES[country] || country

  const { data: zones } = await supabase
    .from('shipping_zones')
    .select('*')
    .eq('active', true)
    .order('sort_order')

  if (!zones) return null

  for (const zone of zones) {
    if (zone.countries.includes(countryCode)) {
      return zone
    }
  }

  const restOfWorld = zones.find(z => z.name === 'Rest of World')
  return restOfWorld || null
}

export async function getShippingRates(zoneId: string): Promise<ShippingRate[]> {
  const { data } = await supabase
    .from('shipping_rates')
    .select('*')
    .eq('zone_id', zoneId)
    .eq('active', true)
    .order('price')

  return (data || []) as ShippingRate[]
}

export function calculateShippingCost(
  rate: ShippingRate,
  subtotal: number
): { cost: number; isFree: boolean } {
  if (subtotal >= rate.free_shipping_threshold) {
    return { cost: 0, isFree: true }
  }
  return { cost: rate.price, isFree: false }
}

export function formatDeliveryEstimate(rate: ShippingRate): string {
  if (rate.estimated_days_min === rate.estimated_days_max) {
    return `${rate.estimated_days_min} business days`
  }
  return `${rate.estimated_days_min}-${rate.estimated_days_max} business days`
}

export function getMethodLabel(method: string): string {
  switch (method) {
    case 'economy': return 'Economy'
    case 'standard': return 'Standard'
    case 'express': return 'Express'
    default: return method
  }
}

export function generateRMANumber(): string {
  const prefix = 'RMA'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

export type ShippingCarrier = 'lietuvos_pastas' | 'omniva' | 'dpd'

export interface CarrierInfo {
  id: ShippingCarrier
  name: string
  nameLt: string
  logo: string
  trackingUrlTemplate: string
  pickupPoints: boolean
  homeDelivery: boolean
  estimatedDays: { min: number; max: number }
  supportedCountries: string[]
}

export const SHIPPING_CARRIERS: Record<ShippingCarrier, CarrierInfo> = {
  lietuvos_pastas: {
    id: 'lietuvos_pastas',
    name: 'Lietuvos Pastas',
    nameLt: 'Lietuvos paštas',
    logo: 'https://www.post.lt/sites/default/files/LP_logo.png',
    trackingUrlTemplate: 'https://www.post.lt/siuntu-sekimas?tracking_code={trackingNumber}',
    pickupPoints: true,
    homeDelivery: true,
    estimatedDays: { min: 2, max: 5 },
    supportedCountries: ['LT', 'LV', 'EE', 'PL', 'DE', 'FR', 'NL', 'BE', 'AT', 'IT', 'ES'],
  },
  omniva: {
    id: 'omniva',
    name: 'Omniva',
    nameLt: 'Omniva',
    logo: 'https://www.omniva.lt/images/omniva-logo.svg',
    trackingUrlTemplate: 'https://www.omniva.lt/track/{trackingNumber}',
    pickupPoints: true,
    homeDelivery: true,
    estimatedDays: { min: 1, max: 3 },
    supportedCountries: ['LT', 'LV', 'EE', 'PL', 'FI'],
  },
  dpd: {
    id: 'dpd',
    name: 'DPD',
    nameLt: 'DPD Lietuva',
    logo: 'https://www.dpd.lt/templates/dpd/images/dpd-logo.svg',
    trackingUrlTemplate: 'https://www.dpd.lt/lt/siuntos-sekimas?parcelNumber={trackingNumber}',
    pickupPoints: true,
    homeDelivery: true,
    estimatedDays: { min: 1, max: 2 },
    supportedCountries: ['LT', 'LV', 'EE', 'PL', 'DE', 'FR', 'NL', 'BE', 'AT', 'IT', 'ES', 'GB', 'SE', 'DK', 'FI', 'CZ', 'SK', 'HU', 'RO', 'BG'],
  },
}

export function getCarrierTrackingUrl(carrier: ShippingCarrier, trackingNumber: string): string {
  const carrierInfo = SHIPPING_CARRIERS[carrier]
  if (!carrierInfo) return ''
  return carrierInfo.trackingUrlTemplate.replace('{trackingNumber}', trackingNumber)
}

export function getCarriersForCountry(countryCode: string): CarrierInfo[] {
  return Object.values(SHIPPING_CARRIERS).filter(
    carrier => carrier.supportedCountries.includes(countryCode)
  )
}

export function getRecommendedCarrier(countryCode: string, method: string): ShippingCarrier {
  if (countryCode === 'LT') {
    if (method === 'express') return 'dpd'
    if (method === 'economy') return 'lietuvos_pastas'
    return 'omniva'
  }

  if (['LV', 'EE'].includes(countryCode)) {
    return method === 'express' ? 'dpd' : 'omniva'
  }

  return 'dpd'
}

export function generateTrackingNumber(carrier: ShippingCarrier): string {
  const prefix = carrier === 'lietuvos_pastas' ? 'LP' :
                 carrier === 'omniva' ? 'OM' : 'DPD'
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}${timestamp}${random}`
}

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

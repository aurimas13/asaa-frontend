import { supabase } from '../lib/supabase'

export type PaymentMethod = 'stripe' | 'paysera'

export interface PaymentConfig {
  id: PaymentMethod
  name: string
  nameLt: string
  logo: string
  supportedCountries: string[]
  supportedCurrencies: string[]
  minAmount: number
  maxAmount: number
}

export const PAYMENT_METHODS: Record<PaymentMethod, PaymentConfig> = {
  stripe: {
    id: 'stripe',
    name: 'Credit/Debit Card',
    nameLt: 'Kredito/Debeto kortele',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg',
    supportedCountries: ['LT', 'LV', 'EE', 'PL', 'DE', 'FR', 'NL', 'BE', 'AT', 'IT', 'ES', 'GB', 'US', 'CA', 'AU'],
    supportedCurrencies: ['EUR', 'USD', 'GBP'],
    minAmount: 0.50,
    maxAmount: 999999,
  },
  paysera: {
    id: 'paysera',
    name: 'Paysera / Bank Transfer',
    nameLt: 'Paysera / Bankinis pavedimas',
    logo: 'https://www.paysera.lt/v2/images/logos/paysera-logo.svg',
    supportedCountries: ['LT', 'LV', 'EE', 'PL', 'DE', 'FR', 'NL', 'BE', 'AT', 'IT', 'ES'],
    supportedCurrencies: ['EUR'],
    minAmount: 1,
    maxAmount: 10000,
  },
}

export function getAvailablePaymentMethods(countryCode: string, currency: string = 'EUR'): PaymentConfig[] {
  return Object.values(PAYMENT_METHODS).filter(
    method =>
      method.supportedCountries.includes(countryCode) &&
      method.supportedCurrencies.includes(currency)
  )
}

export async function createCheckoutSession(
  orderId: string,
  amount: number,
  provider: PaymentMethod = 'stripe',
  currency: string = 'EUR'
): Promise<{ sessionUrl: string } | { error: string }> {
  try {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.access_token) {
      return { error: 'Not authenticated' }
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          provider,
          order_id: orderId,
          amount,
          currency,
          success_url: `${window.location.origin}/order-confirmation?order=${orderId}&payment=success`,
          cancel_url: `${window.location.origin}/cart?payment=cancelled`,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      return { error: error.message || error.error || 'Failed to create checkout session' }
    }

    return await response.json()
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Payment error' }
  }
}

export async function createStripeCheckoutSession(
  orderId: string,
  amount: number,
  currency: string = 'EUR'
): Promise<{ sessionUrl: string } | { error: string }> {
  return createCheckoutSession(orderId, amount, 'stripe', currency)
}

export async function createPayseraCheckoutSession(
  orderId: string,
  amount: number
): Promise<{ sessionUrl: string } | { error: string }> {
  return createCheckoutSession(orderId, amount, 'paysera', 'EUR')
}

export function formatPrice(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('lt-LT', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function getCountryCode(countryName: string): string {
  const countryMap: Record<string, string> = {
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
    'United Kingdom': 'GB',
    'United States': 'US',
    'Canada': 'CA',
    'Australia': 'AU',
  }
  return countryMap[countryName] || 'LT'
}

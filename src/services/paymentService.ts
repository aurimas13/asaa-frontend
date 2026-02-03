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
    nameLt: 'Kredito/Debeto kortelė',
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

export async function createStripeCheckoutSession(orderId: string, amount: number, currency: string = 'EUR'): Promise<{ sessionUrl: string } | { error: string }> {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await import('../lib/supabase')).supabase.auth.getSession().then(s => s.data.session?.access_token)}`,
        },
        body: JSON.stringify({
          provider: 'stripe',
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
      return { error: error.message || 'Failed to create checkout session' }
    }

    return await response.json()
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Payment error' }
  }
}

export async function createPayseraCheckoutSession(orderId: string, amount: number): Promise<{ sessionUrl: string } | { error: string }> {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await import('../lib/supabase')).supabase.auth.getSession().then(s => s.data.session?.access_token)}`,
        },
        body: JSON.stringify({
          provider: 'paysera',
          order_id: orderId,
          amount,
          currency: 'EUR',
          success_url: `${window.location.origin}/order-confirmation?order=${orderId}&payment=success`,
          cancel_url: `${window.location.origin}/cart?payment=cancelled`,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      return { error: error.message || 'Failed to create checkout session' }
    }

    return await response.json()
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Payment error' }
  }
}

export function formatPrice(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('lt-LT', {
    style: 'currency',
    currency,
  }).format(amount)
}

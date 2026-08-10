import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export const PLANS = {
  pro_monthly: {
    priceId: process.env.STRIPE_PRICE_PRO_MONTHLY!,
    name: 'Pro Mensal',
    price: 'R$39,90/mês',
  },
  pro_yearly: {
    priceId: process.env.STRIPE_PRICE_PRO_YEARLY!,
    name: 'Pro Anual',
    price: 'R$399,00/ano',
  },
} as const

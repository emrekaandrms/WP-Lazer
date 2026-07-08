export type CardBrand = 'visa' | 'mastercard' | 'troy' | 'amex' | null

// BIN-prefix based scheme detection — no external lookup needed.
export function detectCardBrand(rawNumber: string): CardBrand {
  const digits = rawNumber.replace(/\D/g, '')
  if (/^4/.test(digits)) return 'visa'
  if (/^(5[1-5]|2(2[2-9][1-9]|2[3-9]\d|[3-6]\d{2}|7[01]\d|720))/.test(digits)) return 'mastercard'
  if (/^9792/.test(digits)) return 'troy'
  if (/^3[47]/.test(digits)) return 'amex'
  return null
}

export function formatCardNumber(rawNumber: string, brand: CardBrand): string {
  const digits = rawNumber.replace(/\D/g, '').slice(0, brand === 'amex' ? 15 : 19)
  if (brand === 'amex') {
    return [digits.slice(0, 4), digits.slice(4, 10), digits.slice(10, 15)].filter(Boolean).join(' ')
  }
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
}

export function cvvMaxLength(brand: CardBrand): number {
  return brand === 'amex' ? 4 : 3
}

export const CARD_BRAND_LABEL: Record<Exclude<CardBrand, null>, string> = {
  visa: 'VISA',
  mastercard: 'Mastercard',
  troy: 'TROY',
  amex: 'AMEX',
}

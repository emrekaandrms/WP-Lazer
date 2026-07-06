export function formatCurrencyAmount(value: number, currencyCode = 'TRY') {
  if (!Number.isFinite(value) || value <= 0) return 'Fiyat sorunuz'

  const normalizedCurrency = currencyCode === 'EUR' || currencyCode === 'USD' ? currencyCode : 'TRY'

  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: normalizedCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

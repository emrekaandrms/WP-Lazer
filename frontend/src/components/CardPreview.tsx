'use client'

import { CARD_BRAND_LABEL, detectCardBrand, formatCardNumber } from '@/lib/card'

const BRAND_STYLES: Record<string, string> = {
  visa: 'bg-[#1A1F71] text-white',
  mastercard: 'bg-gradient-to-r from-[#EB001B] to-[#F79E1B] text-white',
  troy: 'bg-[#C8102E] text-white',
  amex: 'bg-[#2E77BC] text-white',
}

interface CardPreviewProps {
  number: string
  name: string
  month: string
  year: string
}

export function CardPreview({ number, name, month, year }: CardPreviewProps) {
  const brand = detectCardBrand(number)
  const formatted = formatCardNumber(number, brand) || '•••• •••• •••• ••••'
  const maskedGroups = formatted
    .padEnd(brand === 'amex' ? 17 : 19, '•')
    .replace(/[^\d\s•]/g, '')

  return (
    <div className="relative w-full aspect-[1.586/1] max-w-sm rounded-xl bg-gradient-to-br from-[#1c1c1c] to-[#0a0a0a] border border-outline-variant/30 p-5 flex flex-col justify-between shadow-lg overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-[0.08]" />
      <div className="relative flex items-start justify-between">
        <span className="material-symbols-outlined text-3xl text-primary/80">contactless</span>
        {brand && (
          <span className={`px-2.5 py-1 text-[10px] font-headline font-black uppercase tracking-widest ${BRAND_STYLES[brand]}`}>
            {CARD_BRAND_LABEL[brand]}
          </span>
        )}
      </div>
      <div className="relative font-mono text-lg sm:text-xl tracking-[0.15em] text-white">
        {maskedGroups || '•••• •••• •••• ••••'}
      </div>
      <div className="relative flex items-end justify-between">
        <span className="text-[11px] uppercase tracking-widest text-white/80 truncate max-w-[65%]">
          {name || 'AD SOYAD'}
        </span>
        <span className="text-[11px] uppercase tracking-widest text-white/80">
          {(month || 'AA')}/{(year ? year.slice(-2) : 'YY')}
        </span>
      </div>
    </div>
  )
}

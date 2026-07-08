'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { CardPreview } from '@/components/CardPreview'
import { useCart } from '@/lib/cart'
import { formatCurrencyAmount } from '@/lib/money'
import { getWpRestBaseUrl } from '@/lib/urls'
import { cvvMaxLength, detectCardBrand, formatCardNumber } from '@/lib/card'

type Billing = {
  first_name: string
  last_name: string
  email: string
  phone: string
  address_1: string
  city: string
  postcode: string
}

type Card = {
  number: string
  month: string
  year: string
  cvv: string
  name: string
}

const emptyBilling: Billing = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  address_1: '',
  city: '',
  postcode: '',
}

const emptyCard: Card = { number: '', month: '', year: '', cvv: '', name: '' }

const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 16 }, (_, i) => String(CURRENT_YEAR + i))

const inputClass =
  'border border-outline-variant/30 bg-background px-4 py-3 text-sm outline-none focus:border-primary transition-colors'

export default function CheckoutPage() {
  const { items, total, itemCount, updateQty, removeItem, clearCart } = useCart()
  const [note, setNote] = useState('')
  const [billing, setBilling] = useState<Billing>(emptyBilling)
  const [card, setCard] = useState<Card>(emptyCard)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bankError, setBankError] = useState<string | null>(null)

  useEffect(() => {
    const qnbError = new URLSearchParams(window.location.search).get('qnb_error')
    if (qnbError) setBankError(qnbError)
  }, [])

  const setBillingField = (field: keyof Billing) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setBilling((prev) => ({ ...prev, [field]: e.target.value }))

  const cardBrand = detectCardBrand(card.number)

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const brand = detectCardBrand(e.target.value)
    setCard((prev) => ({ ...prev, number: formatCardNumber(e.target.value, brand) }))
  }

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, cvvMaxLength(cardBrand))
    setCard((prev) => ({ ...prev, cvv: digits }))
  }

  const submitPayment = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const invalidItem = items.find((item) => !item.productId)
      if (invalidItem) {
        throw new Error(`${invalidItem.name} için ürün bilgisi eksik. Lütfen ürünü sepetten çıkarıp tekrar ekleyin.`)
      }

      const base = getWpRestBaseUrl()

      const response = await fetch(`${base}/wp-lzer/v1/qnb/checkout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({ product_id: item.productId, quantity: item.qty })),
          billing,
          card: { ...card, number: card.number.replace(/\s/g, '') },
          note,
        }),
      })

      const data = await response.json().catch(() => null)
      if (!response.ok || !data?.ok) {
        throw new Error(data?.message || 'Ödeme başlatılamadı. Lütfen tekrar deneyin.')
      }

      clearCart()

      // Build + auto-submit a hidden form that sends the browser DIRECTLY to the bank's
      // own 3D Secure page — the only step in this flow that leaves lazeronline.com.tr,
      // and it's required by the 3D Secure protocol itself.
      const form = document.createElement('form')
      form.method = data.method || 'POST'
      form.action = data.gateway
      Object.entries(data.inputs as Record<string, string>).forEach(([key, value]) => {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = key
        input.value = value
        form.appendChild(input)
      })
      document.body.appendChild(form)
      form.submit()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ödeme başlatılamadı.')
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-surface px-6 pb-20">
        <div className="container mx-auto">
          <h1 className="font-headline text-4xl font-bold uppercase tracking-tight mb-8">Ödeme</h1>

          {bankError && (
            <div className="mb-6 border border-error/30 bg-error/10 p-4 text-sm text-error">
              Ödeme tamamlanamadı: {bankError}
            </div>
          )}

          {items.length === 0 ? (
            <div className="border border-outline-variant/20 bg-surface-container p-12 flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-6xl text-outline-variant/50">shopping_cart</span>
              <p className="mt-4 text-outline">Sepetiniz boş.</p>
              <Link
                href="/products"
                className="mt-6 inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 font-headline text-sm font-black uppercase tracking-widest hover:brightness-110 transition-all"
              >
                Alışverişe Başla
              </Link>
            </div>
          ) : (
            <form onSubmit={submitPayment} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart items + billing + card */}
              <section className="lg:col-span-2 space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="flex items-center justify-center w-6 h-6 bg-primary text-on-primary font-headline text-xs font-black">1</span>
                    <h2 className="font-headline text-sm font-bold uppercase tracking-widest text-on-surface">Sepetiniz</h2>
                  </div>
                  <div className="border border-outline-variant/20 bg-surface-container divide-y divide-outline-variant/15">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4 p-4">
                        <div className="w-24 h-24 shrink-0 bg-surface-container-lowest border border-outline-variant/20 overflow-hidden">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
                          ) : (
                            <div className="w-full h-full grid-pattern opacity-10" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="block font-headline text-sm font-bold uppercase leading-tight text-on-surface">
                            {item.name}
                          </span>
                          {item.sku && <span className="mt-1 block text-[10px] uppercase tracking-widest text-outline">{item.sku}</span>}
                          <div className="mt-3 flex items-center justify-between gap-3">
                            <div className="flex items-center border border-outline-variant/40">
                              <button type="button" className="w-8 h-8 text-outline hover:text-on-surface" onClick={() => updateQty(item.id, item.qty - 1)} aria-label="Azalt">−</button>
                              <span className="w-10 text-center text-sm">{item.qty}</span>
                              <button type="button" className="w-8 h-8 text-outline hover:text-on-surface" onClick={() => updateQty(item.id, item.qty + 1)} aria-label="Artır">+</button>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-headline text-base font-bold text-primary">{formatCurrencyAmount(item.price * item.qty)}</span>
                              <button type="button" className="material-symbols-outlined text-base text-outline hover:text-error" onClick={() => removeItem(item.id)} aria-label="Kaldır">delete</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="flex items-center justify-center w-6 h-6 bg-primary text-on-primary font-headline text-xs font-black">2</span>
                    <h2 className="font-headline text-sm font-bold uppercase tracking-widest text-on-surface">Fatura / Teslimat Bilgileri</h2>
                  </div>
                  <div className="border border-outline-variant/20 bg-surface-container p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input required placeholder="Ad" value={billing.first_name} onChange={setBillingField('first_name')} className={inputClass} />
                      <input required placeholder="Soyad" value={billing.last_name} onChange={setBillingField('last_name')} className={inputClass} />
                      <input required type="email" placeholder="E-posta" value={billing.email} onChange={setBillingField('email')} className={inputClass} />
                      <input required placeholder="Telefon" value={billing.phone} onChange={setBillingField('phone')} className={inputClass} />
                      <input required placeholder="Adres" value={billing.address_1} onChange={setBillingField('address_1')} className={`sm:col-span-2 ${inputClass}`} />
                      <input required placeholder="Şehir" value={billing.city} onChange={setBillingField('city')} className={inputClass} />
                      <input required placeholder="Posta Kodu" value={billing.postcode} onChange={setBillingField('postcode')} className={inputClass} />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="flex items-center justify-center w-6 h-6 bg-primary text-on-primary font-headline text-xs font-black">3</span>
                    <h2 className="font-headline text-sm font-bold uppercase tracking-widest text-on-surface">Kart Bilgileri</h2>
                  </div>
                  <div className="border border-outline-variant/20 bg-surface-container p-5">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6">
                      <div className="grid grid-cols-1 gap-3">
                        <input
                          required
                          placeholder="Kart Üzerindeki İsim"
                          autoComplete="cc-name"
                          value={card.name}
                          onChange={(e) => setCard((prev) => ({ ...prev, name: e.target.value.toLocaleUpperCase('tr') }))}
                          className={inputClass}
                        />
                        <input
                          required
                          placeholder="1111 2222 3333 4444"
                          inputMode="numeric"
                          autoComplete="cc-number"
                          value={card.number}
                          onChange={handleCardNumberChange}
                          className={`font-mono tracking-wider ${inputClass}`}
                        />
                        <div className="grid grid-cols-3 gap-3">
                          <select
                            required
                            value={card.month}
                            onChange={(e) => setCard((prev) => ({ ...prev, month: e.target.value }))}
                            className={inputClass}
                          >
                            <option value="" disabled>Ay</option>
                            {MONTHS.map((m) => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                          <select
                            required
                            value={card.year}
                            onChange={(e) => setCard((prev) => ({ ...prev, year: e.target.value }))}
                            className={inputClass}
                          >
                            <option value="" disabled>Yıl</option>
                            {YEARS.map((y) => (
                              <option key={y} value={y}>{y}</option>
                            ))}
                          </select>
                          <input
                            required
                            placeholder="CVV"
                            inputMode="numeric"
                            maxLength={cvvMaxLength(cardBrand)}
                            autoComplete="cc-csc"
                            value={card.cvv}
                            onChange={handleCvvChange}
                            className={inputClass}
                          />
                        </div>
                      </div>
                      <div className="flex justify-center lg:justify-end">
                        <CardPreview number={card.number} name={card.name} month={card.month} year={card.year} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-outline-variant/20 bg-surface-container p-5">
                  <label className="block font-headline text-xs font-bold uppercase tracking-widest text-outline mb-3">
                    Sipariş Notu (opsiyonel)
                  </label>
                  <textarea
                    className="w-full border border-outline-variant/30 bg-background px-4 py-3 text-sm text-on-surface outline-none focus:border-primary min-h-[90px]"
                    placeholder="Teslimat, fatura veya teknik uyum ile ilgili not ekleyin…"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              </section>

              {/* Summary */}
              <aside className="border border-outline-variant/20 bg-surface-container p-6 h-fit lg:sticky lg:top-24">
                <h2 className="font-headline text-lg font-bold uppercase mb-5">Sipariş Özeti</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between text-outline">
                    <span>Ara Toplam ({itemCount} ürün)</span>
                    <span>{formatCurrencyAmount(total)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-outline">Kargo</span>
                    <span className="font-headline font-bold text-primary-fixed uppercase text-xs">Ücretsiz</span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-outline-variant/30 pt-4 mt-4">
                  <span className="uppercase text-xs text-outline tracking-widest">Toplam</span>
                  <span className="text-primary font-headline text-2xl font-bold">{formatCurrencyAmount(total)}</span>
                </div>

                {error && <p className="mt-4 border border-error/30 bg-error/10 p-3 text-sm text-error">{error}</p>}

                <button
                  type="submit"
                  className="mt-5 w-full py-3 bg-primary-container text-on-primary-container font-headline font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-primary transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Ödeme hazırlanıyor…' : 'Güvenli Ödemeye Geç'}
                </button>
                <p className="mt-3 flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest text-outline">
                  <span className="material-symbols-outlined text-sm">lock</span>
                  SSL korumalı · tüm kredi kartları · taksit
                </p>
              </aside>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

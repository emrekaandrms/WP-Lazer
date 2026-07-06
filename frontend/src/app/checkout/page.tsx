'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { useCart } from '@/lib/cart'
import { formatCurrencyAmount } from '@/lib/money'
import { getWooCheckoutUrl, getWpRestBaseUrl } from '@/lib/urls'

export default function CheckoutPage() {
  const { items, total, itemCount, updateQty, removeItem, clearCart } = useCart()
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const checkoutUrl = useMemo(() => getWooCheckoutUrl(), [])

  const submitToWooCommerce = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const invalidItem = items.find((item) => !item.productId)
      if (invalidItem) {
        throw new Error(`${invalidItem.name} için ürün bilgisi eksik. Lütfen ürünü sepetten çıkarıp tekrar ekleyin.`)
      }

      const response = await fetch(`${getWpRestBaseUrl()}/wp-lzer/v1/checkout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({ product_id: item.productId, quantity: item.qty })),
          note,
        }),
      })

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(data?.message || 'Sipariş hazırlanamadı. Lütfen tekrar deneyin.')
      }

      clearCart()
      window.location.href = data?.checkout_url || checkoutUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ödeme başlatılamadı.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-surface px-6 pb-20">
        <div className="container mx-auto">
          <h1 className="font-headline text-4xl font-bold uppercase tracking-tight mb-8">Sepetim</h1>

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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart items + note + payment */}
              <section className="lg:col-span-2 space-y-6">
                <div className="border border-outline-variant/20 bg-surface-container divide-y divide-outline-variant/15">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4">
                      <Link href={item.slug ? `/product/${item.slug}` : '#'} className="w-24 h-24 shrink-0 bg-surface-container-lowest border border-outline-variant/20 overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
                        ) : (
                          <div className="w-full h-full grid-pattern opacity-10" />
                        )}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={item.slug ? `/product/${item.slug}` : '#'} className="block font-headline text-sm font-bold uppercase leading-tight text-on-surface hover:text-primary">
                          {item.name}
                        </Link>
                        {item.sku && <span className="mt-1 block text-[10px] uppercase tracking-widest text-outline">{item.sku}</span>}
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="flex items-center border border-outline-variant/40">
                            <button className="w-8 h-8 text-outline hover:text-on-surface" onClick={() => updateQty(item.id, item.qty - 1)} aria-label="Azalt">−</button>
                            <span className="w-10 text-center text-sm">{item.qty}</span>
                            <button className="w-8 h-8 text-outline hover:text-on-surface" onClick={() => updateQty(item.id, item.qty + 1)} aria-label="Artır">+</button>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-headline text-base font-bold text-primary">{formatCurrencyAmount(item.price * item.qty)}</span>
                            <button className="material-symbols-outlined text-base text-outline hover:text-error" onClick={() => removeItem(item.id)} aria-label="Kaldır">delete</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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
                  className="mt-5 w-full py-3 bg-primary-container text-on-primary-container font-headline font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-primary transition-colors"
                  disabled={isSubmitting}
                  onClick={submitToWooCommerce}
                >
                  {isSubmitting ? 'Ödeme hazırlanıyor…' : 'Güvenli Ödemeye Geç'}
                </button>
                <p className="mt-3 flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest text-outline">
                  <span className="material-symbols-outlined text-sm">lock</span>
                  SSL korumalı · tüm kredi kartları · taksit
                </p>
              </aside>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

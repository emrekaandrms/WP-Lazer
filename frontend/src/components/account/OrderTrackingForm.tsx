'use client'

import Link from 'next/link'
import { useState } from 'react'
import { trackOrder, type OrderTrackingPayload } from '@/lib/account'

export function OrderTrackingForm() {
  const [email, setEmail] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [result, setResult] = useState<OrderTrackingPayload['order'] | null>(null)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setResult(null)
    setIsSubmitting(true)

    try {
      const response = await trackOrder({ email, order_number: orderNumber })
      setResult(response.order)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sipariş kayıtlarına ulaşılamadı.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-5rem)] grid-cols-1 lg:grid-cols-[1fr_500px] gap-8">
      <section className="border border-outline-variant/20 bg-surface-container-lowest p-8 md:p-12 flex flex-col justify-between overflow-hidden relative">
        <div className="absolute inset-0 grid-pattern opacity-[0.06]" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 border border-primary/25 bg-primary/5 px-3 py-2 text-[10px] font-headline font-bold uppercase tracking-widest text-primary">
            <span className="material-symbols-outlined text-sm">local_shipping</span>
            Sipariş durumu
          </span>
          <h1 className="mt-8 font-headline text-5xl md:text-7xl font-extrabold uppercase tracking-normal leading-[0.95]">
            Siparişini <span className="text-primary">takip et</span>
          </h1>
          <p className="mt-6 max-w-xl text-outline leading-relaxed">
            Sipariş numarası ve siparişte kullanılan e-posta adresiyle güncel durum bilgisini görüntüleyin.
          </p>
        </div>
        <div className="relative mt-12 grid grid-cols-1 sm:grid-cols-3 gap-px bg-outline-variant/25">
          {[
            ['Bilgi', 'Güvenli'],
            ['Eşleşme', 'E-posta'],
            ['Kapsam', 'Durum'],
          ].map(([label, value]) => (
            <div key={label} className="bg-surface-container p-4">
              <span className="block text-[9px] font-headline font-bold uppercase tracking-widest text-outline">{label}</span>
              <span className="mt-1 block font-headline text-lg font-extrabold text-primary">{value}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <form onSubmit={submit} className="border border-outline-variant/20 bg-surface-container p-7 h-fit">
          <h2 className="font-headline text-2xl font-extrabold uppercase tracking-normal">Sipariş Sorgula</h2>
          <div className="mt-7 space-y-5">
            <label className="block">
              <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-outline">E-posta</span>
              <input
                className="mt-2 w-full border border-outline-variant/30 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary"
                autoComplete="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-outline">Sipariş Numarası</span>
              <input
                className="mt-2 w-full border border-outline-variant/30 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary"
                inputMode="numeric"
                value={orderNumber}
                onChange={(event) => setOrderNumber(event.target.value)}
                required
              />
            </label>
          </div>
          {error && <div className="mt-5 border border-error/30 bg-error/10 p-3 text-sm text-error">{error}</div>}
          <button
            className="mt-6 w-full bg-primary-container px-5 py-4 font-headline text-sm font-extrabold uppercase tracking-widest text-on-primary-container disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sorgulanıyor...' : 'Siparişi Sorgula'}
          </button>
          <Link href="/login/" className="mt-5 block text-center text-xs uppercase tracking-widest text-outline hover:text-primary">
            Hesabımla giriş yap
          </Link>
        </form>

        {result && (
          <div className="border border-primary/30 bg-primary/5 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-primary/20 pb-5">
              <div>
                <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-primary">Sipariş</span>
                <h3 className="mt-2 font-headline text-2xl font-extrabold uppercase tracking-normal">#{result.number}</h3>
              </div>
              <span className="border border-primary/30 px-3 py-2 text-xs font-headline font-bold uppercase tracking-widest text-primary">
                {result.status}
              </span>
            </div>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-px bg-outline-variant/25">
              {[
                ['Tarih', result.date || '-'],
                ['Toplam', result.total || '-'],
                ['Ürün', `${result.item_count} kalem`],
              ].map(([label, value]) => (
                <div key={label} className="bg-surface-container p-4">
                  <span className="block text-[9px] font-headline font-bold uppercase tracking-widest text-outline">{label}</span>
                  <span className="mt-1 block text-sm text-on-surface">{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 divide-y divide-outline-variant/20">
              {result.items.map((item) => (
                <div key={`${item.name}-${item.quantity}`} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <span>{item.name}</span>
                  <span className="text-outline">x{item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

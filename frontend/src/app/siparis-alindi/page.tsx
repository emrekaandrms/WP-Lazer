'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { formatCurrencyAmount } from '@/lib/money'
import { getWpRestBaseUrl } from '@/lib/urls'

type OrderItem = {
  name: string
  sku: string
  quantity: number
  total: number
  image: string | null
}

type OrderSummary = {
  order_id: number
  status: string
  date: string
  items: OrderItem[]
  subtotal: number
  shipping_total: number
  total: number
  customer_name: string
  customer_email: string
  shipping_address: string
}

const faq = [
  {
    question: 'Siparişimi nasıl takip ederim?',
    answer: 'Sipariş numaranızla "Siparişimi Takip Et" sayfasından anlık durumu görebilirsiniz. Ayrıca kargoya verildiğinde e-posta adresinize bilgilendirme gönderilir.',
  },
  {
    question: 'Kargo ne zaman gelir?',
    answer: 'Stokta bulunan ürünler mümkün olan en kısa sürede kargoya verilir. Kargo tamamen ücretsizdir; teslim süresi kargo firmasının operasyonuna ve teslimat adresinize göre değişebilir.',
  },
  {
    question: 'İade veya değişim yapabilir miyim?',
    answer: 'Ürün tesliminden itibaren 14 gün içinde cayma hakkınızı kullanabilirsiniz. Detaylar için İptal ve İade Koşulları sayfamıza göz atın.',
  },
  {
    question: 'Faturamı nereden alırım?',
    answer: 'Sipariş faturanız e-posta adresinize gönderilir. Kurumsal fatura talebiniz varsa bizimle iletişime geçebilirsiniz.',
  },
]

export default function OrderReceivedPage() {
  const [orderId, setOrderId] = useState<string | null>(null)
  const [order, setOrder] = useState<OrderSummary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('order')
    const key = params.get('key')
    setOrderId(id)

    if (!id || !key) {
      setLoading(false)
      return
    }

    fetch(`${getWpRestBaseUrl()}/wp-lzer/v1/order-summary?order_id=${encodeURIComponent(id)}&key=${encodeURIComponent(key)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.ok) {
          setOrder(data)
        } else {
          setError('Sipariş detayları görüntülenemedi.')
        }
      })
      .catch(() => setError('Sipariş detayları görüntülenemedi.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Header />
      <main className="pt-14 min-h-screen bg-surface">
        <div className="container mx-auto px-6 py-16 max-w-3xl">
          <div className="text-center">
            <span className="material-symbols-outlined text-6xl text-primary-fixed">check_circle</span>
            <h1 className="mt-6 font-headline text-3xl font-bold uppercase tracking-tight text-on-surface">
              Siparişiniz Alındı
            </h1>
            <p className="mt-4 text-outline leading-relaxed">
              Ödemeniz başarıyla tamamlandı. Siparişiniz en kısa sürede hazırlanıp ücretsiz kargo ile gönderilecek.
              {orderId && (
                <>
                  {' '}
                  Sipariş numaranız: <span className="font-headline font-bold text-primary">#{orderId}</span>
                </>
              )}
            </p>
          </div>

          {loading && <p className="mt-10 text-center text-sm text-outline">Sipariş detayları yükleniyor…</p>}

          {order && (
            <div className="mt-12 border border-outline-variant/20 bg-surface-container">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/20 p-5">
                <div>
                  <span className="block text-[10px] font-headline uppercase tracking-widest text-outline">Sipariş No</span>
                  <span className="font-headline font-bold text-on-surface">#{order.order_id}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-headline uppercase tracking-widest text-outline">Tarih</span>
                  <span className="font-headline font-bold text-on-surface">{order.date}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-headline uppercase tracking-widest text-outline">Alıcı</span>
                  <span className="font-headline font-bold text-on-surface">{order.customer_name}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-headline uppercase tracking-widest text-outline">Teslimat</span>
                  <span className="font-headline font-bold text-on-surface">{order.shipping_address || '—'}</span>
                </div>
              </div>

              <div className="divide-y divide-outline-variant/15">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4">
                    <div className="w-16 h-16 shrink-0 bg-surface-container-lowest border border-outline-variant/20 overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
                      ) : (
                        <div className="w-full h-full grid-pattern opacity-10" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block font-headline text-sm font-bold uppercase leading-tight text-on-surface">{item.name}</span>
                      <span className="text-xs text-outline">{item.sku && `${item.sku} · `}Adet: {item.quantity}</span>
                    </div>
                    <span className="font-headline font-bold text-primary">{formatCurrencyAmount(item.total)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-outline-variant/20 p-5 space-y-2 text-sm">
                <div className="flex items-center justify-between text-outline">
                  <span>Ara Toplam</span>
                  <span>{formatCurrencyAmount(order.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-outline">Kargo</span>
                  <span className="font-headline font-bold text-primary-fixed uppercase text-xs">
                    {order.shipping_total > 0 ? formatCurrencyAmount(order.shipping_total) : 'Ücretsiz'}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-outline-variant/30 pt-3 mt-1">
                  <span className="font-headline uppercase text-xs tracking-widest text-outline">Toplam</span>
                  <span className="text-primary font-headline text-xl font-bold">{formatCurrencyAmount(order.total)}</span>
                </div>
              </div>
            </div>
          )}

          {error && !loading && (
            <p className="mt-10 text-center text-sm text-outline">
              Sipariş özetini burada görüntüleyemedik, ancak ödemeniz onaylandıysa siparişiniz alınmıştır. Sorularınız
              için bizimle iletişime geçebilirsiniz.
            </p>
          )}

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 font-headline text-sm font-black uppercase tracking-widest hover:brightness-110 transition-all"
            >
              Alışverişe Devam Et
            </Link>
            <Link
              href="/siparis-takibi"
              className="inline-flex items-center gap-2 border border-outline-variant text-on-surface px-6 py-3 font-headline text-sm font-black uppercase tracking-widest hover:bg-surface-container transition-colors"
            >
              Siparişimi Takip Et
            </Link>
          </div>

          <section className="mt-16">
            <h2 className="font-headline text-xl font-bold uppercase tracking-tight text-on-surface mb-5 text-center">
              Sık Sorulan Sorular
            </h2>
            <div className="border-t border-outline-variant/20 max-w-2xl mx-auto">
              {faq.map((item, index) => (
                <details key={index} className="group border-b border-outline-variant/20 py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-headline text-sm font-bold uppercase tracking-wide text-on-surface">
                    {item.question}
                    <span className="material-symbols-outlined text-base transition-transform group-open:rotate-180">
                      expand_more
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-outline">{item.answer}</p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}

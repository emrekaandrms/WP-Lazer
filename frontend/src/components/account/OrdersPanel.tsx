'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getCustomerOrders, type AccountOrder } from '@/lib/account'

export function OrdersPanel() {
  const [orders, setOrders] = useState<AccountOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getCustomerOrders()
      .then((payload) => setOrders(payload.orders))
      .catch((err) => setError(err instanceof Error ? err.message : 'Siparişler alınamadı.'))
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return <div className="border border-outline-variant/20 bg-surface-container p-8 text-outline">Siparişler yükleniyor...</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-primary">Sipariş Geçmişi</span>
          <h1 className="mt-2 font-headline text-4xl font-black uppercase tracking-tight">Siparişlerim</h1>
        </div>
        <Link href="/my-account/" className="text-xs font-headline font-bold uppercase tracking-widest text-outline hover:text-primary">
          Hesabıma dön
        </Link>
      </div>

      {error && (
        <div className="border border-error/30 bg-error/10 p-4 text-error">
          {error} <Link href="/login/" className="underline">Giriş yap</Link>
        </div>
      )}

      <div className="border border-outline-variant/20 bg-surface-container">
        {orders.map((order) => (
          <article key={order.id} className="border-b border-outline-variant/10 p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="block text-[9px] uppercase tracking-widest text-outline">Sipariş</span>
                <span className="font-headline text-xl font-black text-primary">#{order.number}</span>
              </div>
              <div>
                <span className="block text-[9px] uppercase tracking-widest text-outline">Durum</span>
                <span>{order.status}</span>
              </div>
              <div>
                <span className="block text-[9px] uppercase tracking-widest text-outline">Tarih</span>
                <span>{order.date || '-'}</span>
              </div>
              <div>
                <span className="block text-[9px] uppercase tracking-widest text-outline">Toplam</span>
                <span className="font-headline font-bold text-primary" dangerouslySetInnerHTML={{ __html: order.total }} />
              </div>
            </div>
            <div className="mt-5 grid gap-2">
              {order.items.map((item) => (
                <div key={`${order.id}-${item.name}`} className="flex items-center justify-between gap-4 text-sm text-outline">
                  <span>{item.name} x{item.quantity}</span>
                  <span dangerouslySetInnerHTML={{ __html: item.total }} />
                </div>
              ))}
            </div>
          </article>
        ))}
        {!error && orders.length === 0 && (
          <div className="p-12 text-center text-outline">
            Henüz sipariş bulunmuyor.
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  getCurrentCustomer,
  getCustomerOrders,
  logoutCustomer,
  type AccountOrder,
  type AccountPayload,
} from '@/lib/account'

export function AccountDashboard() {
  const [account, setAccount] = useState<AccountPayload | null>(null)
  const [orders, setOrders] = useState<AccountOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    Promise.all([getCurrentCustomer(), getCustomerOrders()])
      .then(([customer, orderPayload]) => {
        if (!active) return
        setAccount(customer)
        setOrders(orderPayload.orders)
      })
      .catch((err) => {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Oturum bulunamadı.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const logout = async () => {
    await logoutCustomer().catch(() => null)
    window.location.href = '/login/'
  }

  if (isLoading) {
    return (
      <div className="border border-outline-variant/20 bg-surface-container p-8">
        <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-primary">Hesap yükleniyor</span>
        <div className="mt-6 h-2 bg-surface-container-high overflow-hidden">
          <div className="h-full w-1/2 bg-primary" />
        </div>
      </div>
    )
  }

  if (error || !account) {
    return (
      <div className="grid min-h-[calc(100vh-5rem)] place-items-center">
        <div className="max-w-lg border border-outline-variant/20 bg-surface-container p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-primary">lock</span>
          <h1 className="mt-5 font-headline text-3xl font-black uppercase tracking-tight">Giriş yapmanız gerekiyor</h1>
          <p className="mt-4 text-sm leading-relaxed text-outline">
            Hesap panelini görüntülemek için müşteri hesabına giriş yapmalısınız.
          </p>
          <Link
            href="/login/"
            className="mt-7 inline-flex bg-primary-container px-7 py-4 font-headline text-sm font-black uppercase tracking-widest text-on-primary-container"
          >
            Giriş Yap
          </Link>
        </div>
      </div>
    )
  }

  const displayName =
    [account.user.first_name, account.user.last_name].filter(Boolean).join(' ') ||
    account.user.display_name ||
    account.user.email

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <div className="border border-outline-variant/20 bg-surface-container-lowest p-8">
          <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-primary">Müşteri hesabı</span>
          <h1 className="mt-4 font-headline text-4xl md:text-6xl font-black uppercase tracking-tight">
            {displayName}
          </h1>
          <p className="mt-5 text-outline">{account.user.email}</p>
        </div>
        <div className="grid grid-cols-2 gap-px bg-outline-variant/25">
          {[
            ['Sipariş', orders.length.toString()],
            ['Adres', account.addresses.billing.address_1 ? 'Kayıtlı' : 'Eksik'],
            ['E-posta', account.user.email ? 'Kayıtlı' : 'Eksik'],
            ['Müşteri', 'Aktif'],
          ].map(([label, value]) => (
            <div key={label} className="bg-surface-container p-5">
              <span className="block text-[9px] font-headline font-bold uppercase tracking-widest text-outline">{label}</span>
              <span className="mt-2 block font-headline text-xl font-black text-primary">{value}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        <nav className="border border-outline-variant/20 bg-surface-container p-5 h-fit">
          {[
            ['orders', 'Siparişler', '/orders/'],
            ['location_on', 'Adresler', '/addresses/'],
            ['storefront', 'Katalog', '/products/'],
          ].map(([icon, label, href]) => (
            <Link key={href} href={href} className="flex items-center gap-3 border-b border-outline-variant/10 py-4 font-headline text-xs font-bold uppercase tracking-widest text-outline hover:text-primary">
              <span className="material-symbols-outlined text-base">{icon}</span>
              {label}
            </Link>
          ))}
          <button onClick={logout} className="flex w-full items-center gap-3 py-4 font-headline text-xs font-bold uppercase tracking-widest text-secondary hover:text-on-surface">
            <span className="material-symbols-outlined text-base">logout</span>
            Çıkış Yap
          </button>
        </nav>

        <div className="border border-outline-variant/20 bg-surface-container p-6">
          <div className="flex items-center justify-between gap-4 border-b border-outline-variant/20 pb-5">
            <div>
              <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-primary">Son Siparişler</span>
              <h2 className="mt-2 font-headline text-2xl font-black uppercase tracking-tight">Sipariş Geçmişi</h2>
            </div>
            <Link href="/orders/" className="text-xs font-headline font-bold uppercase tracking-widest text-primary">
              Tümü
            </Link>
          </div>

          <div className="divide-y divide-outline-variant/10">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="grid grid-cols-2 md:grid-cols-4 gap-4 py-5 text-sm">
                <div>
                  <span className="block text-[9px] uppercase tracking-widest text-outline">Sipariş</span>
                  <span className="font-headline font-bold">#{order.number}</span>
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
            ))}
            {orders.length === 0 && (
              <div className="py-12 text-center text-outline">
                Henüz sipariş bulunmuyor.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

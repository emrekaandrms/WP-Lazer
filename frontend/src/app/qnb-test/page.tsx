'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { useCart } from '@/lib/cart'
import { getWpRestBaseUrl } from '@/lib/urls'

// Internal-only page for verifying the QNB PayFor live payment integration with the two
// hidden WooCommerce test products (id 2257 = 1 TL, id 2258 = 15 TL). Not linked from any
// nav/footer, not in the sitemap, and hidden behind an admin check (the backend already
// rejects non-admin purchase attempts during the staged live rollout — this just keeps
// the page itself from looking like a real, usable feature to anonymous visitors).
const TEST_PRODUCTS = [
  { productId: 2257, name: 'QNB Test Ürünü - 1 TL', price: 1, sku: 'QNB-TEST-1' },
  { productId: 2258, name: 'QNB Test Ürünü - 15 TL', price: 15, sku: 'QNB-TEST-15' },
]

export default function QnbTestPage() {
  const { addItem, clearCart } = useCart()
  const router = useRouter()
  const [status, setStatus] = useState<'checking' | 'admin' | 'denied'>('checking')

  useEffect(() => {
    fetch(`${getWpRestBaseUrl()}/wp-lzer/v1/customer/me`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setStatus(data?.user?.is_admin ? 'admin' : 'denied'))
      .catch(() => setStatus('denied'))
  }, [])

  const addAndCheckout = (product: (typeof TEST_PRODUCTS)[number]) => {
    clearCart()
    addItem({
      id: `qnb-test-${product.productId}`,
      productId: product.productId,
      name: product.name,
      price: product.price,
      sku: product.sku,
    })
    router.push('/checkout')
  }

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-surface px-6 pb-20">
        <div className="container mx-auto max-w-xl">
          {status === 'checking' && <p className="text-sm text-outline">Yükleniyor…</p>}

          {status === 'denied' && (
            <div className="border border-outline-variant/20 bg-surface-container p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-outline-variant/50">lock</span>
              <p className="mt-4 text-outline">Bu sayfa şu anda kullanılamıyor.</p>
            </div>
          )}

          {status === 'admin' && (
            <>
              <h1 className="font-headline text-2xl font-bold uppercase tracking-tight mb-2">QNB Ödeme Doğrulama</h1>
              <p className="text-sm text-outline mb-8">
                Sadece doğrulama amaçlı dahili test sayfası. Bir tutar seç, sepete eklenip doğrudan ödeme sayfasına
                gideceksin.
              </p>
              <div className="flex flex-col gap-4">
                {TEST_PRODUCTS.map((product) => (
                  <button
                    key={product.productId}
                    onClick={() => addAndCheckout(product)}
                    className="flex items-center justify-between border border-outline-variant/30 bg-surface-container p-5 hover:border-primary transition-colors"
                  >
                    <span className="font-headline font-bold uppercase text-sm">{product.name}</span>
                    <span className="font-headline font-bold text-primary text-lg">{product.price} TL</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

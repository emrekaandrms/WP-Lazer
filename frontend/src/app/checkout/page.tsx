'use client'

import { Header } from '@/components/Header'
import { useCart } from '@/lib/cart'

export default function CheckoutPage() {
  const { items, total } = useCart()

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-surface px-6">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 border border-outline-variant/20 bg-surface-container p-6">
            <h1 className="font-headline text-3xl font-bold uppercase mb-6">Checkout</h1>
            <div className="space-y-4">
              <input className="w-full bg-surface-container-low p-3 border border-outline-variant/30" placeholder="Company Name" />
              <input className="w-full bg-surface-container-low p-3 border border-outline-variant/30" placeholder="Tax Number" />
              <input className="w-full bg-surface-container-low p-3 border border-outline-variant/30" placeholder="Shipping Address" />
              <button className="w-full py-3 bg-primary-container text-on-primary-container font-headline font-bold uppercase">
                Place Order
              </button>
            </div>
          </section>
          <aside className="border border-outline-variant/20 bg-surface-container p-6 h-fit">
            <h2 className="font-headline text-lg font-bold uppercase mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span>{item.name} x{item.qty}</span>
                  <span>${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-outline-variant/30 pt-3">
              <span className="uppercase text-xs text-outline">Total</span>
              <span className="text-primary font-headline text-xl font-bold">${total.toFixed(2)}</span>
            </div>
          </aside>
        </div>
      </main>
    </>
  )
}

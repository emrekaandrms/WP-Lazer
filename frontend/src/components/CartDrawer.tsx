'use client'

import Link from 'next/link'
import { useCart } from '@/lib/cart'

export function CartDrawer() {
  const { isOpen, closeCart, items, removeItem, updateQty, total } = useCart()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60]">
      <button className="absolute inset-0 bg-black/60" onClick={closeCart} aria-label="Close cart" />
      <aside className="absolute inset-0 bg-[#0E0E0E] border-l border-outline-variant/30 md:inset-y-0 md:right-0 md:left-auto md:w-[460px]">
        <div className="h-full flex flex-col">
          <div className="px-6 py-4 border-b border-outline-variant/20 flex items-center justify-between">
            <h3 className="font-headline text-lg font-bold uppercase tracking-wider">Cart</h3>
            <button className="material-symbols-outlined text-outline hover:text-on-surface" onClick={closeCart}>
              close
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <p className="text-outline text-sm">Sepet bos.</p>
            ) : (
              items.map((item) => (
                <div key={item.id} className="border border-outline-variant/20 bg-surface-container p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-headline font-bold uppercase text-sm">{item.name}</h4>
                      <p className="text-primary text-sm mt-1">${item.price.toFixed(2)}</p>
                    </div>
                    <button className="text-outline hover:text-error text-xs uppercase" onClick={() => removeItem(item.id)}>
                      Remove
                    </button>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      className="w-8 h-8 border border-outline-variant/40"
                      onClick={() => updateQty(item.id, item.qty - 1)}
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.qty}</span>
                    <button
                      className="w-8 h-8 border border-outline-variant/40"
                      onClick={() => updateQty(item.id, item.qty + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-6 border-t border-outline-variant/20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-outline uppercase text-xs tracking-widest">Total</span>
              <span className="text-primary font-headline font-bold text-xl">${total.toFixed(2)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full text-center py-3 bg-primary-container text-on-primary-container font-headline font-bold uppercase tracking-widest"
            >
              Checkout
            </Link>
          </div>
        </div>
      </aside>
    </div>
  )
}

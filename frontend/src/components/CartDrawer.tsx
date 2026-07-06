'use client'

import Link from 'next/link'
import { useCart } from '@/lib/cart'
import { formatCurrencyAmount } from '@/lib/money'

export function CartDrawer() {
  const { isOpen, closeCart, items, removeItem, updateQty, total, itemCount } = useCart()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60]">
      <button className="absolute inset-0 bg-black/60" onClick={closeCart} aria-label="Sepeti kapat" />
      <aside className="absolute inset-0 bg-[#0E0E0E] border-l border-outline-variant/30 md:inset-y-0 md:right-0 md:left-auto md:w-[460px]">
        <div className="h-full flex flex-col">
          <div className="px-6 py-4 border-b border-outline-variant/20 flex items-center justify-between">
            <h3 className="font-headline text-lg font-bold uppercase tracking-wider">
              Sepet {itemCount > 0 && <span className="text-outline">({itemCount})</span>}
            </h3>
            <button className="material-symbols-outlined text-outline hover:text-on-surface" onClick={closeCart} aria-label="Kapat">
              close
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-16">
                <span className="material-symbols-outlined text-5xl text-outline-variant/50">shopping_cart</span>
                <p className="mt-4 text-outline">Sepetiniz boş.</p>
                <Link
                  href="/products"
                  onClick={closeCart}
                  className="mt-6 inline-flex items-center gap-2 border border-outline-variant/40 px-5 py-3 font-headline text-xs font-bold uppercase tracking-widest text-on-surface hover:border-primary hover:text-primary transition-colors"
                >
                  Alışverişe Başla
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex gap-3 border border-outline-variant/20 bg-surface-container p-3">
                  <Link
                    href={item.slug ? `/product/${item.slug}` : '#'}
                    onClick={closeCart}
                    className="w-20 h-20 shrink-0 bg-surface-container-lowest border border-outline-variant/20 overflow-hidden"
                  >
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
                    ) : (
                      <div className="w-full h-full grid-pattern opacity-10" />
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          href={item.slug ? `/product/${item.slug}` : '#'}
                          onClick={closeCart}
                          className="block font-headline text-xs font-bold uppercase leading-tight text-on-surface hover:text-primary line-clamp-2"
                        >
                          {item.name}
                        </Link>
                        {item.sku && <span className="mt-1 block text-[10px] uppercase tracking-widest text-outline">{item.sku}</span>}
                      </div>
                      <button
                        className="material-symbols-outlined text-base text-outline hover:text-error shrink-0"
                        onClick={() => removeItem(item.id)}
                        aria-label="Ürünü kaldır"
                      >
                        delete
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="flex items-center border border-outline-variant/40">
                        <button className="w-7 h-7 text-outline hover:text-on-surface" onClick={() => updateQty(item.id, item.qty - 1)} aria-label="Azalt">
                          −
                        </button>
                        <span className="w-8 text-center text-sm">{item.qty}</span>
                        <button className="w-7 h-7 text-outline hover:text-on-surface" onClick={() => updateQty(item.id, item.qty + 1)} aria-label="Artır">
                          +
                        </button>
                      </div>
                      <span className="font-headline text-sm font-bold text-primary">{formatCurrencyAmount(item.price * item.qty)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {items.length > 0 && (
            <div className="p-6 border-t border-outline-variant/20 space-y-3">
              <div className="flex items-center justify-between text-sm text-outline">
                <span className="uppercase text-xs tracking-widest">Ara Toplam</span>
                <span>{formatCurrencyAmount(total)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="uppercase text-xs tracking-widest text-outline">Kargo</span>
                <span className="font-headline font-bold text-primary-fixed uppercase text-xs">Ücretsiz</span>
              </div>
              <div className="flex items-center justify-between border-t border-outline-variant/20 pt-3">
                <span className="text-outline uppercase text-xs tracking-widest">Toplam</span>
                <span className="text-primary font-headline font-bold text-xl">{formatCurrencyAmount(total)}</span>
              </div>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="block w-full text-center py-3 bg-primary-container text-on-primary-container font-headline font-bold uppercase tracking-widest hover:bg-primary transition-colors"
              >
                Ödemeye Geç
              </Link>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}

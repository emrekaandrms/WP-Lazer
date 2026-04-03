'use client'

import Link from 'next/link'
import { useCart } from '@/lib/cart'
import { CartDrawer } from './CartDrawer'

const navLinks = [
  { href: '/category/bearings', label: 'Bearings' },
  { href: '/category/linear-rails', label: 'Linear Rails' },
  { href: '/category/cnc-tools', label: 'CNC Tools' },
  { href: '/category/motors', label: 'Motors' },
  { href: '/category/controllers', label: 'Controllers' },
  { href: '#', label: 'Spare Parts' },
]

export function Header() {
  const { itemCount, openCart } = useCart()

  return (
    <>
      <nav className="fixed top-0 w-full z-50 rounded-none border-b border-[#414754]/20 bg-[#131313] dark:bg-[#0E0E0E] flex justify-between items-center px-6 py-3 font-headline uppercase tracking-tighter text-sm">
        <Link href="/" className="text-xl font-bold tracking-widest text-[#ADC7FF] uppercase">
          PRECISION CNC
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.href + link.label} href={link.href} className="text-[#C8C6C5] hover:text-[#ADC7FF] transition-colors">
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/my-account" className="material-symbols-outlined text-[#C8C6C5] hover:bg-[#2A2A2A] p-2 transition-all">
            account_circle
          </Link>
          <Link href="/login" className="material-symbols-outlined text-[#C8C6C5] hover:bg-[#2A2A2A] p-2 transition-all">
            login
          </Link>
          <Link href="/signup" className="material-symbols-outlined text-[#C8C6C5] hover:bg-[#2A2A2A] p-2 transition-all">
            person_add
          </Link>
          <button className="relative material-symbols-outlined text-[#C8C6C5] hover:bg-[#2A2A2A] p-2 transition-all" onClick={openCart}>
            shopping_cart
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-[10px] text-on-primary flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
          <Link
            href="/checkout"
            className="hidden md:inline-block bg-[#4a8eff] text-[#00285b] px-4 py-2 font-bold hover:bg-[#ADC7FF] transition-all active:scale-95"
          >
            Checkout
          </Link>
        </div>
      </nav>
      <CartDrawer />
    </>
  )
}

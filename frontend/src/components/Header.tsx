'use client'

import Link from 'next/link'
import { useCart } from '@/lib/cart'
import { CartDrawer } from './CartDrawer'
import { AccountNavLink } from './account/AccountNavLink'

const navLinks = [
  { href: '/category/koruma-camlari', label: 'Koruma Camları' },
  { href: '/category/seramikler', label: 'Seramikler' },
  { href: '/category/nozullar', label: 'Nozullar' },
  { href: '/category/lensler', label: 'Lensler' },
  { href: '/category/lazer-kaynak', label: 'Lazer Kaynak' },
  { href: '/products', label: 'Tüm Ürünler' },
  { href: '/page/about', label: 'Hakkımızda' },
]

export function Header() {
  const { itemCount, openCart } = useCart()

  return (
    <>
      <nav className="fixed top-0 w-full z-50 h-14 rounded-none border-b border-[#414754]/20 bg-[#131313] dark:bg-[#0E0E0E] flex justify-between items-center px-5 md:px-6 font-headline uppercase tracking-tighter text-sm">
        <Link href="/" aria-label="Lazer Online ana sayfa" className="flex shrink-0 items-center">
          <img
            src="/brand/lazer-online-yatay-dark.png"
            alt="Lazer Online"
            width={2000}
            height={349}
            className="h-7 w-auto max-w-[150px] object-contain sm:h-8 sm:max-w-[190px]"
          />
        </Link>
        <div className="hidden xl:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.href + link.label} href={link.href} className="text-[#C8C6C5] hover:text-[#ADC7FF] transition-colors">
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <AccountNavLink />
          <button className="relative material-symbols-outlined text-[#C8C6C5] hover:bg-[#2A2A2A] p-2 transition-all" onClick={openCart}>
            shopping_cart
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-[10px] text-on-primary flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </nav>
      <CartDrawer />
    </>
  )
}

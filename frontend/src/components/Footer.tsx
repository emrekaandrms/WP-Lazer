'use client'

import Link from 'next/link'

const resources = [
  { label: 'Technical Documentation', href: '/docs' },
  { label: 'Shipping Manifests', href: '/shipping' },
  { label: 'MSDS Sheets', href: '/safety' },
  { label: 'API Access', href: '/api' },
]

const company = [
  { label: 'Global Logistics', href: '/page/logistics' },
  { label: 'Terms of Supply', href: '/policy/terms' },
  { label: 'Careers', href: '/page/careers' },
  { label: 'Investor Relations', href: '/page/investors' },
]

export function Footer() {
  return (
    <footer className="w-full rounded-none border-t border-[#414754]/20 bg-[#0E0E0E] grid grid-cols-1 md:grid-cols-4 gap-8 px-12 py-16 font-body text-xs tracking-tight">
      <div className="space-y-6">
        <div className="font-headline font-black text-[#ADC7FF] text-xl">PRECISION CNC</div>
        <p className="text-[#8B90A0] leading-relaxed">
          Global supply chain leader in industrial automation components and high-precision CNC machining parts.
        </p>
        <div className="text-[#ADC7FF] font-bold">ISO 9001:2015 CERTIFIED</div>
      </div>
      <div className="flex flex-col gap-3">
        <span className="font-bold text-white uppercase mb-2 font-headline tracking-widest">Resources</span>
        {resources.map((link) => (
          <Link key={link.label} className="text-[#8B90A0] hover:text-white transition-all" href={link.href}>
            {link.label}
          </Link>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        <span className="font-bold text-white uppercase mb-2 font-headline tracking-widest">Company</span>
        {company.map((link) => (
          <Link key={link.label} className="text-[#8B90A0] hover:text-white transition-all" href={link.href}>
            {link.label}
          </Link>
        ))}
      </div>
      <div className="space-y-6">
        <span className="font-bold text-white uppercase mb-2 font-headline tracking-widest">Connect</span>
        <div className="flex gap-4">
          <a className="w-10 h-10 bg-surface-container-high flex items-center justify-center hover:bg-primary/20 transition-all" href="#">
            <span className="material-symbols-outlined text-sm">terminal</span>
          </a>
          <a className="w-10 h-10 bg-surface-container-high flex items-center justify-center hover:bg-primary/20 transition-all" href="#">
            <span className="material-symbols-outlined text-sm">share</span>
          </a>
        </div>
        <p className="text-[#8B90A0]">© 2024 INDUSTRIAL PRECISION OPS. ALL RIGHTS RESERVED.</p>
      </div>
    </footer>
  )
}

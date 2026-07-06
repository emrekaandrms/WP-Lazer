'use client'

import Link from 'next/link'
import { useState } from 'react'
import { subscribeNewsletter } from '@/lib/newsletter'

const resources = [
  { label: 'Koruma Camları', href: '/category/koruma-camlari' },
  { label: 'Seramikler', href: '/category/seramikler' },
  { label: 'Nozullar', href: '/category/nozullar' },
  { label: 'Lazer Kaynak', href: '/category/lazer-kaynak' },
]

const company = [
  { label: 'Hakkımızda', href: '/page/about' },
  { label: 'Rehber', href: '/rehber' },
  { label: 'İletişim', href: '/page/contact' },
  { label: 'Sipariş Takibi', href: '/siparis-takibi' },
  { label: 'Satış Koşulları', href: '/policy/satis-kosullari' },
  { label: 'Mesafeli Satış Sözleşmesi', href: '/policy/mesafeli-satis-sozlesmesi' },
  { label: 'Gönderim Koşulları', href: '/policy/gonderim-kosullari' },
  { label: 'İptal ve İade Koşulları', href: '/policy/iptal-iade-kosullari' },
  { label: 'Gizlilik ve Kullanım Şartları', href: '/policy/gizlilik-ve-kullanim-sartlari' },
  { label: 'KVKK', href: '/policy/kvkk' },
]

export function Footer() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submitNewsletter = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')
    setError('')
    setIsSubmitting(true)

    try {
      const response = await subscribeNewsletter(email)
      setMessage(response.message)
      setEmail('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bülten kaydı alınamadı.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <footer className="w-full rounded-none border-t border-[#414754]/20 bg-[#0E0E0E] px-6 md:px-12 py-16 font-body text-xs tracking-tight">
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 border-b border-[#414754]/20 pb-12 mb-12">
        <div>
          <Link href="/" aria-label="Lazer Online ana sayfa" className="inline-flex">
            <img
              src="/brand/lazer-online-yatay-dark.png"
              alt="Lazer Online"
              width={2000}
              height={349}
              className="h-12 w-auto max-w-[280px] object-contain"
            />
          </Link>
          <p className="mt-5 max-w-xl text-[#8B90A0] leading-relaxed">
            Fiber lazer kesim ve kaynak makineleri için test edilmiş koruma camı, seramik, nozul, lens ve sarf
            malzemeleri.
          </p>
          <div className="mt-5 text-[#ADC7FF] font-bold uppercase tracking-widest">Doğrudan ithalatçı tedarik</div>
        </div>
        <form onSubmit={submitNewsletter} className="bg-surface-container-low border border-outline-variant/20 p-5">
          <span className="font-bold text-white uppercase font-headline tracking-widest">Bültene Katıl</span>
          <p className="mt-3 text-[#8B90A0] leading-relaxed">
            Yeni stok, hızlı dönen sarf grupları ve teknik ürün duyurularını e-posta ile alın.
          </p>
          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <input
              className="min-w-0 flex-1 border border-outline-variant/30 bg-background px-4 py-3 text-on-surface outline-none focus:border-primary"
              type="email"
              placeholder="E-posta adresiniz"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <button
              className="bg-primary-container px-5 py-3 font-headline font-black uppercase tracking-widest text-on-primary-container disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Kaydediliyor' : 'Kaydol'}
            </button>
          </div>
          {message && <p className="mt-3 text-primary">{message}</p>}
          {error && <p className="mt-3 text-error">{error}</p>}
        </form>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-6">
          <span className="font-bold text-white uppercase mb-2 font-headline tracking-widest">Güven</span>
          <p className="text-[#8B90A0] leading-relaxed">Kaliteli ürünü ulaşılabilir fiyatla sunma yaklaşımıyla çalışıyoruz.</p>
        </div>
        <div className="flex flex-col gap-3">
          <span className="font-bold text-white uppercase mb-2 font-headline tracking-widest">Kaynaklar</span>
          {resources.map((link) => (
            <Link key={link.label} className="text-[#8B90A0] hover:text-white transition-all" href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <span className="font-bold text-white uppercase mb-2 font-headline tracking-widest">Şirket</span>
          {company.map((link) => (
            <Link key={link.label} className="text-[#8B90A0] hover:text-white transition-all" href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
        <div className="space-y-5">
          <span className="font-bold text-white uppercase mb-2 font-headline tracking-widest">İletişim</span>
          <a className="flex items-center gap-3 text-[#8B90A0] hover:text-white transition-all" href="mailto:bilgi@lazeronline.com.tr">
            <span className="material-symbols-outlined text-sm">mail</span>
            bilgi@lazeronline.com.tr
          </a>
          <Link className="inline-flex items-center gap-2 text-[#ADC7FF] font-bold uppercase tracking-widest hover:text-white" href="/page/contact">
            İletişime Geç
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
          <p className="text-[#8B90A0]">© 2026 LAZER ONLINE. TÜM HAKLARI SAKLIDIR.</p>
        </div>
      </div>
    </footer>
  )
}

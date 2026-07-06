'use client'

import Link from 'next/link'
import { useState } from 'react'
import { loginCustomer } from '@/lib/account'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await loginCustomer({ email, password, remember })
      window.location.href = '/my-account/'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Giriş yapılamadı.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-5rem)] grid-cols-1 lg:grid-cols-[minmax(0,1fr)_440px] gap-8 items-start">
      <section className="border border-outline-variant/20 bg-surface-container-lowest p-8 md:p-12">
        <div>
          <span className="inline-flex items-center gap-2 border border-primary/25 bg-primary/5 px-3 py-2 text-[10px] font-headline font-bold uppercase tracking-widest text-primary">
            <span className="material-symbols-outlined text-sm">lock</span>
            Güvenli müşteri girişi
          </span>
          <h1 className="mt-8 font-headline text-5xl md:text-7xl font-black uppercase tracking-tight leading-[0.9]">
            Hesabına <span className="text-primary">giriş yap</span>
          </h1>
          <p className="mt-6 max-w-xl text-outline leading-relaxed">
            Sipariş geçmişinizi, kayıtlı adreslerinizi ve tekrar alımlarınızı Lazer Online deneyiminden ayrılmadan yönetin.
          </p>
        </div>
      </section>

      <form onSubmit={submit} className="border border-outline-variant/20 bg-surface-container p-7 h-fit">
        <h2 className="font-headline text-2xl font-black uppercase tracking-tight">Giriş Bilgileri</h2>
        <div className="mt-7 space-y-5">
          <label className="block">
            <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-outline">E-posta</span>
            <input
              className="mt-2 w-full border border-outline-variant/30 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary"
              autoComplete="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-outline">Şifre</span>
            <input
              className="mt-2 w-full border border-outline-variant/30 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary"
              autoComplete="current-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <label className="flex items-center gap-3 text-sm text-outline">
            <input checked={remember} onChange={(event) => setRemember(event.target.checked)} type="checkbox" />
            Bu cihazda oturumumu açık tut
          </label>
          {error && <div className="border border-error/30 bg-error/10 p-3 text-sm text-error">{error}</div>}
          <button
            className="w-full bg-primary-container px-5 py-4 font-headline text-sm font-black uppercase tracking-widest text-on-primary-container disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
          <div className="flex items-center justify-between gap-4 text-xs uppercase tracking-widest text-outline">
            <Link href="/signup/" className="hover:text-primary">
              Hesap oluştur
            </Link>
            <Link href="/products/" className="hover:text-primary">
              Kataloğa dön
            </Link>
          </div>
        </div>
      </form>
    </div>
  )
}

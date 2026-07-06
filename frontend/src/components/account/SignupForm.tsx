'use client'

import Link from 'next/link'
import { useState } from 'react'
import { registerCustomer } from '@/lib/account'

export function SignupForm() {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    password_confirm: '',
    terms_accepted: false,
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = (field: keyof typeof form, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (form.password !== form.password_confirm) {
      setError('Şifreler eşleşmiyor.')
      return
    }

    if (!form.terms_accepted) {
      setError('Hesap oluşturmak için satış koşulları ve KVKK onayı zorunludur.')
      return
    }

    setIsSubmitting(true)

    try {
      await registerCustomer({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        terms_accepted: form.terms_accepted,
      })
      window.location.href = '/my-account/'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hesap oluşturulamadı.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-5rem)] grid-cols-1 lg:grid-cols-[1fr_500px] gap-8">
      <section className="border border-outline-variant/20 bg-surface-container-lowest p-8 md:p-12 flex flex-col justify-between overflow-hidden relative">
        <div className="absolute inset-0 grid-pattern opacity-[0.06]" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 border border-primary/25 bg-primary/5 px-3 py-2 text-[10px] font-headline font-bold uppercase tracking-widest text-primary">
            <span className="material-symbols-outlined text-sm">person_add</span>
            Yeni müşteri hesabı
          </span>
          <h1 className="mt-8 font-headline text-5xl md:text-7xl font-extrabold uppercase tracking-normal leading-[0.95]">
            Hızlı sipariş için <span className="text-primary">hesap oluştur</span>
          </h1>
          <p className="mt-6 max-w-xl text-outline leading-relaxed">
            Lazer Online hesabınızla adres bilgilerinizi saklayın, sipariş geçmişinizi görüntüleyin ve tekrar alımları
            daha kısa sürede tamamlayın.
          </p>
        </div>
        <div className="relative mt-12 grid grid-cols-1 sm:grid-cols-3 gap-px bg-outline-variant/25">
          {[
            ['Adres', 'Kayıtlı'],
            ['Sipariş', 'Takipte'],
            ['Destek', 'Hızlı'],
          ].map(([label, value]) => (
            <div key={label} className="bg-surface-container p-4">
              <span className="block text-[9px] font-headline font-bold uppercase tracking-widest text-outline">{label}</span>
              <span className="mt-1 block font-headline text-lg font-extrabold text-primary">{value}</span>
            </div>
          ))}
        </div>
      </section>

      <form onSubmit={submit} className="border border-outline-variant/20 bg-surface-container p-7 h-fit">
        <h2 className="font-headline text-2xl font-extrabold uppercase tracking-normal">Hesap Oluştur</h2>
        <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <label className="block">
            <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-outline">Ad</span>
            <input
              className="mt-2 w-full border border-outline-variant/30 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary"
              value={form.first_name}
              onChange={(event) => updateField('first_name', event.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-outline">Soyad</span>
            <input
              className="mt-2 w-full border border-outline-variant/30 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary"
              value={form.last_name}
              onChange={(event) => updateField('last_name', event.target.value)}
              required
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-outline">E-posta</span>
            <input
              className="mt-2 w-full border border-outline-variant/30 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary"
              autoComplete="email"
              type="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              required
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-outline">Telefon</span>
            <input
              className="mt-2 w-full border border-outline-variant/30 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary"
              autoComplete="tel"
              value={form.phone}
              onChange={(event) => updateField('phone', event.target.value)}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-outline">Şifre</span>
            <input
              className="mt-2 w-full border border-outline-variant/30 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary"
              autoComplete="new-password"
              type="password"
              minLength={8}
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
              required
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-outline">Şifre Tekrar</span>
            <input
              className="mt-2 w-full border border-outline-variant/30 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary"
              autoComplete="new-password"
              type="password"
              minLength={8}
              value={form.password_confirm}
              onChange={(event) => updateField('password_confirm', event.target.value)}
              required
            />
          </label>
          <label className="flex items-start gap-3 sm:col-span-2 text-sm leading-relaxed text-outline">
            <input
              className="mt-1"
              checked={form.terms_accepted}
              onChange={(event) => updateField('terms_accepted', event.target.checked)}
              type="checkbox"
              required
            />
            <span>
              <a className="text-primary hover:text-on-surface" href="/policy/satis-kosullari/" target="_blank">
                Satış koşulları
              </a>
              ,{' '}
              <a className="text-primary hover:text-on-surface" href="/policy/gizlilik-ve-kullanim-sartlari/" target="_blank">
                gizlilik ve kullanım şartları
              </a>{' '}
              ve{' '}
              <a className="text-primary hover:text-on-surface" href="/policy/kvkk/" target="_blank">
                KVKK metnini
              </a>{' '}
              okudum, kabul ediyorum.
            </span>
          </label>
        </div>
        {error && <div className="mt-5 border border-error/30 bg-error/10 p-3 text-sm text-error">{error}</div>}
        <button
          className="mt-6 w-full bg-primary-container px-5 py-4 font-headline text-sm font-extrabold uppercase tracking-widest text-on-primary-container disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Hesap oluşturuluyor...' : 'Hesap Oluştur'}
        </button>
        <Link href="/login/" className="mt-5 block text-center text-xs uppercase tracking-widest text-outline hover:text-primary">
          Zaten hesabım var
        </Link>
      </form>
    </div>
  )
}

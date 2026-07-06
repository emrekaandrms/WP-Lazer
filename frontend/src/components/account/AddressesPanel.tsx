'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  getCustomerAddresses,
  updateCustomerAddresses,
  type AccountAddress,
  type AccountPayload,
} from '@/lib/account'

const fields: Array<[keyof AccountAddress, string]> = [
  ['first_name', 'Ad'],
  ['last_name', 'Soyad'],
  ['company', 'Firma'],
  ['address_1', 'Adres'],
  ['address_2', 'Adres 2'],
  ['city', 'İlçe / Şehir'],
  ['state', 'İl'],
  ['postcode', 'Posta Kodu'],
  ['country', 'Ülke'],
  ['phone', 'Telefon'],
]

const emptyAddress: AccountAddress = {
  first_name: '',
  last_name: '',
  company: '',
  address_1: '',
  address_2: '',
  city: '',
  state: '',
  postcode: '',
  country: 'TR',
  phone: '',
}

export function AddressesPanel() {
  const [addresses, setAddresses] = useState<AccountPayload['addresses']>({
    billing: emptyAddress,
    shipping: emptyAddress,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    getCustomerAddresses()
      .then((payload) => setAddresses(payload.addresses))
      .catch((err) => setError(err instanceof Error ? err.message : 'Adresler alınamadı.'))
      .finally(() => setIsLoading(false))
  }, [])

  const updateField = (type: 'billing' | 'shipping', field: keyof AccountAddress, value: string) => {
    setAddresses((current) => ({
      ...current,
      [type]: {
        ...current[type],
        [field]: value,
      },
    }))
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    setMessage('')
    setError('')

    try {
      const payload = await updateCustomerAddresses(addresses)
      setAddresses(payload.addresses)
      setMessage('Adresler güncellendi.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Adres güncellenemedi.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="border border-outline-variant/20 bg-surface-container p-8 text-outline">Adresler yükleniyor...</div>
  }

  if (error && !addresses.billing) {
    return (
      <div className="border border-outline-variant/20 bg-surface-container p-8">
        <p className="text-error">{error}</p>
        <Link href="/login/" className="mt-5 inline-block text-primary">Giriş yap</Link>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-primary">Adres Defteri</span>
          <h1 className="mt-2 font-headline text-4xl font-black uppercase tracking-tight">Adreslerim</h1>
        </div>
        <Link href="/my-account/" className="text-xs font-headline font-bold uppercase tracking-widest text-outline hover:text-primary">
          Hesabıma dön
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(['billing', 'shipping'] as const).map((type) => (
          <section key={type} className="border border-outline-variant/20 bg-surface-container p-6">
            <h2 className="font-headline text-2xl font-black uppercase tracking-tight">
              {type === 'billing' ? 'Fatura Adresi' : 'Teslimat Adresi'}
            </h2>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.map(([field, label]) => (
                <label key={`${type}-${field}`} className={field === 'address_1' || field === 'address_2' ? 'sm:col-span-2' : ''}>
                  <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-outline">{label}</span>
                  <input
                    className="mt-2 w-full border border-outline-variant/30 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary"
                    value={addresses[type]?.[field] || ''}
                    onChange={(event) => updateField(type, field, event.target.value)}
                  />
                </label>
              ))}
            </div>
          </section>
        ))}
      </div>

      {message && <div className="border border-primary/30 bg-primary/10 p-3 text-sm text-primary">{message}</div>}
      {error && <div className="border border-error/30 bg-error/10 p-3 text-sm text-error">{error}</div>}
      <button
        className="bg-primary-container px-7 py-4 font-headline text-sm font-black uppercase tracking-widest text-on-primary-container disabled:opacity-50"
        disabled={isSaving}
      >
        {isSaving ? 'Kaydediliyor...' : 'Adresleri Kaydet'}
      </button>
    </form>
  )
}

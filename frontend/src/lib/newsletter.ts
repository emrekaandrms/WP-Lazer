'use client'

import { getWpRestBaseUrl } from './urls'

export async function subscribeNewsletter(email: string) {
  const response = await fetch(`${getWpRestBaseUrl()}/wp-lzer/v1/newsletter/subscribe`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, source: 'footer' }),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || 'Bülten kaydı alınamadı.')
  }

  return data as { ok: boolean; message: string }
}

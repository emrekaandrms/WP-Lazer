'use client'

import { useEffect, useState } from 'react'
import { getWpRestBaseUrl } from '@/lib/urls'

type Review = { id: number; author: string; rating: number; content: string; date: string }

function Stars({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          aria-label={`${n} yıldız`}
          className={`material-symbols-outlined text-lg ${onChange ? 'cursor-pointer' : 'cursor-default'} ${
            n <= value ? 'text-primary' : 'text-outline-variant/40'
          }`}
          style={{ fontVariationSettings: n <= value ? "'FILL' 1" : "'FILL' 0" }}
        >
          star
        </button>
      ))}
    </div>
  )
}

export function ProductReviews({ productId, productName }: { productId?: number; productName: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [average, setAverage] = useState(0)
  const [count, setCount] = useState(0)
  const [loaded, setLoaded] = useState(false)

  const [rating, setRating] = useState(0)
  const [author, setAuthor] = useState('')
  const [email, setEmail] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!productId) {
      setLoaded(true)
      return
    }
    fetch(`${getWpRestBaseUrl()}/wp-lzer/v1/reviews?product_id=${productId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.ok) {
          setReviews(data.reviews || [])
          setAverage(data.average || 0)
          setCount(data.count || 0)
        }
      })
      .catch(() => null)
      .finally(() => setLoaded(true))
  }, [productId])

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setMessage('')
    if (rating < 1) {
      setError('Lütfen bir puan seçin.')
      return
    }
    setSubmitting(true)
    try {
      const response = await fetch(`${getWpRestBaseUrl()}/wp-lzer/v1/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, author, email, rating, content }),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(data?.message || 'Yorum gönderilemedi.')
      setMessage(data?.message || 'Yorumunuz alındı, onaylandıktan sonra yayınlanacaktır.')
      setRating(0)
      setAuthor('')
      setEmail('')
      setContent('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Yorum gönderilemedi.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mt-20 border-t border-outline-variant/20 pt-12">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <h2 className="font-headline text-2xl font-bold uppercase tracking-tight text-on-surface">
          Değerlendirmeler
        </h2>
        {count > 0 && (
          <div className="flex items-center gap-3">
            <Stars value={Math.round(average)} />
            <span className="text-sm text-outline">
              {average.toFixed(1)} / 5 · {count} değerlendirme
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Existing reviews */}
        <div className="space-y-5">
          {!loaded && <p className="text-sm text-outline">Yükleniyor…</p>}
          {loaded && reviews.length === 0 && (
            <p className="text-sm text-outline">
              Bu ürün için henüz değerlendirme yok. İlk değerlendirmeyi sen bırak.
            </p>
          )}
          {reviews.map((review) => (
            <div key={review.id} className="border border-outline-variant/20 bg-surface-container p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="font-headline text-sm font-bold uppercase tracking-wide text-on-surface">
                  {review.author}
                </span>
                <Stars value={review.rating} />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-outline">{review.content}</p>
              <span className="mt-2 block text-[10px] uppercase tracking-widest text-outline-variant">{review.date}</span>
            </div>
          ))}
        </div>

        {/* Review form */}
        <div className="border border-outline-variant/20 bg-surface-container p-6 h-fit">
          <h3 className="font-headline text-lg font-bold uppercase tracking-tight text-on-surface mb-4">
            Değerlendirme Yaz
          </h3>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-headline uppercase tracking-widest text-outline mb-2">Puanın</label>
              <Stars value={rating} onChange={setRating} />
            </div>
            <input
              className="w-full border border-outline-variant/30 bg-background px-4 py-3 text-sm text-on-surface outline-none focus:border-primary"
              placeholder="Adınız"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
            />
            <input
              type="email"
              className="w-full border border-outline-variant/30 bg-background px-4 py-3 text-sm text-on-surface outline-none focus:border-primary"
              placeholder="E-posta (yayınlanmaz)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <textarea
              className="w-full border border-outline-variant/30 bg-background px-4 py-3 text-sm text-on-surface outline-none focus:border-primary min-h-[110px]"
              placeholder={`${productName} hakkında deneyiminiz…`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
            {message && <p className="border border-primary/30 bg-primary/10 p-3 text-sm text-primary">{message}</p>}
            {error && <p className="border border-error/30 bg-error/10 p-3 text-sm text-error">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-primary-container text-on-primary-container font-headline text-sm font-black uppercase tracking-widest hover:bg-primary transition-colors disabled:opacity-50"
            >
              {submitting ? 'Gönderiliyor…' : 'Değerlendirmeyi Gönder'}
            </button>
            <p className="text-[11px] leading-relaxed text-outline-variant">
              Değerlendirmeniz onaylandıktan sonra yayınlanır. E-posta adresiniz gizli kalır.
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}

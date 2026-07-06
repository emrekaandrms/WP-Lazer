import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { JsonLd } from '@/components/JsonLd'
import { getGuide, getGuides, CATEGORY_NAMES } from '@/lib/guides'
import { absoluteUrl, canonicalPath } from '@/lib/site'
import { breadcrumbLd, faqLd, SITE_NAME } from '@/lib/seo'

interface GuidePageProps {
  params: Promise<{ slug: string }>
}

export const dynamicParams = false

export async function generateStaticParams() {
  return getGuides().map((guide) => ({ slug: guide.slug }))
}

export async function generateMetadata({ params }: GuidePageProps) {
  const { slug } = await params
  const guide = getGuide(slug)
  if (!guide) return { title: 'Rehber' }
  const canonical = canonicalPath(`/rehber/${slug}`)
  return {
    title: { absolute: `${guide.metaTitle} | ${SITE_NAME}` },
    description: guide.metaDescription,
    keywords: guide.keywords,
    alternates: { canonical },
    openGraph: {
      title: guide.metaTitle,
      description: guide.metaDescription,
      url: canonical,
      type: 'article',
    },
  }
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params
  const guide = getGuide(slug)
  if (!guide) notFound()

  const guideUrl = absoluteUrl(`/rehber/${guide.slug}`)
  const allGuides = getGuides()
  const relatedGuides = (guide.relatedGuides || [])
    .map((s) => allGuides.find((g) => g.slug === s))
    .filter((g): g is NonNullable<typeof g> => Boolean(g))

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: guide.title,
      description: guide.metaDescription,
      datePublished: guide.updated,
      dateModified: guide.updated,
      inLanguage: 'tr-TR',
      image: absoluteUrl('/brand/lazer-online-kare.png'),
      author: { '@type': 'Organization', name: SITE_NAME },
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        logo: { '@type': 'ImageObject', url: absoluteUrl('/brand/lazer-online-kare.png') },
      },
      mainEntityOfPage: guideUrl,
    },
    breadcrumbLd([
      { name: 'Ana Sayfa', url: absoluteUrl('/') },
      { name: 'Rehber', url: absoluteUrl('/rehber') },
      { name: guide.title, url: guideUrl },
    ]),
    faqLd(guide.faq),
  ]

  return (
    <>
      <Header />
      <JsonLd data={jsonLd} />
      <main className="pt-14 min-h-screen bg-surface">
        <article className="container mx-auto px-6 md:px-12 py-12 max-w-3xl">
          <div className="flex items-center gap-2 text-[10px] font-headline uppercase tracking-widest text-[#8B90A0] mb-8">
            <Link href="/">Ana Sayfa</Link>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <Link href="/rehber">Rehber</Link>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <span className="text-primary">{guide.title}</span>
          </div>

          <h1 className="font-headline text-3xl md:text-4xl font-bold uppercase tracking-tight text-on-surface">
            {guide.title}
          </h1>
          <p className="mt-6 text-base md:text-lg leading-relaxed text-outline">{guide.intro}</p>

          {guide.sections.map((section, index) => (
            <section key={index} className="mt-10">
              <h2 className="font-headline text-xl md:text-2xl font-bold uppercase tracking-tight text-on-surface mb-4">
                {section.heading}
              </h2>
              {section.body.map((paragraph, pIndex) => (
                <p key={pIndex} className="mb-4 text-sm md:text-base leading-relaxed text-outline">
                  {paragraph}
                </p>
              ))}
              {section.list && (
                <ul className="mt-2 space-y-2">
                  {section.list.map((item, lIndex) => (
                    <li key={lIndex} className="flex gap-3 text-sm md:text-base leading-relaxed text-outline">
                      <span className="material-symbols-outlined text-primary text-base mt-0.5">check_circle</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          {guide.faq.length > 0 && (
            <section className="mt-14">
              <h2 className="font-headline text-2xl font-bold uppercase tracking-tight text-on-surface mb-5">
                Sık Sorulan Sorular
              </h2>
              <div className="border-t border-[#414754]/20">
                {guide.faq.map((item, index) => (
                  <details key={index} className="group border-b border-[#414754]/20 py-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-headline text-sm font-bold uppercase tracking-wide text-on-surface">
                      {item.question}
                      <span className="material-symbols-outlined text-base transition-transform group-open:rotate-180">
                        expand_more
                      </span>
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-outline">{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {(guide.relatedCategories?.length || relatedGuides.length) > 0 && (
            <section className="mt-14 border-t border-outline-variant/20 pt-8 space-y-6">
              {guide.relatedCategories && guide.relatedCategories.length > 0 && (
                <div>
                  <h2 className="font-headline text-sm font-bold uppercase tracking-widest text-primary mb-3">
                    İlgili Ürünler
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {guide.relatedCategories.map((catSlug) => (
                      <Link
                        key={catSlug}
                        href={`/category/${catSlug}`}
                        className="inline-flex items-center gap-2 border border-outline-variant/40 px-4 py-2 font-headline text-xs font-bold uppercase tracking-widest text-on-surface hover:border-primary hover:text-primary transition-colors"
                      >
                        {CATEGORY_NAMES[catSlug] || catSlug}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {relatedGuides.length > 0 && (
                <div>
                  <h2 className="font-headline text-sm font-bold uppercase tracking-widest text-primary mb-3">
                    İlgili Rehberler
                  </h2>
                  <div className="flex flex-col gap-2">
                    {relatedGuides.map((related) => (
                      <Link
                        key={related.slug}
                        href={`/rehber/${related.slug}`}
                        className="inline-flex items-center gap-2 text-sm text-outline hover:text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-base text-primary">arrow_forward</span>
                        {related.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}
        </article>
      </main>
      <Footer />
    </>
  )
}

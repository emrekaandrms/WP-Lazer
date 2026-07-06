import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { JsonLd } from '@/components/JsonLd'
import { getGuides, CATEGORY_NAMES } from '@/lib/guides'
import { absoluteUrl } from '@/lib/site'
import { breadcrumbLd, SITE_NAME } from '@/lib/seo'

const pageTitle = 'Fiber Lazer Sarf Rehberleri – Koruma Camı, Nozul, Seramik, Lens'
const pageDescription =
  'Fiber lazer kesim ve kaynak sarf malzemeleri için bilgilendirici rehberler: koruma camı, nozul, seramik, lens seçimi, bakımı ve sorun giderme.'

export const metadata = {
  title: { absolute: `${pageTitle} | ${SITE_NAME}` },
  description: pageDescription,
  keywords: ['fiber lazer rehber', 'lazer kesim sarf rehberi', 'koruma camı rehberi', 'nozul seçimi', 'seramik rehberi'],
  alternates: { canonical: '/rehber/' },
  openGraph: { title: pageTitle, description: pageDescription, url: '/rehber/' },
}

export default function GuidesIndexPage() {
  const guides = getGuides()
  const jsonLd = [
    breadcrumbLd([
      { name: 'Ana Sayfa', url: absoluteUrl('/') },
      { name: 'Rehber', url: absoluteUrl('/rehber') },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: guides.map((guide, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: absoluteUrl(`/rehber/${guide.slug}`),
        name: guide.title,
      })),
    },
  ]

  return (
    <>
      <Header />
      <JsonLd data={jsonLd} />
      <main className="pt-14 min-h-screen bg-surface">
        <div className="container mx-auto px-6 md:px-12 py-12">
          <div className="max-w-3xl mb-10">
            <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-primary">Rehber</span>
            <h1 className="mt-2 font-headline text-4xl font-bold uppercase tracking-tight text-on-surface">
              Fiber Lazer Sarf Rehberleri
            </h1>
            <p className="mt-4 text-base leading-relaxed text-outline">
              Koruma camı, nozul, seramik ve lens gibi fiber lazer sarf malzemelerinin seçimi, bakımı ve sık karşılaşılan
              sorunlar için pratik, sektör pratiğine dayalı rehberler.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-outline-variant/25">
            {guides.map((guide) => (
              <Link
                key={guide.slug}
                href={`/rehber/${guide.slug}`}
                className="group bg-surface-container p-6 flex flex-col hover:bg-surface-container-high transition-colors min-h-[200px]"
              >
                <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-outline">
                  {CATEGORY_NAMES[guide.category] || 'Rehber'}
                </span>
                <h2 className="mt-3 font-headline text-lg font-bold uppercase leading-tight text-on-surface group-hover:text-primary transition-colors">
                  {guide.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-outline line-clamp-3">{guide.intro}</p>
                <span className="mt-auto pt-4 inline-flex items-center gap-2 font-headline text-xs font-bold uppercase tracking-widest text-primary">
                  Oku
                  <span className="material-symbols-outlined text-base transition-transform group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

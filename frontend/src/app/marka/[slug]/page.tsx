import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { AddToCartButton } from '@/components/AddToCartButton'
import { JsonLd } from '@/components/JsonLd'
import { formatProductPrice, getProducts, parsePrice } from '@/lib/static-data'
import { getBrand, getBrands, productMatchesBrand } from '@/lib/brands'
import { getGuides, CATEGORY_NAMES } from '@/lib/guides'
import { absoluteUrl, canonicalPath } from '@/lib/site'
import { breadcrumbLd, itemListLd, SITE_NAME } from '@/lib/seo'

interface BrandPageProps {
  params: Promise<{ slug: string }>
}

export const dynamicParams = false

export async function generateStaticParams() {
  return getBrands().map((brand) => ({ slug: brand.slug }))
}

export async function generateMetadata({ params }: BrandPageProps) {
  const { slug } = await params
  const brand = getBrand(slug)
  if (!brand) return { title: 'Marka' }
  const canonical = canonicalPath(`/marka/${slug}`)
  return {
    title: { absolute: `${brand.metaTitle} | ${SITE_NAME}` },
    description: brand.metaDescription,
    keywords: brand.keywords,
    alternates: { canonical },
    openGraph: { title: brand.metaTitle, description: brand.metaDescription, url: canonical },
  }
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { slug } = await params
  const brand = getBrand(slug)
  if (!brand) notFound()

  const products = (await getProducts()).filter(
    (product) => product.status !== 'draft' && productMatchesBrand(product, brand)
  )

  const categorySlugs = Array.from(
    new Set(products.flatMap((product) => (product.categories?.nodes || []).map((c) => c.slug)))
  )
  const brandGuides = getGuides()
    .filter((guide) => categorySlugs.includes(guide.category) || guide.slug === 'precitec-raytools-bystronic-uyumlu-sarf-rehberi')
    .slice(0, 4)

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: brand.metaTitle,
      description: brand.metaDescription,
      url: absoluteUrl(`/marka/${brand.slug}`),
      inLanguage: 'tr-TR',
    },
    breadcrumbLd([
      { name: 'Ana Sayfa', url: absoluteUrl('/') },
      { name: 'Markalar', url: absoluteUrl('/products') },
      { name: brand.name, url: absoluteUrl(`/marka/${brand.slug}`) },
    ]),
    itemListLd(products),
  ]

  return (
    <>
      <Header />
      <JsonLd data={jsonLd} />
      <main className="pt-14 min-h-screen bg-surface">
        <div className="container mx-auto px-6 md:px-12 py-12">
          <div className="flex items-center gap-2 text-[10px] font-headline uppercase tracking-widest text-[#8B90A0] mb-8">
            <Link href="/">Ana Sayfa</Link>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <Link href="/products">Ürünler</Link>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <span className="text-primary">{brand.name}</span>
          </div>

          <div className="max-w-3xl mb-10">
            <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-primary">Marka Uyumu</span>
            <h1 className="mt-2 font-headline text-3xl md:text-4xl font-bold uppercase tracking-tight text-on-surface">
              {brand.name} Uyumlu Sarf Malzemeleri
            </h1>
            {brand.intro.map((paragraph, index) => (
              <p key={index} className="mt-4 text-sm md:text-base leading-relaxed text-outline">
                {paragraph}
              </p>
            ))}
            <p className="mt-4 text-xs font-headline uppercase tracking-widest text-outline">
              {products.length} {brand.name} uyumlu ürün
            </p>
            <p className="mt-3 text-[11px] leading-relaxed text-outline-variant">
              Marka adları yalnızca ürün uyumluluğunu belirtmek için kullanılmıştır. Lazer Online, {brand.name} markasının
              yetkili satıcısı veya temsilcisi değildir.
            </p>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <article key={product.id} className="bg-surface-container border border-outline-variant/20">
                  <Link href={`/product/${product.slug}`} className="block aspect-square bg-surface-container-lowest overflow-hidden">
                    {product.image?.sourceUrl ? (
                      <img src={product.image.sourceUrl} alt={product.image.altText || product.name} className="h-full w-full object-contain p-4" />
                    ) : (
                      <div className="h-full w-full grid-pattern opacity-10" />
                    )}
                  </Link>
                  <div className="p-5 space-y-3">
                    <div>
                      <span className="text-[10px] text-outline uppercase tracking-widest">{product.sku || 'SKU'}</span>
                      <Link href={`/product/${product.slug}`} className="block font-headline font-bold uppercase hover:text-primary">
                        {product.name}
                      </Link>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-headline text-primary font-bold">{formatProductPrice(product)}</span>
                      <AddToCartButton
                        id={product.id}
                        productId={product.databaseId}
                        name={product.name}
                        price={parsePrice(product.price)}
                        sku={product.sku}
                        slug={product.slug}
                        image={product.image?.sourceUrl}
                        className="bg-primary-container text-on-primary-container px-3 py-2 text-[10px] font-headline font-black uppercase"
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="border border-outline-variant/20 bg-surface-container p-8 text-outline">
              Bu marka için şu an yayınlanmış ürün bulunmuyor.
            </div>
          )}

          {(categorySlugs.length > 0 || brandGuides.length > 0) && (
            <section className="mt-14 border-t border-outline-variant/20 pt-8 space-y-6">
              {categorySlugs.length > 0 && (
                <div>
                  <h2 className="font-headline text-sm font-bold uppercase tracking-widest text-primary mb-3">Kategoriler</h2>
                  <div className="flex flex-wrap gap-3">
                    {categorySlugs.map((catSlug) => (
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
              {brandGuides.length > 0 && (
                <div>
                  <h2 className="font-headline text-sm font-bold uppercase tracking-widest text-primary mb-3">İlgili Rehberler</h2>
                  <div className="flex flex-col gap-2">
                    {brandGuides.map((guide) => (
                      <Link
                        key={guide.slug}
                        href={`/rehber/${guide.slug}`}
                        className="inline-flex items-center gap-2 text-sm text-outline hover:text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-base text-primary">arrow_forward</span>
                        {guide.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

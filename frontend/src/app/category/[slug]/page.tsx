import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { AddToCartButton } from '@/components/AddToCartButton'
import { formatProductPrice, getCategories, getCategory, parsePrice } from '@/lib/static-data'
import { absoluteUrl, canonicalPath, stripHtml } from '@/lib/site'
import { JsonLd } from '@/components/JsonLd'
import { breadcrumbLd, categoryMetaTitle, faqLd, itemListLd } from '@/lib/seo'
import { getCategorySeo } from '@/lib/category-seo'
import { getGuides } from '@/lib/guides'

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

export const dynamicParams = false

export async function generateStaticParams() {
  const categories = await getCategories()
  return categories.map((category) => ({ slug: category.slug }))
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params
  const category = await getCategory(slug)
  const seo = getCategorySeo(slug)
  const title = seo?.metaTitle || (category ? categoryMetaTitle(category) : 'Kategori')
  const description = seo?.metaDescription || stripHtml(category?.description) || 'Lazer Online sarf malzemeleri.'
  const canonical = canonicalPath(`/category/${slug}`)

  return {
    title: { absolute: title },
    description,
    keywords: seo?.keywords,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      images: category?.image?.sourceUrl ? [{ url: category.image.sourceUrl, alt: category.image.altText || title }] : undefined,
    },
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const category = await getCategory(slug)
  const products = category?.products?.nodes || []
  const categoryName = category?.name || slug.replace('-', ' ')
  const seo = getCategorySeo(slug)
  const categoryGuides = getGuides()
    .filter((guide) => guide.category === slug || (guide.relatedCategories || []).includes(slug))
    .slice(0, 6)
  const jsonLd = [
    breadcrumbLd([
      { name: 'Ana Sayfa', url: absoluteUrl('/') },
      { name: 'Kategoriler', url: absoluteUrl('/categories') },
      { name: categoryName, url: absoluteUrl(`/category/${slug}`) },
    ]),
    itemListLd(products),
    ...(seo ? [faqLd(seo.faq)] : []),
  ]

  return (
    <>
      <Header />
      <JsonLd data={jsonLd} />
      <div className="flex flex-1 pt-16">
        {/* Sidebar Filters */}
        <aside className="hidden md:flex flex-col h-screen sticky top-16 bg-[#131313] h-full w-64 rounded-none border-r border-[#414754]/20 font-headline text-xs font-bold uppercase">
          <div className="p-6 border-b border-[#414754]/20">
            <h2 className="text-[#ADC7FF] font-bold tracking-widest">TEKNİK FİLTRELER</h2>
            <p className="text-[10px] text-[#8B90A0] mt-1">ÖZELLİK EŞLEŞTİRME</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {['Ölçüler', 'Uyumluluk', 'Malzeme', 'Marka', 'Teslim Süresi'].map((filter, i) => (
              <div key={i} className="flex items-center gap-3 px-6 py-4 text-[#C8C6C5] hover:bg-[#201F1F] transition-transform duration-200 cursor-pointer">
                <span className="material-symbols-outlined text-sm">{i === 0 ? 'straighten' : i === 1 ? 'settings_input_component' : i === 2 ? 'architecture' : i === 3 ? 'factory' : 'schedule'}</span>
                <span>{filter}</span>
              </div>
            ))}
          </div>
          <div className="p-6">
            <button className="w-full py-3 bg-[#4a8eff] text-[#00285b] font-bold uppercase tracking-widest hover:brightness-110 transition-all">Filtreleri Uygula</button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-surface min-h-screen relative overflow-hidden">
          <div className="absolute inset-0 grid-pattern pointer-events-none opacity-5"></div>

          {/* Breadcrumbs & Sort */}
          <div className="px-8 py-6 border-b border-[#414754]/10 bg-surface flex flex-col gap-4 relative z-10">
            <div className="flex items-center gap-2 text-[10px] font-headline uppercase tracking-widest text-[#8B90A0]">
              <Link href="/">Ana Sayfa</Link>
              <span className="material-symbols-outlined text-[12px]">chevron_right</span>
              <Link href="/categories">Mekanik Parçalar</Link>
              <span className="material-symbols-outlined text-[12px]">chevron_right</span>
              <span className="text-primary capitalize">{categoryName}</span>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <h1 className="font-headline text-3xl font-bold tracking-tighter uppercase text-on-surface capitalize">{categoryName}</h1>
                <p className="text-xs font-body text-outline mt-1 uppercase tracking-tight">
                  {products.length} ürün bulundu
                </p>
              </div>
              <div className="flex items-center gap-4 bg-surface-container-low p-1 border border-[#414754]/20">
                <div className="flex border-r border-[#414754]/20 pr-4 pl-2 items-center gap-2">
                  <span className="text-[10px] font-headline text-outline uppercase font-bold">Sırala</span>
                  <select className="bg-transparent text-xs font-headline text-primary border-none focus:ring-0 uppercase cursor-pointer">
                    <option>Popülerlik</option>
                    <option>Fiyat: Düşük-Yüksek</option>
                    <option>Yeni Ürünler</option>
                  </select>
                </div>
                <div className="flex items-center gap-1 px-2">
                  <button className="p-1.5 bg-surface-container-high text-primary"><span className="material-symbols-outlined text-sm">grid_view</span></button>
                  <button className="p-1.5 text-outline hover:text-on-surface transition-colors"><span className="material-symbols-outlined text-sm">view_list</span></button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
            {products.map((product) => (
              <div key={product.id} className="group relative bg-surface-container border border-transparent hover:border-primary/30 transition-all duration-300">
                <Link
                  href={`/product/${product.slug}`}
                  className="block aspect-square bg-surface-container-lowest relative overflow-hidden"
                >
                  {product.image?.sourceUrl ? (
                    <img
                      src={product.image.sourceUrl}
                      alt={product.image.altText || product.name}
                      className="h-full w-full object-contain p-4"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-surface-container-high/20"></div>
                  )}
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-surface-container-highest text-[9px] font-headline text-outline uppercase border border-[#414754]/30">
                    {product.sku || 'SKU YOK'}
                  </div>
                </Link>
                <div className="p-5 flex flex-col gap-1">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-headline font-bold text-outline uppercase tracking-widest">
                      {categoryName}
                    </span>
                    <span className="text-[10px] font-headline font-bold text-primary-fixed bg-on-primary-fixed-variant px-1.5">
                      {product.stockStatus === 'OUT_OF_STOCK' ? 'STOK YOK' : 'STOKTA'}
                    </span>
                  </div>
                  <Link href={`/product/${product.slug}`} className="font-headline text-base font-bold text-on-surface uppercase mt-1 leading-tight hover:text-primary">
                    {product.name}
                  </Link>
                  <div className="mt-4 flex justify-between items-end">
                    <span className="text-lg font-headline font-bold text-primary">{formatProductPrice(product)} <span className="text-[10px] text-outline font-normal">/ ADET</span></span>
                    <AddToCartButton
                      id={product.id}
                      productId={product.databaseId}
                      name={product.name}
                      price={parsePrice(product.price)}
                      sku={product.sku}
                      slug={product.slug}
                      image={product.image?.sourceUrl}
                      className="bg-primary-container text-on-primary-container px-3 py-2 text-[10px] font-headline font-black uppercase hover:bg-primary transition-colors"
                    />
                  </div>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <div className="col-span-full border border-outline-variant/20 bg-surface-container p-8 text-outline">
                Bu kategoride yayınlanmış ürün bulunamadı.
              </div>
            )}
          </div>

          {seo && (
            <section className="px-8 pb-16 pt-8 mt-6 border-t border-[#414754]/10 relative z-10">
              <div className="max-w-3xl space-y-10">
                <div className="space-y-4">
                  <h2 className="font-headline text-2xl font-bold uppercase tracking-tight text-on-surface">
                    {seo.heading}
                  </h2>
                  {seo.intro.map((paragraph, index) => (
                    <p key={index} className="text-sm leading-relaxed text-outline">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {seo.faq.length > 0 && (
                  <div>
                    <h2 className="font-headline text-2xl font-bold uppercase tracking-tight text-on-surface mb-5">
                      Sık Sorulan Sorular
                    </h2>
                    <div className="border-t border-[#414754]/20">
                      {seo.faq.map((item, index) => (
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
                  </div>
                )}
              </div>
            </section>
          )}

          {categoryGuides.length > 0 && (
            <section className="px-8 pb-16 pt-8 border-t border-[#414754]/10 relative z-10">
              <h2 className="font-headline text-2xl font-bold uppercase tracking-tight text-on-surface mb-5">
                İlgili Rehberler
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl">
                {categoryGuides.map((guide) => (
                  <Link
                    key={guide.slug}
                    href={`/rehber/${guide.slug}`}
                    className="group border border-outline-variant/20 bg-surface-container p-5 hover:border-primary/40 transition-colors"
                  >
                    <h3 className="font-headline text-sm font-bold uppercase leading-tight text-on-surface group-hover:text-primary transition-colors">
                      {guide.title}
                    </h3>
                    <span className="mt-3 inline-flex items-center gap-2 font-headline text-[10px] font-bold uppercase tracking-widest text-primary">
                      Oku
                      <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">
                        arrow_forward
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
      <Footer />
    </>
  )
}

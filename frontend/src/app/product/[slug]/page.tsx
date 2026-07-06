import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { AddToCartButton } from '@/components/AddToCartButton'
import { ProductGallery } from '@/components/ProductGallery'
import { ProductReviews } from '@/components/ProductReviews'
import { formatProductPrice, getProduct, getProducts, parsePrice } from '@/lib/static-data'
import { absoluteUrl, canonicalPath } from '@/lib/site'
import { breadcrumbLd, productLd, productMetaDescription, productMetaTitle } from '@/lib/seo'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export const dynamicParams = false

export async function generateStaticParams() {
  const products = await getProducts()
  return products.map((product) => ({ slug: product.slug }))
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return { title: 'Ürün' }
  const title = productMetaTitle(product)
  const description = productMetaDescription(product)
  const canonical = canonicalPath(`/product/${slug}`)

  return {
    title,
    description,
    keywords: product.keywords,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      images: product.image?.sourceUrl ? [{ url: product.image.sourceUrl, alt: product.image.altText || product.name }] : undefined,
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  const productName = product.name
  const primaryCategory = product.categories?.nodes?.[0]
  const relatedProducts = product.related?.nodes || []
  const productUrl = absoluteUrl(`/product/${product.slug}`)
  const galleryImages = [
    ...(product.image?.sourceUrl
      ? [{ sourceUrl: product.image.sourceUrl, altText: product.image.altText }]
      : []),
    ...(product.galleryImages?.nodes || []),
  ].filter(
    (img, index, arr) =>
      img.sourceUrl && arr.findIndex((item) => item.sourceUrl === img.sourceUrl) === index
  )
  const schemaImages = galleryImages.map((img) =>
    img.sourceUrl.startsWith('http') ? img.sourceUrl : absoluteUrl(img.sourceUrl)
  )
  const techSpecs = (product.attributes?.nodes || []).filter(
    (spec) => !['para birimi', 'model'].includes((spec.label || '').trim().toLowerCase())
  )
  const jsonLd = [
    productLd(product, schemaImages),
    breadcrumbLd([
      { name: 'Ana Sayfa', url: absoluteUrl('/') },
      {
        name: primaryCategory?.name || 'Ürünler',
        url: absoluteUrl(primaryCategory ? `/category/${primaryCategory.slug}` : '/products'),
      },
      { name: productName, url: productUrl },
    ]),
  ]

  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <main className="pt-14">
        <div className="container mx-auto px-12 py-16">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[10px] font-headline uppercase tracking-widest text-[#8B90A0] mb-8">
            <Link href="/">Ana Sayfa</Link>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <Link href={`/category/${primaryCategory?.slug || 'koruma-camlari'}`}>{primaryCategory?.name || 'Ürünler'}</Link>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <span className="text-primary capitalize">{productName}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <ProductGallery
              images={galleryImages}
              productName={productName}
              inStock={product.stockStatus !== 'OUT_OF_STOCK'}
            />

            <div className="flex flex-col">
              <div className="mb-6">
                <span className="text-[10px] font-headline font-bold text-outline uppercase tracking-widest">{product.sku || primaryCategory?.name || 'LAZER ONLINE'}</span>
                <h1 className="font-headline text-4xl font-bold uppercase tracking-tight mt-2 mb-4">{productName}</h1>
                <div className="flex items-baseline gap-4">
                  <span className="text-3xl font-headline font-bold text-primary">{formatProductPrice(product)}</span>
                  <span className="text-sm text-outline">/ ADET</span>
                </div>
                <div className="mt-3 inline-flex items-center gap-2 text-sm font-headline font-bold uppercase tracking-wide text-primary-fixed">
                  <span className="material-symbols-outlined text-base">local_shipping</span>
                  Ücretsiz Kargo
                </div>
              </div>

              <div className="border-t border-b border-outline-variant/20 py-6 mb-6">
                <h3 className="text-xs font-headline text-primary mb-4 uppercase tracking-widest">Teknik Özellikler</h3>
                <div className="grid grid-cols-2 gap-4">
                  {(techSpecs.length ? techSpecs : [{ name: 'sku', label: 'SKU', value: product.sku || '-' }]).map((spec) => (
                    <div key={`${spec.name}-${spec.value}`} className="border-l border-outline-variant/30 pl-3">
                      <span className="block text-[11px] text-outline font-headline uppercase">{spec.label}</span>
                      <span className="block text-sm md:text-base font-bold leading-relaxed">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {product.description && (
                <div className="text-outline text-base leading-7 mb-6">
                  {product.description}
                </div>
              )}

              {/* Stock Status */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 bg-primary-fixed rounded-full"></span>
                  <span className="text-xs font-headline font-bold text-primary-fixed uppercase">Stokta</span>
                  <span className="text-xs text-outline">- Stok: {product.stockQuantity ?? 'bilgi alınız'}</span>
                </div>
              </div>

              <div className="flex gap-4 mt-auto">
                <AddToCartButton
                  id={product.id}
                  productId={product.databaseId}
                  name={productName}
                  price={parsePrice(product.price)}
                  sku={product.sku}
                  slug={product.slug}
                  image={product.image?.sourceUrl}
                  label="Sepete Ekle"
                  className="flex-1 py-4 bg-primary-container text-on-primary-container font-headline text-sm font-black uppercase tracking-widest hover:bg-primary transition-colors"
                />
                <button className="px-6 py-4 border border-primary text-primary font-headline text-sm font-bold uppercase tracking-widest hover:bg-primary/5 transition-colors">
                  Teknik Föy İndir
                </button>
              </div>
            </div>
          </div>

          <ProductReviews productId={product.databaseId} productName={productName} />

          {relatedProducts.length > 0 && (
            <div className="mt-24">
              <h2 className="font-headline text-2xl font-bold uppercase tracking-tight mb-8">İlgili Ürünler</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((related) => (
                  <Link key={related.id} href={`/product/${related.slug}`} className="group relative bg-surface-container border border-transparent hover:border-primary/30 transition-all duration-300">
                    <div className="aspect-square bg-surface-container-lowest relative overflow-hidden">
                      {related.image?.sourceUrl && <img src={related.image.sourceUrl} alt={related.image.altText || related.name} className="h-full w-full object-contain p-4" />}
                    </div>
                    <div className="p-4">
                      <h3 className="font-headline text-sm font-bold uppercase">{related.name}</h3>
                      <span className="text-primary font-headline font-bold mt-2 block">{formatProductPrice(related)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

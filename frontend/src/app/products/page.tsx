import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { AddToCartButton } from '@/components/AddToCartButton'
import { formatProductPrice, getProducts, parsePrice } from '@/lib/static-data'
import { absoluteUrl } from '@/lib/site'
import { JsonLd } from '@/components/JsonLd'
import { breadcrumbLd, itemListLd } from '@/lib/seo'

const productsTitle = 'Tüm Ürünler – Fiber Lazer Sarf Malzemeleri Kataloğu'
const productsDescription =
  'Precitec, Raytools, Bystronic ve Nukon uyumlu fiber lazer koruma camı, seramik, nozul, lens ve lazer kaynak sarf malzemelerinin tam kataloğu. Stokta, hızlı kargo.'

export const metadata = {
  title: { absolute: productsTitle },
  description: productsDescription,
  keywords: [
    'fiber lazer sarf malzemeleri', 'lazer kesim sarf', 'koruma camı', 'seramik', 'nozul', 'lens',
    'precitec', 'raytools', 'bystronic', 'lazer cnc parça',
  ],
  alternates: {
    canonical: '/products/',
  },
  openGraph: {
    title: productsTitle,
    description: productsDescription,
    url: '/products/',
  },
}

export default async function ProductsPage() {
  const products = await getProducts()
  const jsonLd = [
    breadcrumbLd([
      { name: 'Ana Sayfa', url: absoluteUrl('/') },
      { name: 'Ürünler', url: absoluteUrl('/products') },
    ]),
    itemListLd(products),
  ]

  return (
    <>
      <Header />
      <JsonLd data={jsonLd} />
      <main className="pt-20 min-h-screen bg-surface px-6">
        <div className="container mx-auto">
          <div className="mb-10">
            <h1 className="font-headline text-4xl font-bold uppercase tracking-tight">Fiber Lazer Sarf Malzemeleri</h1>
            <p className="text-outline mt-2 max-w-3xl">
              Precitec, Raytools, Bystronic, Nukon ve HighYag uyumlu fiber lazer koruma camı, seramik, nozul, lens ve
              lazer kaynak sarf malzemelerinin tamamı. Ölçü, marka uyumu ve stok durumuna göre tek katalogdan inceleyin.
            </p>
          </div>
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
                    <span className="text-[10px] text-outline uppercase tracking-widest">{product.sku || 'SKU YOK'}</span>
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
        </div>
      </main>
      <Footer />
    </>
  )
}

import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { AddToCartButton } from '@/components/AddToCartButton'
import {
  formatProductPrice,
  getCategories,
  getProducts,
  parsePrice,
  type StaticCategory,
  type StaticProduct,
} from '@/lib/static-data'

const homeTitle = 'Fiber Lazer Sarf Malzemeleri – Koruma Camı, Seramik, Nozul, Lens | Lazer Online'
const homeDescription =
  'Precitec, Raytools, Bystronic ve Nukon uyumlu fiber lazer koruma camı, seramik, nozul, lens ve lazer kaynak sarf malzemeleri. Stokta, hızlı kargo ve teknik destek — Lazer Online.'

export const metadata = {
  title: { absolute: homeTitle },
  description: homeDescription,
  keywords: [
    'fiber lazer sarf malzemeleri', 'lazer cnc parça', 'lazer kesim sarf', 'fiber lazer koruma camı',
    'lazer seramik', 'fiber lazer nozul', 'precitec sarf', 'raytools sarf', 'bystronic sarf', 'lazer kaynak sarf',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: homeTitle,
    description: homeDescription,
    url: '/',
  },
}

const categoryPresentation: Record<string, { icon: string; description: string; accent: string }> = {
  'koruma-camlari': {
    icon: 'shield',
    description: 'Precitec, Raytools, Bodor, Boci ve Nukon uyumlu lens koruma camları.',
    accent: 'bg-[#ADC7FF]',
  },
  seramikler: {
    icon: 'radio_button_checked',
    description: 'KT B2, KTX, Bystronic, Nukon ve Raytools seramik sarf parçaları.',
    accent: 'bg-[#FFB596]',
  },
  nozullar: {
    icon: 'filter_tilt_shift',
    description: 'Single, double ve fast-cut nozul seçenekleri; Avrupa üretim alternatifler.',
    accent: 'bg-[#B7E4C7]',
  },
  lensler: {
    icon: 'lens',
    description: 'Focus lens, kolimatör lens ve tutucu grubu kritik optik parçalar.',
    accent: 'bg-[#D0BCFF]',
  },
  'lazer-kaynak': {
    icon: 'bolt',
    description: 'Lazer kaynak makineleri için koruma camı, focus lens ve sarf setleri.',
    accent: 'bg-[#FDE68A]',
  },
  'yedek-parcalar': {
    icon: 'settings_suggest',
    description: 'Seal ring, yaylı conta, sıkma halkası ve kesim kafası yedek parçaları.',
    accent: 'bg-[#F5B7B1]',
  },
  'temizlik-guvenlik': {
    icon: 'cleaning_services',
    description: 'Optik temizlik sıvısı, temizlik bezi, çubuk ve lazer güvenlik gözlüğü.',
    accent: 'bg-[#A8E6CF]',
  },
}

const bestSellerCodes = [
  {
    sku: 'HTCSER001',
    name: 'D28 M11 KT B2 Seramik',
    group: 'Seramik',
  },
  {
    sku: 'HTCCAM22354',
    name: 'D22.35 d4 Lens Koruma Camı',
    group: 'Koruma camı',
  },
  {
    sku: 'HTCCAM377M',
    name: 'D37 d7 20kw Lens Koruma Camı',
    group: 'Koruma camı',
  },
  {
    sku: 'M11STNZD',
    name: 'D28 H15 M11 Double Nozzle',
    group: 'Nozul',
  },
  {
    sku: 'HTCSER004XB',
    name: 'Precitec Procutter 2.0 KT XB Seramik',
    group: 'Seramik',
  },
  {
    sku: 'HTCCAM302',
    name: 'D30 d2 Lazer Kaynak Koruma Camı',
    group: 'Lazer kaynak',
  },
]

function categoryImage(category: StaticCategory, products: StaticProduct[]) {
  return category.image?.sourceUrl || products.find((product) => product.categories?.nodes?.some((item) => item.slug === category.slug))?.image?.sourceUrl
}

function cleanCategoryName(name: string) {
  return name.replace(' Sarfları', '')
}

function ProductCard({ product }: { product: StaticProduct }) {
  const category = product.categories?.nodes?.[0]

  return (
    <article className="group bg-surface-container border border-outline-variant/20 hover:border-primary/50 transition-colors">
      <Link href={`/product/${product.slug}`} className="block aspect-square bg-surface-container-lowest overflow-hidden relative">
        {product.image?.sourceUrl ? (
          <img
            src={product.image.sourceUrl}
            alt={product.image.altText || product.name}
            className="h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full grid-pattern opacity-10" />
        )}
        <span className="absolute top-3 left-3 bg-background/85 px-2 py-1 text-[9px] font-headline font-bold uppercase tracking-widest text-primary border border-primary/20">
          {product.stockStatus === 'OUT_OF_STOCK' ? 'Stok Sor' : 'Stokta'}
        </span>
      </Link>
      <div className="p-4 min-h-[190px] flex flex-col">
        <div className="flex items-center justify-between gap-3 text-[9px] font-headline font-bold uppercase tracking-widest text-outline">
          <span>{product.sku || 'SKU'}</span>
          <span>{category ? cleanCategoryName(category.name) : 'Ürün'}</span>
        </div>
        <Link href={`/product/${product.slug}`} className="mt-3 block font-headline text-base font-bold uppercase leading-tight text-on-surface hover:text-primary">
          {product.name}
        </Link>
        <div className="mt-auto pt-5 flex items-end justify-between gap-3">
          <span className="font-headline text-lg font-black text-primary">{formatProductPrice(product)}</span>
          <AddToCartButton
            id={product.id}
            productId={product.databaseId}
            name={product.name}
            price={parsePrice(product.price)}
            sku={product.sku}
            slug={product.slug}
            image={product.image?.sourceUrl}
            label="Ekle"
            className="px-4 py-2 bg-primary-container text-on-primary-container text-[10px] font-headline font-black uppercase tracking-widest hover:bg-primary transition-colors"
          />
        </div>
      </div>
    </article>
  )
}

export default async function HomePage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()])
  const publishedProducts = products.filter((product) => product.status !== 'draft')
  const inStockProducts = publishedProducts.filter((product) => product.stockStatus !== 'OUT_OF_STOCK')
  const heroProduct =
    inStockProducts.find((product) => product.slug.includes('d37-d7')) ||
    inStockProducts.find((product) => product.image?.sourceUrl) ||
    publishedProducts[0]
  const featuredProducts = inStockProducts
    .filter((product) => product.slug !== heroProduct?.slug)
    .slice(0, 4)
  const bestSellers = bestSellerCodes.map((seller) => ({
    ...seller,
    product: publishedProducts.find((product) => product.sku?.toLocaleUpperCase('tr') === seller.sku),
  }))

  return (
    <>
      <Header />
      <main className="pt-14 min-h-screen bg-surface">
        <section className="relative overflow-hidden bg-surface-container-lowest border-b border-outline-variant/20">
          <div className="absolute inset-0 grid-pattern opacity-[0.06]" />
          <div className="container mx-auto px-6 py-10 lg:py-14 relative">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_460px] gap-10 items-stretch">
              <div className="flex flex-col justify-between lg:min-h-[560px]">
                <div>
                  <div className="inline-flex items-center gap-3 border border-primary/25 bg-primary/5 px-3 py-2 text-[10px] font-headline font-bold uppercase tracking-widest text-primary">
                    <span className="material-symbols-outlined text-sm">local_shipping</span>
                    Ücretsiz Kargo • Stoktan Hızlı Teslim • Tüm Markalara Uyumlu
                  </div>
                  <h1 className="mt-8 max-w-4xl font-headline text-5xl md:text-7xl lg:text-8xl font-extrabold uppercase tracking-normal leading-[0.94] text-on-surface">
                    Lazer sarfını <span className="text-primary">hızlı bul</span>, üretimi durdurma.
                  </h1>
                  <p className="mt-8 max-w-2xl text-base md:text-lg leading-relaxed text-outline">
                    Koruma camı, seramik, nozul, lens ve lazer kaynak sarflarını ölçü, marka uyumu ve stok durumuna göre
                    tek katalogdan inceleyin.
                  </p>
                  <div className="mt-9 flex flex-wrap gap-4">
                    <Link
                      href="/products"
                      className="inline-flex items-center gap-3 bg-primary text-on-primary px-7 py-4 font-headline text-sm font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all"
                    >
                      <span className="material-symbols-outlined text-lg">storefront</span>
                      Tüm Ürünler
                    </Link>
                    <Link
                      href="/category/koruma-camlari"
                      className="inline-flex items-center gap-3 border border-outline-variant text-on-surface px-7 py-4 font-headline text-sm font-black uppercase tracking-widest hover:bg-surface-container transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">shield</span>
                      Koruma Camları
                    </Link>
                  </div>
                </div>
                <div className="mt-10 grid grid-cols-3 gap-px bg-outline-variant/25">
                  {[
                    ['Kargo', 'Ücretsiz'],
                    ['Teslimat', 'Stoktan Hızlı'],
                    ['Uyumluluk', 'Tüm Markalar'],
                  ].map(([label, value]) => (
                    <div key={label} className="bg-surface-container-low p-5">
                      <span className="block text-[10px] font-headline font-bold uppercase tracking-widest text-outline">{label}</span>
                      <span className="mt-2 block font-headline text-2xl font-extrabold text-primary">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {heroProduct && (
                <article className="bg-surface-container border border-primary/25 flex flex-col">
                  <Link href={`/product/${heroProduct.slug}`} className="block bg-surface-container-lowest aspect-square overflow-hidden relative">
                    {heroProduct.image?.sourceUrl ? (
                      <img
                        src={heroProduct.image.sourceUrl}
                        alt={heroProduct.image.altText || heroProduct.name}
                        className="h-full w-full object-contain p-6"
                      />
                    ) : (
                      <div className="h-full w-full grid-pattern opacity-10" />
                    )}
                    <div className="absolute top-4 left-4 bg-background/85 border border-primary/25 px-3 py-2 text-[10px] font-headline font-black uppercase tracking-widest text-primary">
                      Öne Çıkan Ürün
                    </div>
                  </Link>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center justify-between text-[10px] font-headline font-bold uppercase tracking-widest text-outline">
                      <span>{heroProduct.sku || 'HTC'}</span>
                      <span>Stokta</span>
                    </div>
                    <Link href={`/product/${heroProduct.slug}`} className="mt-4 font-headline text-2xl font-extrabold uppercase leading-tight hover:text-primary">
                      {heroProduct.name}
                    </Link>
                    <p className="mt-4 text-sm leading-relaxed text-outline">
                      {heroProduct.shortDescription || heroProduct.description || 'Lazer kesim ve kaynak operasyonları için kritik sarf malzemesi.'}
                    </p>
                    <div className="mt-auto pt-7 flex items-center justify-between gap-4">
                      <span className="font-headline text-3xl font-extrabold text-primary">{formatProductPrice(heroProduct)}</span>
                      <AddToCartButton
                        id={heroProduct.id}
                        productId={heroProduct.databaseId}
                        name={heroProduct.name}
                        price={parsePrice(heroProduct.price)}
                        sku={heroProduct.sku}
                        slug={heroProduct.slug}
                        image={heroProduct.image?.sourceUrl}
                        label="Sepete Ekle"
                        className="px-5 py-4 bg-primary-container text-on-primary-container font-headline text-xs font-black uppercase tracking-widest hover:bg-primary transition-colors"
                      />
                    </div>
                  </div>
                </article>
              )}
            </div>
          </div>
        </section>

        <section className="bg-surface px-6 py-12 border-b border-outline-variant/20">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-7">
              <div>
                <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-primary">Reyonlar</span>
                <h2 className="mt-2 font-headline text-3xl md:text-4xl font-black uppercase tracking-tight">Doğrudan kategoriye git</h2>
              </div>
              <Link href="/categories" className="inline-flex items-center gap-2 text-sm font-headline font-bold uppercase tracking-widest text-primary hover:text-on-surface">
                Tüm kategoriler
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px bg-outline-variant/25">
              {categories.map((category) => {
                const presentation = categoryPresentation[category.slug] || {
                  icon: 'category',
                  description: category.description || 'Lazer sarf malzemeleri.',
                  accent: 'bg-primary',
                }
                const image = categoryImage(category, publishedProducts)

                return (
                  <Link
                    key={category.slug}
                    href={`/category/${category.slug}`}
                    className="group min-h-[260px] bg-surface-container p-5 flex flex-col justify-between overflow-hidden relative hover:bg-surface-container-high transition-colors"
                  >
                    {image && <img src={image} alt={category.name} className="absolute inset-0 h-full w-full object-cover opacity-20 group-hover:opacity-30 transition-opacity" />}
                    <div className="relative flex items-center justify-between">
                      <span className={`h-9 w-9 ${presentation.accent} text-[#0E0E0E] flex items-center justify-center`}>
                        <span className="material-symbols-outlined text-lg">{presentation.icon}</span>
                      </span>
                      <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-outline">{category.count || 0} ürün</span>
                    </div>
                    <div className="relative">
                      <h3 className="font-headline text-2xl font-black uppercase leading-none text-on-surface">{cleanCategoryName(category.name)}</h3>
                      <p className="mt-4 text-xs leading-relaxed text-outline">{presentation.description}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        <section className="bg-surface-container-lowest px-6 py-16">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
              <div>
                <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-secondary">Hızlı Sipariş</span>
                <h2 className="mt-2 font-headline text-3xl md:text-4xl font-black uppercase tracking-tight">Stokta öne çıkanlar</h2>
              </div>
              <Link href="/products" className="inline-flex items-center gap-2 text-sm font-headline font-bold uppercase tracking-widest text-primary hover:text-on-surface">
                Kataloğu aç
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        <section className="bg-surface px-6 py-16">
          <div className="container mx-auto grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8">
            <div className="border border-outline-variant/20 bg-surface-container p-7">
              <span className="material-symbols-outlined text-4xl text-primary">local_fire_department</span>
              <span className="mt-8 block text-[10px] font-headline font-bold uppercase tracking-widest text-secondary">
                Popüler Ürünler
              </span>
              <h2 className="mt-3 font-headline text-3xl font-black uppercase tracking-tight">Çok Satanlar</h2>
              <p className="mt-4 text-sm leading-relaxed text-outline">
                Atölyelerin en sık ihtiyaç duyduğu koruma camı, lens, seramik, nozul ve temizlik ürünlerini bir araya
                getirdik. Ücretsiz kargo ve teknik destekle, stoktan hızlı teslim.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-px bg-outline-variant/25">
                {[
                  ['Kargo', 'Ücretsiz'],
                  ['İade', '14 Gün'],
                  ['Destek', 'Teknik'],
                ].map(([label, value]) => (
                  <div key={label} className="bg-surface-container-low p-3">
                    <span className="block text-[9px] font-headline font-bold uppercase tracking-widest text-outline">{label}</span>
                    <span className="mt-1 block font-headline text-lg font-black text-primary">{value}</span>
                  </div>
                ))}
              </div>
              <Link href="/page/contact" className="mt-8 inline-flex items-center gap-2 font-headline text-xs font-black uppercase tracking-widest text-secondary hover:text-on-surface">
                Aradığın ürünü sor
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-outline-variant/25">
              {bestSellers.map((seller, index) => {
                const href = seller.product ? `/product/${seller.product.slug}` : '/page/contact'
                const price = seller.product ? formatProductPrice(seller.product) : 'Fiyat için sor'

                return (
                <Link
                  key={seller.sku}
                  href={href}
                  className="group bg-surface-container-low p-5 hover:bg-surface-container-high transition-colors min-h-[190px] flex flex-col relative overflow-hidden"
                >
                  <span className="absolute right-5 bottom-4 font-headline text-7xl font-black text-outline-variant/20 transition-colors group-hover:text-primary/10">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex items-center justify-between gap-3 text-[10px] font-headline font-bold uppercase tracking-widest text-outline">
                    <span>{seller.sku}</span>
                    <span>{seller.group}</span>
                  </div>
                  <h3 className="relative mt-5 font-headline text-xl font-bold uppercase leading-tight text-on-surface">
                    {seller.product?.name || seller.name}
                  </h3>
                  <div className="relative mt-auto pt-6 flex items-end justify-between gap-4">
                    <span className="font-headline text-xl font-black text-primary">{price}</span>
                    <span className="material-symbols-outlined text-secondary transition-transform group-hover:translate-x-1">
                      arrow_forward
                    </span>
                  </div>
                </Link>
                )
              })}
            </div>
          </div>
        </section>

        <section className="bg-surface-container-lowest px-6 py-16 border-t border-outline-variant/20">
          <div className="container mx-auto max-w-4xl space-y-5">
            <h2 className="font-headline text-3xl font-black uppercase tracking-tight">
              Fiber Lazer Kesim ve Kaynak Sarf Malzemeleri
            </h2>
            <p className="text-sm md:text-base leading-relaxed text-outline">
              Lazer Online; Precitec, Raytools, Bystronic, Nukon, HighYag, WSX ve Boci fiber lazer kesim ve kaynak
              kafalarıyla uyumlu sarf malzemelerinde doğrudan ithalatçı tedarikçidir. Lens koruma camları, KT B2
              seramikler, single/double/fast-cut nozullar, odak ve kolimatör lensleri ile lazer kaynak sarflarını
              orijinal ve maliyet avantajlı alternatifleriyle stoktan sunuyoruz.
            </p>
            <p className="text-sm md:text-base leading-relaxed text-outline">
              Lazer CNC makineniz için doğru parçayı ölçü, marka uyumu ve stok durumuna göre seçin; emin değilseniz kafa
              marka-modelini veya ürün kodunu paylaşın, uygun sarfı birlikte belirleyelim. Üretiminiz durmasın diye hızlı
              kargo ve teknik destek sağlıyoruz.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              {[
                ['Koruma Camları', '/category/koruma-camlari'],
                ['Seramikler', '/category/seramikler'],
                ['Nozullar', '/category/nozullar'],
                ['Lensler', '/category/lensler'],
                ['Lazer Kaynak Sarfları', '/category/lazer-kaynak'],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="inline-flex items-center gap-2 border border-outline-variant/40 px-4 py-2 font-headline text-xs font-bold uppercase tracking-widest text-on-surface hover:border-primary hover:text-primary transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
            <div className="pt-4">
              <span className="block text-[10px] font-headline font-bold uppercase tracking-widest text-outline mb-3">
                Marka uyumu
              </span>
              <div className="flex flex-wrap gap-3">
                {[
                  ['Precitec', '/marka/precitec'],
                  ['Raytools', '/marka/raytools'],
                  ['Nukon / HighYag', '/marka/nukon-highyag'],
                  ['Bystronic', '/marka/bystronic'],
                  ['Boci', '/marka/boci'],
                  ['Durma', '/marka/durma'],
                  ['Ermaksan', '/marka/ermaksan'],
                  ['Bodor', '/marka/bodor'],
                  ['MVD', '/marka/mvd'],
                  ['Dener', '/marka/dener'],
                  ['Accurl', '/marka/accurl'],
                ].map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    className="inline-flex items-center gap-2 border border-outline-variant/40 px-4 py-2 font-headline text-xs font-bold uppercase tracking-widest text-on-surface hover:border-primary hover:text-primary transition-colors"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

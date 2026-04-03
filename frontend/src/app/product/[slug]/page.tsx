import Link from 'next/link'
import { Header } from '@/components/Header'
import { AddToCartButton } from '@/components/AddToCartButton'

interface ProductPageProps {
  params: { slug: string }
}

// Placeholder - will be connected to GraphQL in implementation
export default function ProductPage({ params }: ProductPageProps) {
  const productName = params.slug.replace('-', ' ')
  const productId = `product-${params.slug}`
  const unitPrice = 42.5

  return (
    <>
      <Header />
      <main className="pt-14">
        <div className="container mx-auto px-12 py-16">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[10px] font-headline uppercase tracking-widest text-[#8B90A0] mb-8">
            <Link href="/">Home</Link>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <Link href="/category/bearings">Bearings</Link>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <span className="text-primary capitalize">{productName}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Product Image - Left */}
            <div className="aspect-square bg-surface-container-lowest relative overflow-hidden">
              <div className="absolute inset-0 grid-pattern opacity-10"></div>
              <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur px-3 py-1 text-[10px] font-headline font-bold text-primary border border-primary/20">
                IN STOCK
              </div>
            </div>

            {/* Product Info - Right */}
            <div className="flex flex-col">
              <div className="mb-6">
                <span className="text-[10px] font-headline font-bold text-outline uppercase tracking-widest">TIMKEN PRECISION</span>
                <h1 className="font-headline text-4xl font-bold uppercase tracking-tight mt-2 mb-4">{productName}</h1>
                <div className="flex items-baseline gap-4">
                  <span className="text-3xl font-headline font-bold text-primary">${unitPrice.toFixed(2)}</span>
                  <span className="text-sm text-outline">/ UNIT</span>
                </div>
              </div>

              {/* Tech Specs */}
              <div className="border-t border-b border-outline-variant/20 py-6 mb-6">
                <h3 className="text-[10px] font-headline text-primary mb-4 uppercase tracking-widest">Technical Specifications</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'ID / OD', value: '25MM / 52MM' },
                    { label: 'DYNAMIC LOAD', value: '14.8 KN' },
                    { label: 'LIMIT SPEED', value: '18,000 RPM' },
                    { label: 'MATERIAL', value: 'AISI 52100' },
                    { label: 'PRECISION', value: 'ABEC-7' },
                    { label: 'PART NO.', value: 'PB-882-X' },
                  ].map((spec, i) => (
                    <div key={i} className="border-l border-outline-variant/30 pl-3">
                      <span className="block text-[9px] text-outline font-headline uppercase">{spec.label}</span>
                      <span className="block text-xs font-bold">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 bg-primary-fixed rounded-full"></span>
                  <span className="text-xs font-headline font-bold text-primary-fixed uppercase">In Stock</span>
                  <span className="text-xs text-outline">- Ships within 24 hours</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 mt-auto">
                <AddToCartButton
                  id={productId}
                  name={productName}
                  price={unitPrice}
                  label="Add to Cart"
                  className="flex-1 py-4 bg-primary-container text-on-primary-container font-headline text-sm font-black uppercase tracking-widest hover:bg-primary transition-colors"
                />
                <button className="px-6 py-4 border border-primary text-primary font-headline text-sm font-bold uppercase tracking-widest hover:bg-primary/5 transition-colors">
                  Download Spec Sheet
                </button>
              </div>
            </div>
          </div>

          {/* Related Products */}
          <div className="mt-24">
            <h2 className="font-headline text-2xl font-bold uppercase tracking-tight mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="group relative bg-surface-container border border-transparent hover:border-primary/30 transition-all duration-300">
                  <div className="aspect-square bg-surface-container-lowest relative overflow-hidden"></div>
                  <div className="p-4">
                    <h3 className="font-headline text-sm font-bold uppercase">Related Product {i + 1}</h3>
                    <span className="text-primary font-headline font-bold mt-2 block">${(84 + i * 20).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

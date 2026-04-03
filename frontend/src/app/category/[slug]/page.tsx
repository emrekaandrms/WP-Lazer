import Link from 'next/link'
import { Header } from '@/components/Header'
import { AddToCartButton } from '@/components/AddToCartButton'

interface CategoryPageProps {
  params: { slug: string }
}

// Placeholder - will be connected to GraphQL in implementation
export default function CategoryPage({ params }: CategoryPageProps) {
  return (
    <>
      <Header />
      <div className="flex flex-1 pt-16">
        {/* Sidebar Filters */}
        <aside className="hidden md:flex flex-col h-screen sticky top-16 bg-[#131313] h-full w-64 rounded-none border-r border-[#414754]/20 font-headline text-xs font-bold uppercase">
          <div className="p-6 border-b border-[#414754]/20">
            <h2 className="text-[#ADC7FF] font-bold tracking-widest">TECHNICAL FILTERS</h2>
            <p className="text-[10px] text-[#8B90A0] mt-1">SPECIFICATION MATCH</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {['Dimensions', 'Compatibility', 'Material', 'Brand', 'Lead Time'].map((filter, i) => (
              <div key={i} className="flex items-center gap-3 px-6 py-4 text-[#C8C6C5] hover:bg-[#201F1F] transition-transform duration-200 cursor-pointer">
                <span className="material-symbols-outlined text-sm">{i === 0 ? 'straighten' : i === 1 ? 'settings_input_component' : i === 2 ? 'architecture' : i === 3 ? 'factory' : 'schedule'}</span>
                <span>{filter}</span>
              </div>
            ))}
          </div>
          <div className="p-6">
            <button className="w-full py-3 bg-[#4a8eff] text-[#00285b] font-bold uppercase tracking-widest hover:brightness-110 transition-all">Apply Filters</button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-surface min-h-screen relative overflow-hidden">
          <div className="absolute inset-0 grid-pattern pointer-events-none opacity-5"></div>

          {/* Breadcrumbs & Sort */}
          <div className="px-8 py-6 border-b border-[#414754]/10 bg-surface flex flex-col gap-4 relative z-10">
            <div className="flex items-center gap-2 text-[10px] font-headline uppercase tracking-widest text-[#8B90A0]">
              <Link href="/">Home</Link>
              <span className="material-symbols-outlined text-[12px]">chevron_right</span>
              <Link href="/categories">Mechanical Parts</Link>
              <span className="material-symbols-outlined text-[12px]">chevron_right</span>
              <span className="text-primary capitalize">{params.slug.replace('-', ' ')}</span>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <h1 className="font-headline text-3xl font-bold tracking-tighter uppercase text-on-surface capitalize">{params.slug.replace('-', ' ')}</h1>
                <p className="text-xs font-body text-outline mt-1 uppercase tracking-tight">124 High-Performance Units Found</p>
              </div>
              <div className="flex items-center gap-4 bg-surface-container-low p-1 border border-[#414754]/20">
                <div className="flex border-r border-[#414754]/20 pr-4 pl-2 items-center gap-2">
                  <span className="text-[10px] font-headline text-outline uppercase font-bold">Sort By</span>
                  <select className="bg-transparent text-xs font-headline text-primary border-none focus:ring-0 uppercase cursor-pointer">
                    <option>Popularity</option>
                    <option>Price: Low-High</option>
                    <option>Newest Arrivals</option>
                  </select>
                </div>
                <div className="flex items-center gap-1 px-2">
                  <button className="p-1.5 bg-surface-container-high text-primary"><span className="material-symbols-outlined text-sm">grid_view</span></button>
                  <button className="p-1.5 text-outline hover:text-on-surface transition-colors"><span className="material-symbols-outlined text-sm">view_list</span></button>
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid - Placeholder */}
          <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="group relative bg-surface-container border border-transparent hover:border-primary/30 transition-all duration-300">
                <div className="aspect-square bg-surface-container-lowest relative overflow-hidden">
                  <div className="absolute inset-0 bg-surface-container-high/20"></div>
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-surface-container-highest text-[9px] font-headline text-outline uppercase border border-[#414754]/30">
                    PART NO. PB-{i.toString().padStart(3, '0')}-X
                  </div>
                </div>
                <div className="p-5 flex flex-col gap-1">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-headline font-bold text-outline uppercase tracking-widest">TIMKEN PRECISION</span>
                    <span className="text-[10px] font-headline font-bold text-primary-fixed bg-on-primary-fixed-variant px-1.5">IN STOCK</span>
                  </div>
                  <h3 className="font-headline text-base font-bold text-on-surface uppercase mt-1 leading-tight">6205-2RS Deep Groove</h3>
                  <div className="mt-4 flex justify-between items-end">
                    <span className="text-lg font-headline font-bold text-primary">${(42.50 + i * 10).toFixed(2)} <span className="text-[10px] text-outline font-normal">/ UNIT</span></span>
                    <AddToCartButton
                      id={`cat-${params.slug}-${i}`}
                      name={`${params.slug.replace('-', ' ')} part ${i + 1}`}
                      price={42.5 + i * 10}
                      className="bg-primary-container text-on-primary-container px-3 py-2 text-[10px] font-headline font-black uppercase hover:bg-primary transition-colors"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  )
}

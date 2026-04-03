import Link from 'next/link'
import { Header } from '@/components/Header'

interface PageRouteProps {
  params: { slug: string }
}

// Placeholder - will be connected to GraphQL in implementation
export default function PageRoute({ params }: PageRouteProps) {
  return (
    <main className="min-h-screen bg-surface">
      <Header />
      <main className="pt-14">
        <div className="container mx-auto px-12 py-24">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-headline text-5xl font-bold uppercase tracking-tight mb-8 capitalize">
              {params.slug.replace('-', ' ')}
            </h1>
            <div className="prose prose-invert max-w-none">
              <div className="text-on-surface leading-relaxed space-y-6">
                <p className="text-lg text-outline">
                  [Content for {params.slug} will be loaded from WordPress via GraphQL]
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#414754]/20 bg-[#0E0E0E] px-12 py-16">
        <div className="flex justify-between items-center">
          <span className="font-headline font-black text-[#ADC7FF] text-xl uppercase">PRECISION CNC</span>
          <p className="font-body text-xs text-[#8B90A0]">2026 Industrial Precision Ops. ISO 9001 Certified.</p>
        </div>
      </footer>
    </main>
  )
}

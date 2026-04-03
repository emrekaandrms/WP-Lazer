import Link from 'next/link'
import { Header } from '@/components/Header'

interface PolicyPageProps {
  params: { slug: string }
}

// Placeholder - will be connected to GraphQL in implementation
export default function PolicyPage({ params }: PolicyPageProps) {
  return (
    <main className="min-h-screen bg-surface">
      <Header />

      <main className="pt-14">
        <div className="container mx-auto px-12 py-24">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <span className="text-[10px] font-headline text-secondary uppercase tracking-widest">Legal</span>
            </div>
            <h1 className="font-headline text-4xl font-bold uppercase tracking-tight mb-4">
              {params.slug.replace('-', ' ')} Policy
            </h1>
            <div className="flex items-center gap-4 text-[10px] font-headline text-outline uppercase tracking-widest mb-12">
              <span>Effective: 2026-04-01</span>
              <span>|</span>
              <span>Version: 1.0.0</span>
            </div>
            <div className="prose prose-invert max-w-none">
              <div className="text-on-surface leading-relaxed space-y-6">
                <p className="text-lg text-outline">
                  [Policy content for {params.slug} will be loaded from WordPress via GraphQL]
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
          <div className="flex gap-8">
            <Link href="/policy/privacy" className="font-body text-xs text-[#8B90A0] hover:text-white uppercase">Privacy</Link>
            <Link href="/policy/terms" className="font-body text-xs text-[#8B90A0] hover:text-white uppercase">Terms</Link>
            <Link href="/policy/kvkk" className="font-body text-xs text-[#8B90A0] hover:text-white uppercase">KVKK</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}

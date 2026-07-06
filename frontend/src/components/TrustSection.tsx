'use client'

import Link from 'next/link'

export function TrustSection() {
  return (
    <section className="py-24 bg-surface-container-lowest relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute top-0 left-0 w-full h-full"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #414754 1px, transparent 0)', backgroundSize: '40px 40px' }}
        ></div>
      </div>
      <div className="container mx-auto px-6 text-center relative z-10">
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-headline font-bold uppercase tracking-tighter text-on-surface mb-8">
          MAKİNENİZE UYGUN PARÇAYI <span className="text-secondary">BİRLİKTE NETLEŞTİRELİM</span>
        </h2>
        <p className="text-outline text-lg max-w-2xl mx-auto mb-12">
          Ürünü katalogdan doğrudan seçebilir veya makine/kafa uyumluluğu konusunda destek isteyebilirsiniz.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Link
            href="/products"
            className="px-12 py-5 bg-secondary text-on-secondary font-headline font-black uppercase tracking-widest text-lg hover:scale-105 transition-all"
          >
            Kataloğa Git
          </Link>
          <Link
            href="/page/contact"
            className="px-12 py-5 border border-outline text-on-surface font-headline font-black uppercase tracking-widest text-lg hover:bg-surface-container-high transition-all"
          >
            İletişime Geç
          </Link>
        </div>
      </div>
    </section>
  )
}

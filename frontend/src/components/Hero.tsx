'use client'

import Link from 'next/link'

export function Hero() {
  return (
    <section className="relative min-h-[921px] flex items-center overflow-hidden bg-surface-container-lowest">
      <div className="absolute inset-0 opacity-40 mix-blend-luminosity">
        <img
          className="w-full h-full object-cover"
          alt="Close up of high precision CNC machined steel component"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8QqoJ0j67FQcgmz7VjEDfQ_ik8IhxDixwGfgU67gBNZHGs9A9ICJ1MxZYzx4QIxUf_vKWCbU_zjYImdUycZpOroAxbrWB2vSGi_Et7qY6NFrzAOicpUP4Q6yuMcoCibozqsd03Yo3XLjTtbBN8tqTUcRgp3efbn_lAKlR2fTcsjgRKl5Mf3JbDVVfdTnpp7SV16fUr9_uzGT7yaHvmcUyfPPDK5khA2HJppGf9uCUsLN6yQiqy6TmWAc8hlGSbGSMnMkYE2zX274"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent"></div>
      </div>
      <div className="relative z-10 container mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-8 lg:col-span-7">
          <span className="inline-block py-1 px-3 border border-primary/30 text-primary font-label text-xs tracking-widest uppercase mb-6">
            Established 1988 - High Precision Engineering
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-headline font-bold uppercase tracking-tighter leading-[0.9] text-on-surface mb-8">
            THE CORE OF <span className="text-primary">MODERN</span> MANUFACTURING
          </h1>
          <p className="text-lg md:text-xl text-outline font-body max-w-2xl leading-relaxed mb-10">
            For over three decades, INDUSTRIAL PRECISION OPS has been the silent engine behind global production lines.
            We engineer, source, and deliver the critical components that define the limits of mechanical performance.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/products"
              className="px-8 py-4 bg-primary text-on-primary font-label font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all"
            >
              Explore Components
            </Link>
            <Link
              href="/page/about"
              className="px-8 py-4 border border-outline-variant text-on-surface font-label font-bold uppercase tracking-widest hover:bg-surface-container-high transition-all"
            >
              Our Capabilities
            </Link>
          </div>
        </div>
      </div>
      <div className="absolute top-20 right-10 hidden lg:block opacity-20 pointer-events-none">
        <div className="border-l border-t border-outline-variant w-48 h-48 flex flex-col justify-end items-end p-4">
          <span className="font-label text-[10px] text-outline uppercase tracking-widest">TOLERANCE_CHECK.V2</span>
          <span className="font-label text-xs text-primary">0.001mm_ACCURACY</span>
        </div>
      </div>
    </section>
  )
}

'use client'

const values = [
  {
    code: 'VAL_01',
    icon: 'straighten',
    title: 'PRECISION',
    description:
      'Absolute adherence to technical specifications. We utilize laser-calibrated verification systems to ensure every part matches the blueprint exactly.',
  },
  {
    code: 'VAL_02',
    icon: 'verified_user',
    title: 'RELIABILITY',
    description:
      'Engineered for 24/7 industrial cycles. Our components undergo extreme stress-testing to mitigate downtime and maximize MTBF (Mean Time Between Failures).',
  },
  {
    code: 'VAL_03',
    icon: 'architecture',
    title: 'ENGINEERING SUPPORT',
    description:
      'Integration is not an afterthought. Our team of senior mechanical engineers provides direct implementation support for complex CNC arrays and custom motion paths.',
  },
]

export function CategoryShowcase() {
  return (
    <section className="py-24 bg-surface px-6">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-headline font-bold uppercase tracking-tighter text-on-surface">
              MECHANICAL RIGOR
            </h2>
            <p className="text-outline mt-4 font-body">
              Our values are not slogans; they are the tolerances we live by in every CNC spindle, bearing, and motor we
              supply.
            </p>
          </div>
          <div className="h-px flex-grow bg-outline-variant/20 mx-12 hidden md:block"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-outline-variant/20">
          {values.map((value) => (
            <div
              key={value.code}
              className="bg-surface-container p-10 group hover:bg-surface-container-high transition-all duration-300"
            >
              <div className="mb-8 flex justify-between items-start">
                <span className="material-symbols-outlined text-4xl text-primary">{value.icon}</span>
                <span className="text-xs font-label text-outline/50">{value.code}</span>
              </div>
              <h3 className="text-2xl font-headline font-bold uppercase mb-4 text-on-surface">{value.title}</h3>
              <p className="text-outline font-body text-sm leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

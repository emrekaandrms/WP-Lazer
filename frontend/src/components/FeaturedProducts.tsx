'use client'

const timeline = [
  {
    year: '10+',
    title: 'SEKTÖR TECRÜBESİ',
    detail: 'Alkan Günal önderliğinde oluşan saha bilgisi ürün seçimi ve tedarik yaklaşımımızın temelidir.',
    accent: 'primary',
    offset: false,
  },
  {
    year: '01',
    title: 'TEST SÜRECİ',
    detail: 'Ürünler satışa çıkmadan önce performans, hassasiyet, ömür ve maliyet açısından değerlendirilir.',
    accent: 'primary',
    offset: true,
  },
  {
    year: '02',
    title: 'DOĞRUDAN İTHALAT',
    detail: 'Kaliteli ve güvenilir yedek parçaları doğrudan ithalat modeliyle ulaşılabilir hale getiririz.',
    accent: 'primary',
    offset: false,
  },
  {
    year: '7/24',
    title: 'SAHA DESTEĞİ',
    detail: 'Fiber lazer kesim makineleri için teknik destek ve doğru ürün yönlendirmesi sunarız.',
    accent: 'secondary',
    offset: true,
  },
]

export function FeaturedProducts() {
  return (
    <section className="py-24 bg-surface-container-lowest overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="mb-20">
          <h2 className="text-3xl font-headline font-bold uppercase tracking-widest text-on-surface">ÇALIŞMA MODELİ</h2>
          <div className="w-24 h-1 bg-primary mt-4"></div>
        </div>
        <div className="relative flex flex-col md:flex-row gap-12 md:gap-0">
          <div className="absolute top-1/2 left-0 w-full h-px bg-outline-variant/30 hidden md:block"></div>
          {timeline.map((item) => (
            <div key={item.year} className={`flex-1 relative ${item.offset ? 'md:pt-16 md:pb-0' : 'md:pb-16 md:pt-0'}`}>
              <div
                className={`bg-surface-container-high w-fit p-4 mb-6 ${item.offset ? 'md:mt-24' : ''} border-l-4 ${
                  item.accent === 'secondary' ? 'border-l-secondary' : 'border-l-primary'
                }`}
              >
                <span className="font-headline text-2xl font-black text-on-surface">{item.year}</span>
              </div>
              <div
                className={`md:absolute md:top-1/2 md:left-0 md:w-4 md:h-4 md:-translate-y-1/2 md:translate-x-[-8px] ${
                  item.accent === 'secondary' ? 'md:bg-secondary' : 'md:bg-primary'
                }`}
              ></div>
              <h4 className="font-headline text-lg font-bold uppercase text-on-surface mb-2">{item.title}</h4>
              <p className="text-outline text-xs uppercase font-label">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

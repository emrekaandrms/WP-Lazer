'use client'

const values = [
  {
    code: 'VAL_01',
    icon: 'science',
    title: 'TEST EDİLMİŞ ÜRÜN',
    description:
      'Satışa aldığımız ürünleri optik performans, kesim kalitesi, hassasiyet sürekliliği ve kullanım ömrü açısından değerlendiririz.',
  },
  {
    code: 'VAL_02',
    icon: 'payments',
    title: 'KALİTE = UYGUN FİYAT',
    description:
      'Sektördeki kaliteli ürün pahalıdır ezberini kırıp, doğru ürünü ulaşılabilir fiyatla sunmayı hedefliyoruz.',
  },
  {
    code: 'VAL_03',
    icon: 'architecture',
    title: 'SAHA TECRÜBESİ',
    description:
      'Optik, mekanik, elektrik, yazılım, CAD/CAM ve eğitim tarafındaki saha tecrübemiz ürün seçim sürecine yansır.',
  },
]

export function CategoryShowcase() {
  return (
    <section className="py-24 bg-surface px-6">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-headline font-bold uppercase tracking-tighter text-on-surface">
              NEDEN LAZER ONLINE?
            </h2>
            <p className="text-outline mt-4 font-body">
              Amacımız yalnızca ürün listelemek değil; makinenizde güvenle kullanabileceğiniz, ölçüsü ve performansı net
              sarf parçalarını sürdürülebilir şekilde tedarik etmektir.
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

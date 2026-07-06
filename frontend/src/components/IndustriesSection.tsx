'use client'

const teamItems = [
  {
    icon: 'engineering',
    title: 'GENİŞ TEKNİK KAPSAM',
    detail:
      'Optik, mekanik, elektrik, yazılım, CAD/CAM ve eğitim tecrübesiyle fiber lazer kesim makinelerine bütüncül bakış.',
  },
  {
    icon: 'verified',
    title: 'POZİTİF TEST VERİSİ',
    detail:
      'Optik testler, kesim kalitesi, sürdürülebilir hassasiyet, kullanım ömrü ve maliyet çalışması olumlu olan ürünler satışa alınır.',
  },
  {
    icon: 'inventory_2',
    title: 'GÜVENLİ TEDARİK',
    detail: 'Müşterilerin ihtiyacına uygun, kaliteli ve makinelerinde güvenle kullanabileceği parçaları ithal ederiz.',
  },
]

export function IndustriesSection() {
  return (
    <section className="py-24 bg-surface px-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-headline font-bold uppercase tracking-tighter text-on-surface mb-8">
              KURULUŞ
              <br />
              <span className="text-primary">YAKLAŞIMI</span>
            </h2>
            <div className="space-y-8">
              {teamItems.map((item) => (
                <div key={item.title} className="flex gap-6">
                  <div className="w-12 h-12 flex-shrink-0 bg-surface-container-highest flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">{item.icon}</span>
                  </div>
                  <div>
                    <h5 className="font-headline font-bold uppercase text-on-surface">{item.title}</h5>
                    <p className="text-outline text-sm mt-1">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square bg-surface-container-highest relative overflow-hidden p-1">
              <img
                className="w-full h-full object-cover grayscale opacity-80 hover:grayscale-0 transition-all duration-700"
                alt="Fiber lazer kesim makinesi ve teknik üretim ortamı"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGaS8wbN-PrbaFzWNJ-lg6ej4WXZfHlYAknA7HkQpZKaDw8HklbWt3V1oIkpmrHHZa7F_adxV8Pq5fW5vFHvjTPMmC-tf7lQGlI2VXYoQlSFIhWk5PL03Qu6p3it924vKoYXIW3Fcn7mBC-R1gpmUFVbCD2PweV_SLymsbRR4CCLHF2lhvebkbQ05T2D48XwcnKuPE0PVCTgVaYPYR9_xLIsMobYBsiK6YdIxHnAGb_V5rWDt_PabTZdDcuivfGamNG-zN1Xbnzuk"
              />
              <div className="absolute top-0 right-0 p-6 bg-background/80 backdrop-blur-md">
                <span className="font-label text-[10px] text-primary uppercase block">FİRMA SAHİBİ</span>
                <span className="font-label text-xl font-bold text-on-surface">ALKAN GÜNAL</span>
              </div>
            </div>
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-primary/5 border border-primary/20 backdrop-blur-xl flex flex-col justify-center items-center text-center p-4">
              <span className="font-headline text-4xl font-black text-primary">10+</span>
              <span className="font-label text-xs uppercase text-outline">YIL BİLGİ VE TECRÜBE</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

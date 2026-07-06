// Keyword-rich, genuinely useful SEO content per product category (Turkish).
// Used for category page meta tags, on-page intro copy and FAQPage schema.

export type CategoryFaq = { question: string; answer: string }

export type CategorySeo = {
  metaTitle: string
  metaDescription: string
  heading: string
  intro: string[]
  faq: CategoryFaq[]
  keywords: string[]
}

export const categorySeo: Record<string, CategorySeo> = {
  'koruma-camlari': {
    metaTitle: 'Fiber Lazer Koruma Camı Fiyatları – Precitec, Raytools, Bystronic Uyumlu',
    metaDescription:
      'Fiber lazer kesim ve kaynak kafaları için lens koruma camları. Precitec, Raytools, Bystronic, Nukon ve WSX uyumlu, tüm ölçülerde, stokta ve hızlı kargo.',
    heading: 'Fiber Lazer Koruma Camları',
    intro: [
      'Fiber lazer koruma camı (lens koruma camı), kesim ve kaynak kafasındaki pahalı odak lensini sıçrayan metal, duman ve partiküllerden koruyan ilk savunma hattıdır. Düzenli değiştirilen bu sarf malzemesi, kesim kalitesini, delme süresini ve kafa ömrünü doğrudan etkiler; zamanında değiştirilmediğinde lens yanması ve kafa arızası gibi yüksek maliyetli sonuçlar doğurur.',
      'Lazer Online kataloğundaki koruma camları Precitec, Raytools, Bystronic, Nukon, HighYag, WSX ve Boci kesim/kaynak kafalarıyla uyumludur. D28, D30, D37 gibi yaygın çaplarda, farklı kalınlık ve kaplama seçenekleriyle bulunur. Japon ham maddeden üretilen yüksek ışın iletimli camlar, %99 üzerinde geçirgenlik ile güç kaybını en aza indirir.',
      'Doğru ölçüyü seçmek için kafanızın markası, modeli ve mevcut camın çap/kalınlık değerini esas alın. Emin değilseniz SKU veya kafa modelini bizimle paylaşın; uygun koruma camını birlikte belirleyelim.',
    ],
    faq: [
      {
        question: 'Fiber lazer koruma camı ne sıklıkla değişmeli?',
        answer:
          'Kullanıma, malzemeye ve gaz basıncına göre değişir; genelde kesim kalitesi düştüğünde, camda lekelenme/çukurlaşma görüldüğünde ya da delme süresi uzadığında değiştirilir. Yoğun üretimde günlük kontrol önerilir.',
      },
      {
        question: 'Koruma camının ölçüsünü nasıl belirlerim?',
        answer:
          'Kafanızdaki mevcut camın çapını ve kalınlığını (örn. D28x4, D30x5) ölçün veya kafa marka-modelini esas alın. Katalogda her ürünün ölçüsü ve uyumlu kafa bilgisi belirtilmiştir.',
      },
      {
        question: 'Hangi markalarla uyumlu?',
        answer:
          'Precitec, Raytools, Bystronic, Nukon, HighYag, WSX ve Boci başta olmak üzere yaygın fiber lazer kesim ve kaynak kafalarıyla uyumlu koruma camları sunuyoruz.',
      },
      {
        question: 'Koruma camı ile odak lensi aynı şey mi?',
        answer:
          'Hayır. Koruma camı, asıl odak lensinin önünde duran ve düzenli değiştirilen ucuz bir sarf parçasıdır; amacı pahalı lensi korumaktır.',
      },
    ],
    keywords: [
      'fiber lazer koruma camı', 'lens koruma camı', 'precitec koruma camı', 'raytools koruma camı',
      'bystronic koruma camı', 'd28 koruma camı', 'd30 koruma camı', 'lazer kesim koruma camı', 'koruyucu cam', 'lazer yedek parça', 'fused silica koruma camı', 'durma koruma camı', 'ermaksan koruma camı', 'bodor koruma camı',
    ],
  },

  seramikler: {
    metaTitle: 'Fiber Lazer Seramik Fiyatları – KT B2, Precitec, Raytools, Bystronic Uyumlu',
    metaDescription:
      'Fiber lazer kesim kafaları için seramik tutucular (KT B2, KTX). Precitec, Raytools, Nukon, HighYag ve Bystronic uyumlu, orijinal ve alternatif, stokta.',
    heading: 'Fiber Lazer Seramikleri',
    intro: [
      'Seramik tutucu (nozzle holder), fiber lazer kesim kafasında nozulu taşıyan ve kafayı elektriksel olarak yalıtan kritik sarf parçasıdır. Sensör sinyalinin doğru çalışması ve mesafe takibinin sağlıklı olması büyük ölçüde seramiğin durumuna bağlıdır; çatlamış veya aşınmış seramik, çarpma ve sinyal hatalarına yol açar.',
      'Kataloğumuzda KT B2, KTX ve eşdeğeri seramikler; Precitec, Raytools, Nukon, HighYag ve Bystronic kafalarıyla uyumlu olarak, orijinal ve maliyet avantajlı alternatif seçenekleriyle yer alır. Yüksek sıcaklık dayanımı ve hassas işçilik, kararlı kesim ve uzun ömür sağlar.',
      'Seramiğinizi seçerken kafa marka-modelini ve diş/ölçü tipini dikkate alın. SKU veya kafa modelini paylaşırsanız uygun seramiği hızla bulabiliriz.',
    ],
    faq: [
      {
        question: 'Seramik tutucu ne işe yarar?',
        answer:
          'Nozulu taşır ve kesim kafasını elektriksel olarak yalıtarak kapasitif mesafe sensörünün sac yüzeyini doğru algılamasını sağlar.',
      },
      {
        question: 'Seramik ne zaman değiştirilmeli?',
        answer:
          'Çatlak, kırık, yanık iz veya sinyal/mesafe hataları görüldüğünde değiştirilmelidir. Çarpma sonrası mutlaka kontrol edilmelidir.',
      },
      {
        question: 'KT B2 seramik hangi kafalarla uyumlu?',
        answer:
          'KT B2 tipi seramikler yaygın Precitec ve eşdeğeri kafalarda kullanılır; katalogda her ürünün uyumlu marka-model bilgisi belirtilmiştir.',
      },
      {
        question: 'Orijinal yerine alternatif seramik kullanılır mı?',
        answer:
          'Evet, ölçü ve dişi uyan kaliteli alternatif seramikler maliyet avantajı sağlar ve kararlı kesim verir. Uyumdan emin olmak için marka-model paylaşmanız yeterli.',
      },
    ],
    keywords: [
      'fiber lazer seramik', 'kt b2 seramik', 'precitec seramik', 'raytools seramik',
      'lazer kesim seramik tutucu', 'bystronic seramik', 'nozzle holder seramik',
    ],
  },

  nozullar: {
    metaTitle: 'Fiber Lazer Nozul Fiyatları – Single, Double, Fast Cut Kesim Nozulları',
    metaDescription:
      'Fiber lazer kesim nozulları: single, double ve fast cut tipleri, çeşitli çaplarda. Precitec, Raytools ve Bystronic uyumlu, orijinal ve alternatif, stokta.',
    heading: 'Fiber Lazer Nozulları',
    intro: [
      'Kesim nozulu, lazer ışınını ve kesim gazını (oksijen/azot) sac yüzeyine yönlendiren ve kesim genişliği ile kenar kalitesini belirleyen kritik sarf parçasıdır. Yanlış çap veya aşınmış nozul, çapak, eğik kenar ve gaz tüketiminde artışa neden olur.',
      'Kataloğumuzda single (tek katmanlı), double (çift katmanlı) ve fast cut nozullar; 0,8 mm’den başlayan farklı çaplarda, Precitec, Raytools ve Bystronic kafalarıyla uyumlu orijinal ve alternatif seçeneklerle bulunur. İnce saclarda küçük çaplı, kalın saclarda büyük çaplı nozullar tercih edilir.',
      'Malzeme türü, kalınlık ve kesim gazınıza göre doğru nozul tipini ve çapını seçmek kesim hızını ve maliyeti doğrudan etkiler. Seçimde destek için bizimle iletişime geçebilirsiniz.',
    ],
    faq: [
      {
        question: 'Single ve double nozul arasındaki fark nedir?',
        answer:
          'Single nozul genelde oksijenle kalın kesimde, double (çift katmanlı) nozul azotla ince-orta sac kesiminde daha temiz ve hızlı sonuç verir.',
      },
      {
        question: 'Nozul çapını nasıl seçerim?',
        answer:
          'Sac kalınlığına ve kesim gazına göre seçilir: ince saclarda küçük çap (örn. 1,0–1,5 mm), kalın saclarda büyük çap tercih edilir.',
      },
      {
        question: 'Nozul ne zaman değişmeli?',
        answer:
          'Ağzı deforme olduğunda, sıçrantı yapıştığında veya kesim kalitesi düştüğünde değiştirilmelidir; deforme nozul kesim kalitesini hızla bozar.',
      },
      {
        question: 'Hangi kafalarla uyumlu?',
        answer:
          'Precitec, Raytools ve Bystronic başta olmak üzere yaygın kesim kafalarıyla uyumlu single, double ve fast cut nozullar sunuyoruz.',
      },
    ],
    keywords: [
      'fiber lazer nozul', 'lazer kesim nozulu', 'single nozul', 'double nozul', 'fast cut nozul',
      'precitec nozul', 'raytools nozul',
    ],
  },

  lensler: {
    metaTitle: 'Fiber Lazer Lens Fiyatları – Odak ve Kolimatör Lensleri',
    metaDescription:
      'Fiber lazer kesim ve kaynak kafaları için odak (focus) ve kolimatör lensleri. Precitec, Raytools ve eşdeğeri kafalarla uyumlu optik sarf, stokta.',
    heading: 'Fiber Lazer Lensleri',
    intro: [
      'Odak (focus) ve kolimatör lensleri, fiber lazer ışınını şekillendiren ve odaklayan yüksek hassasiyetli optik parçalardır. Lensin kaplaması ve temizliği, kesim/kaynak kalitesini ve güç verimini doğrudan belirler; kirli veya yanmış lens odak kaymasına ve güç kaybına yol açar.',
      'Kataloğumuzda farklı odak uzaklıklarında (örn. F100, F150) kolimatör ve odak lensleri, Precitec, Raytools ve eşdeğeri kafalarla uyumlu olarak yer alır. Yüksek ışın iletimli kaplamalar, yüksek güçte dahi kararlı performans sağlar.',
      'Lens seçiminde kafa marka-modeli ve odak uzaklığı esas alınır. Doğru lensi belirlemek için kafa modelini paylaşmanız yeterlidir.',
    ],
    faq: [
      {
        question: 'Kolimatör lens ile odak lensi farkı nedir?',
        answer:
          'Kolimatör lens fiberden gelen ışını paralelleştirir; odak lensi ise bu ışını kesim/kaynak noktasında odaklar. İkisi birlikte çalışır.',
      },
      {
        question: 'Odak uzaklığını (F değeri) nasıl seçerim?',
        answer:
          'Kafanızın orijinal lens F değerini esas alın (örn. F100, F150). Farklı F değeri odak konumunu ve kesim karakterini değiştirir.',
      },
      {
        question: 'Lens ne zaman temizlenmeli veya değişmeli?',
        answer:
          'Yüzeyde leke, kaplama hasarı veya güç kaybı görüldüğünde temizlenir; kaplama yanmış/çizilmişse değiştirilmelidir.',
      },
    ],
    keywords: [
      'fiber lazer lens', 'odak lensi', 'kolimatör lens', 'focus lens', 'precitec lens', 'lazer optik',
    ],
  },

  'lazer-kaynak': {
    metaTitle: 'Lazer Kaynak Sarf Malzemeleri Fiyatları – Koruma Camı, Lens ve Nozul',
    metaDescription:
      'El tipi ve robotik fiber lazer kaynak makineleri için sarf malzemeleri: koruma camı, odak lensi, nozul ve temizlik ürünleri. Uyumlu, stokta, hızlı kargo.',
    heading: 'Lazer Kaynak Sarfları',
    intro: [
      'Fiber lazer kaynak makineleri de tıpkı kesim sistemleri gibi düzenli değişen sarf malzemelerine ihtiyaç duyar. Koruma camı, odak lensi, nozul ve temizlik ürünleri; kaynak dikiş kalitesini, nüfuziyeti ve kafa ömrünü doğrudan etkiler.',
      'Kataloğumuzda el tipi (handheld) ve robotik lazer kaynak kafalarıyla uyumlu koruma camları, odak lensleri, kaynak nozulları ve optik temizlik setleri yer alır. Doğru sarf seçimi, sıçrantıyı azaltır ve kararlı, temiz kaynak sağlar.',
      'Kaynak kafanızın marka-modeli veya mevcut sarf ölçüsünü paylaşırsanız, uyumlu ürünleri hızla belirleyebiliriz.',
    ],
    faq: [
      {
        question: 'Lazer kaynak makinesinde hangi sarflar değişir?',
        answer:
          'En sık koruma camı değişir; ayrıca odak lensi, kaynak nozulu ve optik temizlik malzemeleri düzenli olarak yenilenir.',
      },
      {
        question: 'Kaynak koruma camı kesim camından farklı mı?',
        answer:
          'Ölçü ve kaplama farklılıkları olabilir; kaynak kafanızın orijinal cam ölçüsünü esas almak en doğrusudur. Uyumdan emin olmak için model paylaşın.',
      },
      {
        question: 'El tipi lazer kaynak kafaları için sarf bulunur mu?',
        answer:
          'Evet. Yaygın el tipi (handheld) lazer kaynak kafalarıyla uyumlu koruma camı, nozul ve lens sarflarını stoktan sunuyoruz.',
      },
    ],
    keywords: [
      'lazer kaynak sarf', 'lazer kaynak koruma camı', 'lazer kaynak nozul', 'el tipi lazer kaynak sarf',
      'fiber lazer kaynak malzemeleri',
    ],
  },
}

export function getCategorySeo(slug: string): CategorySeo | undefined {
  return categorySeo[slug]
}

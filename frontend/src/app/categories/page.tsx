import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { getCategories } from '@/lib/static-data'

export const metadata = {
  title: 'Kategoriler',
  description: 'Lazer Online ürün kategorileri.',
  alternates: {
    canonical: '/categories/',
  },
  openGraph: {
    title: 'Kategoriler',
    description: 'Lazer Online ürün kategorileri.',
    url: '/categories/',
  },
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-surface px-6">
        <div className="container mx-auto">
          <div className="mb-10">
            <h1 className="font-headline text-4xl font-bold uppercase tracking-tight">Kategoriler</h1>
            <p className="text-outline mt-2">Koruma camı, seramik, nozul, lens ve lazer kaynak ürün grupları.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link key={category.id} href={`/category/${category.slug}`} className="bg-surface-container border border-outline-variant/20 p-8 hover:border-primary/40 transition-colors">
                <span className="text-[10px] text-outline uppercase tracking-widest">{category.count ?? 0} ürün</span>
                <h2 className="font-headline text-2xl font-bold uppercase mt-2">{category.name}</h2>
                <p className="text-outline text-sm mt-4">{category.description || 'Kategori detaylarını inceleyin.'}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

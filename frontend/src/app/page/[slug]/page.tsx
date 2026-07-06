import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Header } from '@/components/Header'
import { Hero } from '@/components/Hero'
import { CategoryShowcase } from '@/components/CategoryShowcase'
import { FeaturedProducts } from '@/components/FeaturedProducts'
import { IndustriesSection } from '@/components/IndustriesSection'
import { TrustSection } from '@/components/TrustSection'
import { Footer } from '@/components/Footer'
import { getPage, getPages } from '@/lib/static-data'
import { canonicalPath, stripHtml } from '@/lib/site'

interface PageRouteProps {
  params: Promise<{ slug: string }>
}

export const dynamicParams = false

export async function generateStaticParams() {
  const pages = await getPages()
  return pages.map((page) => ({ slug: page.slug }))
}

export async function generateMetadata({ params }: PageRouteProps) {
  const { slug } = await params
  const page = await getPage(slug)
  const title = page?.seo?.title || page?.title || 'Sayfa'
  const description = stripHtml(page?.seo?.metaDesc || page?.seo?.description || page?.content)
  const canonical = canonicalPath(`/page/${slug}`)

  return {
    title,
    description: description || undefined,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description: description || undefined,
      url: canonical,
    },
  }
}

export default async function PageRoute({ params }: PageRouteProps) {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) notFound()

  if (slug === 'about') {
    return (
      <>
        <Header />
        <main className="pt-16 min-h-screen bg-surface">
          <Hero />
          <CategoryShowcase />
          <FeaturedProducts />
          <IndustriesSection />
          <TrustSection />
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="pt-14">
        <div className="container mx-auto px-12 py-24">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-headline text-5xl font-bold uppercase tracking-tight mb-8 capitalize">
              {page.title}
            </h1>
            <div className="prose prose-invert max-w-none">
              <div
                className="text-on-surface leading-relaxed space-y-6"
                dangerouslySetInnerHTML={{ __html: page.content || '' }}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

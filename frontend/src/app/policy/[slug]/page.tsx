import { notFound } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { getPolicies, getPolicy } from '@/lib/static-data'
import { canonicalPath, stripHtml } from '@/lib/site'

interface PolicyPageProps {
  params: Promise<{ slug: string }>
}

export const dynamicParams = false

export async function generateStaticParams() {
  const policies = await getPolicies()
  return policies.map((policy) => ({ slug: policy.slug }))
}

export async function generateMetadata({ params }: PolicyPageProps) {
  const { slug } = await params
  const policy = await getPolicy(slug)
  const title = policy?.seo?.title || policy?.title || 'Yasal Metin'
  const description = stripHtml(policy?.seo?.metaDesc || policy?.seo?.description || policy?.content)
  const canonical = canonicalPath(`/policy/${slug}`)

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

export default async function PolicyPage({ params }: PolicyPageProps) {
  const { slug } = await params
  const policy = await getPolicy(slug)
  if (!policy) notFound()

  return (
    <>
      <Header />

      <main className="pt-14">
        <div className="container mx-auto px-12 py-24">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <span className="text-[10px] font-headline text-secondary uppercase tracking-widest">Yasal</span>
            </div>
            <h1 className="font-headline text-4xl font-bold uppercase tracking-tight mb-4">
              {policy.title}
            </h1>
            <div className="flex items-center gap-4 text-[10px] font-headline text-outline uppercase tracking-widest mb-12">
              <span>Yürürlük: {policy.effectiveDate || '2026-05-25'}</span>
              <span>|</span>
              <span>Sürüm: {policy.version || '1.0.0'}</span>
            </div>
            <div className="max-w-none">
              <div
                className="policy-content text-on-surface leading-relaxed"
                dangerouslySetInnerHTML={{ __html: policy.content || '' }}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}

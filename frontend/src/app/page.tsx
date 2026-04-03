import { Header } from '@/components/Header'
import { Hero } from '@/components/Hero'
import { CategoryShowcase } from '@/components/CategoryShowcase'
import { FeaturedProducts } from '@/components/FeaturedProducts'
import { IndustriesSection } from '@/components/IndustriesSection'
import { TrustSection } from '@/components/TrustSection'
import { Footer } from '@/components/Footer'

export default function HomePage() {
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

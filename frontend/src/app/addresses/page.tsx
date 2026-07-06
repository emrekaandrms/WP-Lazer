import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { AddressesPanel } from '@/components/account/AddressesPanel'

export default function AddressesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-surface px-4 pt-24 pb-10 md:px-8">
        <div className="container mx-auto">
          <AddressesPanel />
        </div>
      </main>
      <Footer />
    </>
  )
}

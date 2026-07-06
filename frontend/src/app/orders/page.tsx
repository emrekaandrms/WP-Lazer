import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { OrdersPanel } from '@/components/account/OrdersPanel'

export default function OrdersPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-surface px-4 pt-24 pb-10 md:px-8">
        <div className="container mx-auto">
          <OrdersPanel />
        </div>
      </main>
      <Footer />
    </>
  )
}

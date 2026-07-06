import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { OrderTrackingForm } from '@/components/account/OrderTrackingForm'

export const metadata = {
  title: 'Sipariş Takibi',
  description: 'Lazer Online sipariş numarası ve e-posta adresi ile sipariş durumu sorgulama.',
  alternates: {
    canonical: '/siparis-takibi/',
  },
}

export default function OrderTrackingPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-surface px-4 pt-24 pb-10 md:px-8">
        <div className="container mx-auto">
          <OrderTrackingForm />
        </div>
      </main>
      <Footer />
    </>
  )
}

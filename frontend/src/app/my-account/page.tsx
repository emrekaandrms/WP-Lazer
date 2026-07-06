import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { AccountDashboard } from '@/components/account/AccountDashboard'

export const metadata = {
  title: 'Hesabım',
  description: 'Lazer Online sipariş, adres ve hesap bilgileri.',
  alternates: {
    canonical: '/my-account/',
  },
}

export default function MyAccountPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-surface px-4 pt-24 pb-10 md:px-8">
        <div className="container mx-auto">
          <AccountDashboard />
        </div>
      </main>
      <Footer />
    </>
  )
}

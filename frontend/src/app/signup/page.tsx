import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { SignupForm } from '@/components/account/SignupForm'

export const metadata = {
  title: 'Hesap Oluştur',
  description: 'Lazer Online müşteri hesabı oluşturun.',
  alternates: {
    canonical: '/signup/',
  },
}

export default function SignupPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-surface px-4 pt-24 pb-10 md:px-8">
        <div className="container mx-auto">
          <SignupForm />
        </div>
      </main>
      <Footer />
    </>
  )
}

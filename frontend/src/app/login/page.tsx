import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { LoginForm } from '@/components/account/LoginForm'

export const metadata = {
  title: 'Giriş',
  description: 'Lazer Online müşteri hesabına giriş yapın.',
  alternates: {
    canonical: '/login/',
  },
}

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-surface px-4 pt-24 pb-10 md:px-8">
        <div className="container mx-auto">
          <LoginForm />
        </div>
      </main>
      <Footer />
    </>
  )
}

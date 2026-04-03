import Link from 'next/link'
import { Header } from '@/components/Header'

export default function SignupPage() {
  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-surface px-6">
        <div className="max-w-md mx-auto border border-outline-variant/20 bg-surface-container p-8">
          <h1 className="font-headline text-3xl font-bold uppercase mb-6">Sign Up</h1>
          <form className="space-y-4">
            <input className="w-full bg-surface-container-low p-3 border border-outline-variant/30" placeholder="Name" />
            <input className="w-full bg-surface-container-low p-3 border border-outline-variant/30" placeholder="Email" />
            <input
              type="password"
              className="w-full bg-surface-container-low p-3 border border-outline-variant/30"
              placeholder="Password"
            />
            <button className="w-full py-3 bg-primary-container text-on-primary-container font-headline font-bold uppercase">
              Create Account
            </button>
          </form>
          <p className="text-outline text-sm mt-4">
            Zaten hesabin var mi? <Link href="/login" className="text-primary">Login</Link>
          </p>
        </div>
      </main>
    </>
  )
}

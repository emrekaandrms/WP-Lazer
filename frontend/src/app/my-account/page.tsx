import { Header } from '@/components/Header'

const orders = [
  { id: 'PO-12041', date: '2026-04-01', status: 'Processing', total: '$2,340.00' },
  { id: 'PO-12017', date: '2026-03-26', status: 'Delivered', total: '$980.00' },
]

export default function MyAccountPage() {
  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-surface px-6">
        <div className="container mx-auto">
          <h1 className="font-headline text-4xl font-bold uppercase mb-8">My Account</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section className="border border-outline-variant/20 bg-surface-container p-6">
              <h2 className="font-headline text-lg font-bold uppercase mb-4">Profile</h2>
              <p className="text-outline">Engineer User</p>
              <p className="text-outline">engineer@precision.test</p>
            </section>
            <section className="border border-outline-variant/20 bg-surface-container p-6 lg:col-span-2">
              <h2 className="font-headline text-lg font-bold uppercase mb-4">Recent Orders</h2>
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="border border-outline-variant/20 p-4 flex items-center justify-between">
                    <div>
                      <p className="font-headline font-bold">{order.id}</p>
                      <p className="text-outline text-sm">{order.date}</p>
                    </div>
                    <p className="text-outline text-sm">{order.status}</p>
                    <p className="text-primary font-bold">{order.total}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  )
}

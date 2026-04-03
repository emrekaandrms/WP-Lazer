import './globals.css'
import type { Metadata } from 'next'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: {
    default: 'Precision CNC',
    template: '%s | Precision CNC',
  },
  description: 'High-performance industrial components for mission-critical CNC operations.',
  keywords: ['CNC', 'precision engineering', 'industrial components', 'bearings', 'linear rails'],
  authors: [{ name: 'Industrial Precision Ops' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    siteName: 'Precision CNC',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className="font-body bg-background text-on-surface min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

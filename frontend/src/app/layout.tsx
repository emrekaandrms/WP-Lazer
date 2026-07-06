import './globals.css'
import type { Metadata } from 'next'
import Script from 'next/script'
import { Manrope, Inter } from 'next/font/google'
import { Providers } from './providers'
import { siteUrl } from '@/lib/site'
import { JsonLd } from '@/components/JsonLd'
import { organizationLd, websiteLd } from '@/lib/seo'

// Self-hosted, non-render-blocking fonts (latin-ext for Turkish characters).
const manrope = Manrope({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
})
const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Lazer Online',
    template: '%s | Lazer Online',
  },
  description: 'Fiber lazer kesim ve kaynak makineleri için koruma camı, seramik, nozul, lens ve sarf malzemeleri.',
  keywords: ['lazer sarf malzemeleri', 'koruma camı', 'seramik', 'nozul', 'fiber lazer', 'Lazer Online'],
  authors: [{ name: 'Lazer Online' }],
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: ['/favicon-32x32.png'],
  },
  manifest: '/site.webmanifest',
  verification: {
    google: 'WaRmE1AmdirrjdHjZV6KxXSxc8n26JrUZz3e7cn67BE',
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: siteUrl,
    siteName: 'Lazer Online',
    images: [
      {
        url: '/brand/lazer-online-kare.png',
        width: 1254,
        height: 1254,
        alt: 'Lazer Online',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lazer Online',
    description: 'Fiber lazer kesim ve kaynak makineleri için koruma camı, seramik, nozul, lens ve sarf malzemeleri.',
    images: ['/brand/lazer-online-kare.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" className={`dark ${manrope.variable} ${inter.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
        />
      </head>
      <body className="font-body bg-background text-on-surface min-h-screen">
        <noscript
          dangerouslySetInnerHTML={{
            __html:
              '<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-MCPRNMBL" height="0" width="0" style="display:none;visibility:hidden"></iframe>',
          }}
        />
        <Script id="gtm-init" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-MCPRNMBL');`}
        </Script>
        <JsonLd data={[organizationLd(), websiteLd()]} />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-5VWGXS0B5B"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-5VWGXS0B5B');`}
        </Script>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

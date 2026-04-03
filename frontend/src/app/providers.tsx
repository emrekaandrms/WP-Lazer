'use client'

import { ApolloProviderWrapper } from '@/lib/apollo-provider'
import { CartProvider } from '@/lib/cart'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProviderWrapper>
      <CartProvider>{children}</CartProvider>
    </ApolloProviderWrapper>
  )
}

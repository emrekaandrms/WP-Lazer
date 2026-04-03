'use client'

import { ApolloProviderWrapper } from '@/lib/apollo-provider'

/**
 * Root providers wrapper
 * Consolidates all client-side providers
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <ApolloProviderWrapper>{children}</ApolloProviderWrapper>
}

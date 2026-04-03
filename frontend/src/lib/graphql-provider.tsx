'use client'

import { ApolloProviderWrapper } from '@/lib/apollo-provider'

export function GraphQLProvider({ children }: { children: React.ReactNode }) {
  return <ApolloProviderWrapper>{children}</ApolloProviderWrapper>
}

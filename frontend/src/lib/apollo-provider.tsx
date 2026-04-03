'use client'

import { ApolloClient, ApolloLink, ApolloProvider, InMemoryCache } from '@apollo/client'
import { HttpLink } from '@apollo/client/link/http'
import { onError } from '@apollo/client/link/error'

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8080/graphql'

/**
 * Error handling link for GraphQL errors
 */
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${JSON.stringify(locations)}, Path: ${path}, Operation: ${operation.operationName}`
      )
    })
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`)
  }
})

/**
 * HTTP link for GraphQL requests
 */
const httpLink = new HttpLink({
  uri: GRAPHQL_URL,
  credentials: 'same-origin',
})

/**
 * Apollo Client instance
 * Configured with:
 * - Error handling
 * - Cache policies for WooGraphQL data
 * - Optimistic UI support
 */
function createApolloClient() {
  return new ApolloClient({
    link: ApolloLink.from([errorLink, httpLink]),
    cache: new InMemoryCache({
      typePolicies: {
        RootQuery: {
          fields: {
            // WooGraphQL product connection merging
            products: {
              keyArgs: ['where'],
              merge(existing, incoming, { args }) {
                if (!args?.after) {
                  // First page - replace cache
                  return incoming
                }
                // Subsequent pages - append to existing
                return {
                  ...incoming,
                  nodes: [...(existing?.nodes || []), ...(incoming?.nodes || [])],
                }
              },
            },
            // Category merging
            productCategories: {
              keyArgs: false,
              merge(existing, incoming) {
                return {
                  ...incoming,
                  nodes: [...(existing?.nodes || []), ...(incoming?.nodes || [])],
                }
              },
            },
            // Single product by ID/SLUG - don't merge, replace
            product: {
              keyArgs: false,
              merge: false,
            },
            productCategory: {
              keyArgs: ['id'],
              merge: false,
            },
          },
        },
        // Product type policies
        Product: {
          keyFields: ['id'],
          fields: {
            // Optimistic updates for stock status
            stockStatus: {
              merge: true,
            },
          },
        },
      },
    }),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
        errorPolicy: 'all',
        notifyOnNetworkStatusChange: true,
      },
      query: {
        fetchPolicy: 'cache-first',
        errorPolicy: 'all',
      },
      mutate: {
        errorPolicy: 'all',
      },
    },
  })
}

/**
 * Apollo Provider wrapper component
 * Provides GraphQL client to the React component tree
 */
export function ApolloProviderWrapper({ children }: { children: React.ReactNode }) {
  const client = createApolloClient()

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}

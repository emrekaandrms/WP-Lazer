/**
 * GraphQL Client Configuration
 * Uses Apollo Client for WordPress WPGraphQL queries
 */

import { ApolloClient, InMemoryCache, createHttpLink, gql } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

const httpLink = createHttpLink({
  uri: process.env.WP_GRAPHQL_URL || 'http://localhost:8080/graphql',
})

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
    }
  }
})

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      RootQuery: {
        fields: {
          products: {
            keyArgs: ['where'],
            merge(existing, incoming) {
              return {
                ...incoming,
                nodes: [...(existing?.nodes || []), ...(incoming?.nodes || [])],
              }
            },
          },
          categories: {
            keyArgs: false,
            merge(existing, incoming) {
              return {
                ...incoming,
                nodes: [...(existing?.nodes || []), ...(incoming?.nodes || [])],
              }
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
  },
})

// GraphQL Query Definitions

export const GET_PRODUCTS = gql`
  query GetProducts($first: Int, $after: String, $where: RootQueryToProductConnectionWhereArgs) {
    products(first: $first, after: $after, where: $where) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        databaseId
        name
        slug
        description
        regularPrice
        salePrice
        price
        stockStatus
        stockQuantity
        sku
        image {
          sourceUrl
          altText
        }
        categories {
          nodes {
            id
            name
            slug
          }
        }
        attributes {
          nodes {
            id
            name
            label
            value
          }
        }
      }
    }
  }
`

export const GET_PRODUCT_BY_SLUG = gql`
  query GetProductBySlug($slug: ID!) {
    product(id: $slug, idType: SLUG) {
      id
      databaseId
      name
      slug
      description
      regularPrice
      salePrice
      price
      stockStatus
      stockQuantity
      sku
      image {
        sourceUrl
        altText
      }
      galleryImages {
        nodes {
          sourceUrl
          altText
        }
      }
      categories {
        nodes {
          id
          name
          slug
        }
      }
      attributes {
        nodes {
          id
          name
          label
          value
          visible
          variation
        }
      }
      related {
        nodes {
          id
          name
          slug
          price
          image {
            sourceUrl
            altText
          }
        }
      }
    }
  }
`

export const GET_CATEGORIES = gql`
  query GetCategories($first: Int) {
    productCategories(first: $first) {
      nodes {
        id
        databaseId
        name
        slug
        description
        count
        image {
          sourceUrl
          altText
        }
        children {
          nodes {
            id
            name
            slug
          }
        }
      }
    }
  }
`

export const GET_CATEGORY_BY_SLUG = gql`
  query GetCategoryBySlug($slug: ID!) {
    productCategory(id: $slug, idType: SLUG) {
      id
      databaseId
      name
      slug
      description
      count
      image {
        sourceUrl
        altText
      }
      products(first: 100) {
        nodes {
          id
          name
          slug
          price
          stockStatus
          image {
            sourceUrl
            altText
          }
        }
      }
    }
  }
`

export const GET_PAGE_BY_SLUG = gql`
  query GetPageBySlug($slug: ID!) {
    page(id: $slug, idType: URI) {
      id
      databaseId
      title
      slug
      content
      seo {
        title
        metaDesc
      }
    }
  }
`

export const GET_ALL_PAGES = gql`
  query GetAllPages {
    pages(first: 100) {
      nodes {
        id
        title
        slug
      }
    }
  }
`

export const GET_SITE_SETTINGS = gql`
  query GetSiteSettings {
    generalSettings {
      title
      description
    }
    options {
      headlessContactEmail
      headlessContactPhone
      headlessContactAddress
      headlessSocialLinkedin
      headlessSocialTwitter
    }
  }
`

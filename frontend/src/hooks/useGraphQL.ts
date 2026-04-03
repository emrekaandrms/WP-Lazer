'use client'

import { ApolloConsumer, ApolloClient, useQuery as useApolloQuery, useMutation as useApolloMutation, useLazyQuery } from '@apollo/client'
import { GET_PRODUCTS, GET_PRODUCT_BY_SLUG, GET_CATEGORIES, GET_CATEGORY_BY_SLUG, GET_PAGE_BY_SLUG, GET_ALL_PAGES, GET_SITE_SETTINGS } from '@/lib/graphql'
import type { Product, ProductCategory, Page, ProductsQueryVariables, ProductBySlugVariables, CategoryBySlugVariables, PageBySlugVariables } from '@/lib/graphql-types'

/**
 * Hook: useProducts
 * Fetches paginated product list with optional filters
 */
export function useProducts(variables?: ProductsQueryVariables) {
  const { data, loading, error, fetchMore } = useApolloQuery(GET_PRODUCTS, {
    variables: { first: 20, ...variables },
    notifyOnNetworkStatusChange: true,
  })

  return {
    products: data?.products?.nodes as Product[],
    pageInfo: data?.products?.pageInfo,
    loading,
    error,
    fetchMore,
  }
}

/**
 * Hook: useProductBySlug
 * Fetches single product by slug
 */
export function useProductBySlug(slug: string) {
  const { data, loading, error, refetch } = useApolloQuery(GET_PRODUCT_BY_SLUG, {
    variables: { slug },
    skip: !slug,
  })

  return {
    product: data?.product as Product | null,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook: useCategories
 * Fetches all product categories
 */
export function useCategories(first: number = 100) {
  const { data, loading, error } = useApolloQuery(GET_CATEGORIES, {
    variables: { first },
  })

  return {
    categories: data?.productCategories?.nodes as ProductCategory[],
    loading,
    error,
  }
}

/**
 * Hook: useCategoryBySlug
 * Fetches single category with its products
 */
export function useCategoryBySlug(slug: string) {
  const { data, loading, error, refetch } = useApolloQuery(GET_CATEGORY_BY_SLUG, {
    variables: { slug },
    skip: !slug,
  })

  return {
    category: data?.productCategory as ProductCategory | null,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook: usePageBySlug
 * Fetches static page content
 */
export function usePageBySlug(slug: string) {
  const { data, loading, error, refetch } = useApolloQuery(GET_PAGE_BY_SLUG, {
    variables: { slug: `/page/${slug}` },
    skip: !slug,
  })

  return {
    page: data?.page as Page | null,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook: useSiteSettings
 * Fetches site-wide settings from WordPress options
 */
export function useSiteSettings() {
  const { data, loading, error, refetch } = useApolloQuery(GET_SITE_SETTINGS)

  return {
    settings: data?.generalSettings,
    options: data?.options,
    loading,
    error,
    refetch,
  }
}

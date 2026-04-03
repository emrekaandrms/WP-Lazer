/**
 * GraphQL Type Definitions
 * TypeScript interfaces for WPGraphQL + WooGraphQL responses
 */

export interface ProductImage {
  sourceUrl: string
  altText: string
}

export interface ProductCategory {
  id: string
  databaseId: number
  name: string
  slug: string
  description?: string
  count?: number
  image?: ProductImage
  children?: {
    nodes: ProductCategory[]
  }
}

export interface ProductAttribute {
  id: string
  name: string
  label: string
  value: string
  visible?: boolean
  variation?: boolean
}

export interface Product {
  id: string
  databaseId: number
  name: string
  slug: string
  description?: string
  regularPrice?: string
  salePrice?: string
  price?: string
  stockStatus?: 'IN_STOCK' | 'OUT_OF_STOCK' | 'ON_BACKORDER'
  stockQuantity?: number
  sku?: string
  image?: ProductImage
  galleryImages?: {
    nodes: ProductImage[]
  }
  categories?: {
    nodes: ProductCategory[]
  }
  attributes?: {
    nodes: ProductAttribute[]
  }
  related?: {
    nodes: Product[]
  }
}

export interface PageInfo {
  hasNextPage: boolean
  endCursor?: string
}

export interface ProductConnection {
  pageInfo: PageInfo
  nodes: Product[]
}

export interface CategoryConnection {
  nodes: ProductCategory[]
}

export interface SEOMeta {
  title?: string
  metaDesc?: string
}

export interface Page {
  id: string
  databaseId: number
  title: string
  slug: string
  content?: string
  seo?: SEOMeta
}

export interface SiteSettings {
  title: string
  description: string
  contact?: {
    email?: string
    phone?: string
    address?: string
  }
  social?: {
    linkedin?: string
    twitter?: string
  }
}

// Query Variables

export interface ProductsQueryVariables {
  first?: number
  after?: string
  where?: {
    category?: string
    tag?: string
    search?: string
    orderby?: string
    order?: 'ASC' | 'DESC'
  }
}

export interface ProductBySlugVariables {
  slug: string
}

export interface CategoryBySlugVariables {
  slug: string
}

export interface PageBySlugVariables {
  slug: string
}

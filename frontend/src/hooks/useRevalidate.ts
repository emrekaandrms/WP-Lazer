'use client'

import { revalidatePath, revalidateTag } from 'next/cache'

const REVALIDATE_SECRET = process.env.NEXT_PUBLIC_API_REVALIDATE_SECRET || 'development-secret'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

interface RevalidateOptions {
  paths?: string[]
  tags?: string[]
  secret?: string
}

/**
 * Hook: useRevalidate
 * Client-side hook for triggering ISR revalidation
 *
 * Usage:
 *   const { revalidate, revalidating } = useRevalidate()
 *   await revalidate({ paths: ['/', '/category/bearings'] })
 */
export function useRevalidate() {
  const revalidate = async (options: RevalidateOptions = {}) => {
    const { paths = [], tags = [], secret = REVALIDATE_SECRET } = options

    const results = {
      success: true,
      paths: [] as string[],
      tags: [] as string[],
      errors: [] as string[],
    }

    // Direct revalidation via Next.js (faster for same-server)
    for (const path of paths) {
      try {
        revalidatePath(path)
        results.paths.push(path)
      } catch (e) {
        results.errors.push(`path:${path}`)
        results.success = false
      }
    }

    for (const tag of tags) {
      try {
        revalidateTag(tag)
        results.tags.push(tag)
      } catch (e) {
        results.errors.push(`tag:${tag}`)
        results.success = false
      }
    }

    return results
  }

  const revalidateViaAPI = async (options: RevalidateOptions = {}) => {
    const { paths = [], tags = [], secret = REVALIDATE_SECRET } = options

    if (paths.length === 0 && tags.length === 0) {
      return { success: false, message: 'No paths or tags provided' }
    }

    try {
      // Build query string for GET requests
      const params = new URLSearchParams()
      params.set('secret', secret)

      if (paths.length === 1) {
        params.set('path', paths[0])
      }

      const baseUrl = `${SITE_URL}/api/revalidate`
      const url = paths.length === 1 ? `${baseUrl}?${params.toString()}` : baseUrl

      const response = await fetch(url, {
        method: paths.length === 1 ? 'GET' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-revalidate-secret': secret,
        },
        body: paths.length !== 1 ? JSON.stringify({ paths, tags }) : undefined,
      })

      if (!response.ok) {
        return {
          success: false,
          message: `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      const data = await response.json()
      return data
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  return { revalidate, revalidateViaAPI }
}

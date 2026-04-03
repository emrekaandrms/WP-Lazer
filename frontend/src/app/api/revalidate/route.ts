import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

/**
 * API Route: /api/revalidate
 * Handles on-demand ISR revalidation after content updates
 *
 * Query params:
 *   - path: The route path to revalidate (e.g., /category/bearings)
 *   - secret: Revalidation secret for authentication
 *
 * Example: GET /api/revalidate?path=/&secret=my-secret
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const path = searchParams.get('path')
  const secret = searchParams.get('secret')
  const tag = searchParams.get('tag')

  // Validate secret
  const expectedSecret = process.env.NEXT_PUBLIC_API_REVALIDATE_SECRET

  if (!secret || secret !== expectedSecret) {
    return NextResponse.json(
      { revalidated: false, message: 'Invalid secret' },
      { status: 401 }
    )
  }

  // Revalidate by path or tag
  try {
    if (path) {
      revalidatePath(path)
      return NextResponse.json({
        revalidated: true,
        path,
        timestamp: new Date().toISOString(),
      })
    }

    if (tag) {
      revalidateTag(tag)
      return NextResponse.json({
        revalidated: true,
        tag,
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json(
      { revalidated: false, message: 'Missing path or tag parameter' },
      { status: 400 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        revalidated: false,
        message: 'Revalidation failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST handler for webhook-based revalidation
 * Accepts JSON body with paths/tags to revalidate
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paths = [], tags = [] } = body

    const secret = request.headers.get('x-revalidate-secret')
    const expectedSecret = process.env.NEXT_PUBLIC_API_REVALIDATE_SECRET

    if (!secret || secret !== expectedSecret) {
      return NextResponse.json(
        { revalidated: false, message: 'Invalid secret' },
        { status: 401 }
      )
    }

    const results = {
      paths: [] as string[],
      tags: [] as string[],
      errors: [] as string[],
    }

    // Revalidate paths
    for (const path of paths) {
      try {
        revalidatePath(path)
        results.paths.push(path)
      } catch (e) {
        results.errors.push(`path:${path} - ${e instanceof Error ? e.message : 'Unknown'}`)
      }
    }

    // Revalidate tags
    for (const tag of tags) {
      try {
        revalidateTag(tag)
        results.tags.push(tag)
      } catch (e) {
        results.errors.push(`tag:${tag} - ${e instanceof Error ? e.message : 'Unknown'}`)
      }
    }

    return NextResponse.json({
      revalidated: results.errors.length === 0,
      results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        revalidated: false,
        message: 'Invalid request body',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 400 }
    )
  }
}

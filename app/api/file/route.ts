import { get } from '@vercel/blob'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { files } from '@/lib/db/schema'

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const pathname = new URL(request.url).searchParams.get('pathname')
  if (!pathname) return NextResponse.json({ error: 'Missing pathname' }, { status: 400 })
  const owned = await db.select({ pathname: files.pathname }).from(files).where(eq(files.userId, session.user.id))
  if (!owned.some((file) => file.pathname === pathname)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const result = await get(pathname, { access: 'private', ifNoneMatch: request.headers.get('if-none-match') ?? undefined })
  if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (result.statusCode === 304) return new NextResponse(null, { status: 304, headers: { ETag: result.blob.etag, 'Cache-Control': 'private, no-cache' } })
  return new NextResponse(result.stream, { headers: { 'Content-Type': result.blob.contentType, ETag: result.blob.etag, 'Cache-Control': 'private, no-cache', 'Content-Disposition': `attachment; filename="${pathname.split('/').pop() ?? 'download'}"` } })
}

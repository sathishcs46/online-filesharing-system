import { put } from '@vercel/blob'
import { and, desc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { files } from '@/lib/db/schema'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return null
  return session.user.id
}

export async function GET() {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const rows = await db.select().from(files).where(eq(files.userId, userId)).orderBy(desc(files.createdAt))
  return NextResponse.json({ files: rows })
}

export async function POST(request: Request) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const formData = await request.formData()
  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) return NextResponse.json({ error: 'A file is required' }, { status: 400 })
  if (file.size > 100 * 1024 * 1024) return NextResponse.json({ error: 'File exceeds the 100 MB limit' }, { status: 413 })
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const blob = await put(`uploads/${userId}/${crypto.randomUUID()}-${safeName}`, file, { access: 'private' })
  const [created] = await db.insert(files).values({ id: crypto.randomUUID(), userId, name: file.name, pathname: blob.pathname, size: file.size, mimeType: file.type || 'application/octet-stream' }).returning()
  return NextResponse.json({ file: created }, { status: 201 })
}

export async function DELETE(request: Request) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => null) as { id?: string } | null
  if (!body?.id) return NextResponse.json({ error: 'File id is required' }, { status: 400 })
  const deleted = await db.delete(files).where(and(eq(files.id, body.id), eq(files.userId, userId))).returning({ pathname: files.pathname })
  if (!deleted.length) return NextResponse.json({ error: 'File not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}

import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { files } from '@/lib/db/schema'

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const rows = await db.select({ name: files.name, size: files.size, mimeType: files.mimeType, visibility: files.visibility, createdAt: files.createdAt }).from(files).where(eq(files.userId, session.user.id))
  const csv = ['Name,Size (bytes),MIME type,Visibility,Created at', ...rows.map((file) => [file.name, file.size, file.mimeType, file.visibility, file.createdAt.toISOString()].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))].join('\n')
  return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="cloudshare-file-report.csv"' } })
}

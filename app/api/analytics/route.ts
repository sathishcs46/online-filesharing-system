import { count, eq, sum } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { files } from '@/lib/db/schema'

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const [summary] = await db.select({ totalFiles: count(files.id), storageBytes: sum(files.size) }).from(files).where(eq(files.userId, session.user.id))
  return NextResponse.json({ totalFiles: Number(summary?.totalFiles ?? 0), storageBytes: Number(summary?.storageBytes ?? 0), storageLimitBytes: 100 * 1024 * 1024 * 1024 })
}

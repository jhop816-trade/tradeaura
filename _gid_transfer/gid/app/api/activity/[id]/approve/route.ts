import { NextResponse } from 'next/server'
import { approveActivity } from '@/lib/activityLog'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await approveActivity(id)
  return NextResponse.json({ ok: true })
}

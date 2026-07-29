import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin-auth'
import { validateVehicle } from '@/lib/vehicle-validation'

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = validateVehicle(await req.json().catch(() => null))
  if (!result.ok) {
    return NextResponse.json({ error: result.errors.join(' ') }, { status: 400 })
  }

  const supabase = await createServiceClient()
  const { data, error } = await supabase.from('vehicles').insert(result.value).select().single()

  if (error) {
    const message = error.code === '23505'
      ? 'A vehicle with that URL slug already exists.'
      : error.message
    return NextResponse.json({ error: message }, { status: 400 })
  }

  return NextResponse.json({ vehicle: data }, { status: 201 })
}

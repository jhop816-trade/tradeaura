import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin-auth'
import { validateVehicle } from '@/lib/vehicle-validation'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const result = validateVehicle(await req.json().catch(() => null))
  if (!result.ok) {
    return NextResponse.json({ error: result.errors.join(' ') }, { status: 400 })
  }

  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('vehicles')
    .update(result.value)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    const message = error.code === '23505'
      ? 'A vehicle with that URL slug already exists.'
      : error.message
    return NextResponse.json({ error: message }, { status: 400 })
  }

  return NextResponse.json({ vehicle: data })
}

/**
 * Retires a vehicle rather than deleting it — existing bookings reference the
 * row, and the rental history has to stay intact.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const supabase = await createServiceClient()
  const { error } = await supabase.from('vehicles').update({ active: false }).eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

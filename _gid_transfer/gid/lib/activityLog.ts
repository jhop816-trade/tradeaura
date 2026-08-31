import { createServiceSupabase } from './supabase/server'
import type { ActivityLogEntry } from './types'

interface LogActivityInput {
  action: string
  category: ActivityLogEntry['category']
  status: ActivityLogEntry['status']
  details?: Record<string, unknown>
  approvalRequired?: boolean
}

export async function logActivity(input: LogActivityInput): Promise<void> {
  const supabase = createServiceSupabase()
  await supabase.from('activity_log').insert({
    action: input.action,
    category: input.category,
    status: input.status,
    details: input.details ?? null,
    approval_required: input.approvalRequired ?? false,
  })
}

export async function getActivityLog(): Promise<ActivityLogEntry[]> {
  const supabase = createServiceSupabase()
  const { data } = await supabase
    .from('activity_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)
  return (data as ActivityLogEntry[] | null) ?? []
}

export async function approveActivity(id: string): Promise<void> {
  const supabase = createServiceSupabase()
  await supabase
    .from('activity_log')
    .update({ approved_at: new Date().toISOString(), status: 'success' })
    .eq('id', id)
}

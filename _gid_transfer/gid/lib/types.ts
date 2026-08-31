export interface ActivityLogEntry {
  id: string
  created_at: string
  action: string
  category: 'ads' | 'business' | 'reviews' | 'website' | 'system'
  status: 'success' | 'failure' | 'pending_approval'
  details: Record<string, unknown> | null
  approval_required: boolean
  approved_at: string | null
}

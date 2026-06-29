import type { MetadataRoute } from 'next'
import { createServiceClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  const supabase = await createServiceClient()
  const { data: vehicles } = await supabase.from('vehicles').select('slug').eq('active', true)

  const vehicleUrls = (vehicles ?? []).map(v => ({
    url: `${siteUrl}/fleet/${v.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [
    { url: siteUrl, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/fleet`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/booking`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/about`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/reviews`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/contact`, changeFrequency: 'monthly', priority: 0.6 },
    ...vehicleUrls,
  ]
}

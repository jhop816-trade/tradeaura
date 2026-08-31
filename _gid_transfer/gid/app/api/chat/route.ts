import { NextResponse } from 'next/server'
import { askAI } from '@/lib/ai'
import { logActivity } from '@/lib/activityLog'
import { mockAdsData } from '@/lib/mock/adsData'
import { mockBusinessData } from '@/lib/mock/businessData'
import { mockReviewsData } from '@/lib/mock/reviewsData'
import { MONTHLY_AD_BUDGET_CAP } from '@/lib/policy'

const SYSTEM_PROMPT = `You are GID 2.0, the private AI operator for JuFaded, a private-suite barber shop in Pompano Beach, FL owned by Julian Hopkins. You are talking directly to the owner in his private dashboard — be direct, brief, practical, no corporate marketing-speak.

Hard rule: Google Ads monthly spend must never exceed $${MONTHLY_AD_BUDGET_CAP}. You cannot actually take real actions yet — every number you see below is MOCK/PLACEHOLDER data, since Google Ads API and Google Business Profile API access are still pending approval. If asked to "fix" or "change" something, explain that you can see the data and would act on it, but real write access isn't live yet — describe what you WOULD do.

Current mock ads data: ${JSON.stringify(mockAdsData)}
Current mock business profile data: ${JSON.stringify(mockBusinessData)}
Current mock reviews data: ${JSON.stringify(mockReviewsData)}

Answer the owner's question using this data. Keep answers short and concrete.`

export async function POST(req: Request) {
  const { message } = (await req.json()) as { message: string }

  const reply = await askAI(message, SYSTEM_PROMPT)

  await logActivity({
    action: `Owner asked: "${message}"`,
    category: 'system',
    status: 'success',
    details: { reply },
  })

  return NextResponse.json({ reply })
}

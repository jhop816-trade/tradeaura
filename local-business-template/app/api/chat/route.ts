import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { business } from '@/lib/business'

function buildSystemPrompt(): string {
  const hours = Object.entries(business.hours)
    .map(([day, time]) => `  ${day}: ${time}`)
    .join('\n')

  const services = business.services
    .map((s) => `  - ${s.name}: ${s.description} (${s.price})`)
    .join('\n')

  const faqs = business.faqs
    .map((f) => `  Q: ${f.question}\n  A: ${f.answer}`)
    .join('\n\n')

  // EDIT THIS PROMPT PER CLIENT — swap business.json and this system prompt text
  return `You are the virtual assistant for ${business.name}, a local business located at ${business.address}.

CONTACT INFO:
  Phone: ${business.phone}
  Email: ${business.email}
  Address: ${business.address}

HOURS:
${hours}

SERVICES WE OFFER:
${services}

FREQUENTLY ASKED QUESTIONS:
${faqs}

YOUR JOB:
1. Answer questions about our services, hours, pricing, and policies in a warm, professional tone.
2. If a patient wants to book an appointment or asks how to schedule, gently ask for:
   - Their name
   - Phone number or email
   - What service they're interested in or what they need help with
3. Once you have collected their contact info, respond ONLY with valid JSON in EXACTLY this format (no extra text):
   {"message": "your friendly confirmation message here", "lead": {"name": "...", "phone": "...", "email": "...", "reason": "..."}}
   Use null for any lead field you don't have.
4. For all other responses, reply with plain conversational text — no JSON, no markdown.
5. Keep responses concise (2-3 sentences max unless a longer answer is clearly needed).
6. Never discuss competitors, give medical diagnoses, or make promises about treatment outcomes.`
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Invalid messages' }, { status: 400 })
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: buildSystemPrompt(),
      // Ensure conversation starts with a user message
      messages: messages
        .filter((m: { role: string }) => m.role === 'user' || m.role === 'assistant')
        .slice(-20),
    })

    const raw = response.content[0]?.type === 'text' ? response.content[0].text : ''

    // Strip markdown code fences Claude sometimes wraps around JSON
    const cleaned = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim()

    let message = raw
    let lead: Record<string, string | null> | null = null

    try {
      const parsed = JSON.parse(cleaned)
      if (parsed.message) {
        message = parsed.message
        lead = parsed.lead ?? null
      }
    } catch {
      // Plain text — use raw response as-is
      message = raw
    }

    // Save lead to Supabase if contact info was captured
    if (lead && (lead.name || lead.phone || lead.email)) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      await supabase.from('leads').insert({
        business_slug: business.slug,
        name: lead.name ?? null,
        phone: lead.phone ?? null,
        email: lead.email ?? null,
        message: lead.reason ?? null,
        source: 'chat',
      })
    }

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { message: 'Sorry, I ran into an issue. Please call us directly.' },
      { status: 500 }
    )
  }
}

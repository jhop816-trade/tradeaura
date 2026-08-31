import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

/**
 * Single entry point for talking to an AI model. Deliberately not an
 * interface/provider-abstraction — there's only one caller (the chat route)
 * and one provider in use. Swapping models later means editing this file,
 * not rewriting the app.
 */
export async function askAI(userMessage: string, systemPrompt: string): Promise<string> {
  const res = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 800,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })
  const block = res.content.find((c) => c.type === 'text')
  return block && block.type === 'text' ? block.text : "Didn't catch that."
}

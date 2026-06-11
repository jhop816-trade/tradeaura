export const BRAND_VOICE = `
You are writing marketing content for TradeAura — an AI-powered trading journal with trade grading, LLM coaching feedback, and performance analytics.
Audience: retail traders, day traders, prop firm candidates, ICT/SMC traders.
Tone: confident, knowledgeable, direct — like a serious trader who also builds tools. Not hype. Not salesy.
Always highlight: AI coaching, trade grading, personalized feedback, journaling automation.
Never say: "guaranteed profits", "get rich", "100% win rate", or anything that sounds like a financial promise.
Never add financial advice disclaimers — just avoid financial promise language entirely.
`.trim();

export function XPostPrompt(
  slot: 'morning' | 'midday' | 'afternoon' | 'evening',
  recentTopics: string[],
): string {
  const slotContext = {
    morning:
      'Motivational trading mindset post for market open. Could be about discipline, preparation, or the right mental state.',
    midday:
      'Market observation or trading discipline tip for mid-session. Could reference common mid-day mistakes.',
    afternoon:
      'Risk management insight or trade review prompt. Encourage traders to log and review their trades.',
    evening:
      'Reflection or journal reminder for end of day. Encourage reviewing the day\'s trades with TradeAura.',
  }[slot];

  const avoid =
    recentTopics.length > 0 ? `Recently covered topics to avoid: ${recentTopics.join(', ')}.` : '';

  return `${BRAND_VOICE}

Write a single X/Twitter post (max 280 characters) for the ${slot} time slot.
Context: ${slotContext}
${avoid}

Output only the tweet text. No quotes, no labels, no hashtag spam (max 2 hashtags if any).
Make it feel authentic and valuable, not like an ad.`;
}

export function InstagramPostPrompt(recentTopics: string[]): string {
  const avoid =
    recentTopics.length > 0 ? `Recently covered topics to avoid: ${recentTopics.join(', ')}.` : '';

  return `${BRAND_VOICE}

Write an Instagram post for TradeAura.
${avoid}

Format:
- Hook line (attention-grabbing first line)
- 3-5 lines of value (trading insight, tip, or TradeAura feature highlight)
- CTA: "Link in bio to try TradeAura free"
- Hashtags on the last line: use 5-8 from this list: #trading #tradingjournal #forextrading #gold #xauusd #ict #smartmoneyconcepts #propfirm #ftmo #tradeaura #aitrading #daytrader

Output only the post text.`;
}

export function FacebookPostPrompt(recentTopics: string[]): string {
  const avoid =
    recentTopics.length > 0 ? `Recently covered topics to avoid: ${recentTopics.join(', ')}.` : '';

  return `${BRAND_VOICE}

Write a Facebook post for TradeAura. Write in a blog-style tone — more context and explanation than a tweet.
${avoid}

Structure:
- Opening question or bold statement
- 2-3 paragraphs of insight or value
- How TradeAura helps with this
- CTA: visit tradeaura.com

Output only the post text. No hashtags.`;
}

export function TikTokScriptPrompt(): string {
  const hooks = [
    'Your trading journal is lying to you',
    'I let AI grade my last 30 trades — here\'s what it found',
    'Most traders lose because they never review their trades properly',
    'This is what a 1:3 RR setup actually looks like',
    'Stop guessing your mistakes — TradeAura finds them for you',
  ];
  const hook = hooks[Math.floor(Math.random() * hooks.length)];

  return `${BRAND_VOICE}

Write a 30-60 second TikTok video script for TradeAura.
The hook is: "${hook}"

Structure:
- Hook (first 2 seconds — must be the exact hook above, delivered with urgency)
- Problem (the pain point traders feel)
- Solution (how TradeAura solves it — AI coaching, trade grading, journaling)
- CTA: "Link in bio to try TradeAura free"

Format the output as:
HOOK: [hook line]
SCRIPT: [full script, written as spoken words — natural, direct, no filler]
CAPTION: [Instagram/TikTok caption with 3-5 hashtags]

Keep the script under 150 words.`;
}

export function WeekCalendarPrompt(recentTopics: string[]): string {
  const avoid =
    recentTopics.length > 0 ? `Recently covered topics to avoid: ${recentTopics.join(', ')}.` : '';

  return `${BRAND_VOICE}

Generate a 7-day content calendar for TradeAura covering Instagram and TikTok — 14 pieces total (2 per day).
${avoid}

For each of the 7 days, produce exactly 2 items. Format each item as:
DAY: [1-7]
PLATFORM: [instagram|tiktok]
TITLE: [short content title, max 8 words]
CONTENT: [full caption for instagram, or full script for tiktok]
---

Instagram: same format as existing captions — hook, 3-5 value lines, CTA, hashtags.
TikTok: same format as existing scripts — visual directions with | separators, hook first, CTA last.
Keep brand voice consistent. No repeated themes across the 14 pieces.`;
}

export function AuditReportPrompt(recentPosts: string[]): string {
  return `${BRAND_VOICE}

You are auditing the last 7 days of TradeAura social media content.
Recent posts:
${recentPosts.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Provide a brief audit:
1. Themes covered (list them)
2. Themes NOT yet covered that would resonate with our audience
3. Tone consistency rating (1-10)
4. One specific recommendation for next week

Output as structured text. Be concise.`;
}

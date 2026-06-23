export const BRAND_VOICE = `
You are writing marketing content for TradeAura — an AI-powered trading journal with trade grading, LLM coaching feedback, and performance analytics.
Audience: retail traders, day traders, prop firm candidates, ICT/SMC traders.
Tone: confident, knowledgeable, direct — like a serious trader who also builds tools. Not hype. Not salesy.
Never say: "guaranteed profits", "get rich", "100% win rate", or anything that sounds like a financial promise.
Never add financial advice disclaimers — just avoid financial promise language entirely.
`.trim();

const FEATURE_ANGLES = `
TradeAura features to rotate through when highlighting the product:

1. AI Trade Grading — after logging a trade, AI grades it A–F based on your own rules and discipline, not generic advice. Shows exactly where you broke your plan.
2. Trade Journal — log every trade: symbol, direction, entry/exit, P&L, setup name, mood, notes. Each log is a data point that builds your edge over time.
3. Performance Stats — win rate, profit factor, best/worst setups, avg win vs avg loss, streak data. The more you log, the more your patterns surface.
4. Playbook — tracks which specific setups make money and which don't. Built automatically from your trade history — no manual input needed.
5. AI Coach & Daily Market Prep — get a market briefing before the open, chat with your AI coach about any trade decision, get pattern analysis on your performance data.
6. Review Mode — weekly AI performance review that identifies your top 3 strengths, top 3 weaknesses, and one focus area for next week based on your actual trade history.
7. Education Center — built-in courses on stocks, futures, options, and trading psychology. Free to start, built for active traders.
8. Calendar View — see your entire trading month at a glance. P&L by day, best days, worst days, trade frequency patterns.

When writing feature-focused content, be specific about what the feature does and how it helps — not just "AI-powered journaling" but "your AI grades your last trade based on your own rules."
`.trim();

export function XPostPrompt(
  slot: 'morning' | 'midday' | 'afternoon' | 'evening',
  recentTopics: string[],
): string {
  const slotContext = {
    morning:
      'Pre-market mindset or preparation tip. Mix between general trader mindset AND TradeAura-specific feature callouts (e.g. AI grading, daily prep briefing, journaling habit).',
    midday:
      'Mid-session discipline or trade management tip. Occasionally tie back to how TradeAura helps (logging trades in real-time, reviewing setup performance).',
    afternoon:
      'Risk management or trade review content. Encourage traders to log and review — mention a specific TradeAura feature like Playbook or Stats.',
    evening:
      'End-of-day reflection. Encourage reviewing the day with TradeAura — mention AI grading, weekly review, or performance patterns.',
  }[slot];

  const avoid =
    recentTopics.length > 0 ? `Recently covered topics to avoid: ${recentTopics.join(', ')}.` : '';

  return `${BRAND_VOICE}

${FEATURE_ANGLES}

Write a single X/Twitter post (max 280 characters) for the ${slot} time slot.
Context: ${slotContext}
${avoid}

Rotate between: (a) pure trading wisdom/tips — no product mention, (b) soft TradeAura feature mention woven into the tip, (c) direct feature callout. Vary the angle so the feed doesn't feel like constant ads.

Output only the tweet text. No quotes, no labels, no hashtag spam (max 2 hashtags if any).
Make it feel authentic and valuable, not like an ad.`;
}

export function InstagramPostPrompt(recentTopics: string[]): string {
  const avoid =
    recentTopics.length > 0 ? `Recently covered topics to avoid: ${recentTopics.join(', ')}.` : '';

  return `${BRAND_VOICE}

${FEATURE_ANGLES}

Write an Instagram post for TradeAura.
${avoid}

Roughly half of posts should be feature spotlights — pick ONE specific TradeAura feature and show exactly how it helps a trader. Be concrete: "TradeAura's AI graded my trade a C and told me I entered 3 minutes before the candle closed — that's the kind of feedback that changes habits." The other half can be general trading wisdom/tips that organically mention TradeAura.

Format:
- Hook line (attention-grabbing first line — could be a question, a stat, a bold statement, or a specific feature moment)
- 3-5 lines of value (trading insight or specific feature walkthrough)
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
    'This one screen told me exactly why I keep revenge trading',
    'Stop guessing your mistakes — TradeAura finds them for you',
    'I pulled up my Playbook and it changed everything',
    'Your win rate means nothing without this',
    'This is what your trading stats actually look like',
    'I asked AI to review my worst trading week — here\'s what it said',
    'The feature that made me stop overtrading',
  ];
  const hook = hooks[Math.floor(Math.random() * hooks.length)];

  const featureScripts = [
    'Focus on AI trade grading: show the moment after logging a trade, AI gives it a grade and explains exactly what rule was broken.',
    'Focus on Performance Stats: show how win rate looks different once you filter by setup name — some setups are +EV, others are killing the account.',
    'Focus on Playbook: explain how it automatically builds from trade history and shows which setups to keep trading and which to cut.',
    'Focus on AI Coach: daily market prep briefing before the open, then reviewing a specific trade with the AI mid-session.',
    'Focus on Trade Journal: the actual habit — logging a trade takes 60 seconds, and that log turns into data that finds your edge over months.',
  ];
  const featureFocus = featureScripts[Math.floor(Math.random() * featureScripts.length)];

  return `${BRAND_VOICE}

${FEATURE_ANGLES}

Write a 30-60 second TikTok video script for TradeAura.
The hook is: "${hook}"
Feature focus for this script: ${featureFocus}

Structure:
- Hook (first 2 seconds — must be the exact hook above, delivered with urgency)
- Problem (the specific pain point this feature solves)
- Solution (walk through the specific feature concretely — what does the trader see/do?)
- CTA: "Link in bio to try TradeAura free"

Format the output as:
HOOK: [hook line]
SCRIPT: [full script, written as spoken words — natural, direct, no filler]
CAPTION: [Instagram/TikTok caption with 3-5 hashtags]

Keep the script under 150 words. Be specific — name the feature, describe what it shows.`;
}

export function WeekCalendarPrompt(recentTopics: string[]): string {
  const avoid =
    recentTopics.length > 0 ? `Recently covered topics to avoid: ${recentTopics.join(', ')}.` : '';

  return `${BRAND_VOICE}

${FEATURE_ANGLES}

Generate a 7-day content calendar for TradeAura covering Instagram and TikTok — 14 pieces total (2 per day).
${avoid}

Content mix rule: at least 5 of the 14 pieces must be direct feature spotlights — each focusing on ONE specific TradeAura feature (AI Grading, Stats, Playbook, Journal, AI Coach, Review, Education, Calendar). The remaining pieces can be general trading tips that organically mention TradeAura. Do not repeat the same feature in the same week.

For each of the 7 days, produce exactly 2 items. Format each item as:
DAY: [1-7]
PLATFORM: [instagram|tiktok]
TITLE: [short content title, max 8 words]
CONTENT: [full caption for instagram, or full script for tiktok]
---

Instagram: hook, 3-5 value lines, CTA "Link in bio to try TradeAura free", hashtags (5-8).
TikTok: HOOK / SCRIPT / CAPTION format — hook first, specific feature walkthrough, CTA last.
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

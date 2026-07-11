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

export function InstagramPostPrompt(recentTopics: string[], weights?: Record<string, number>): string {
  const avoid =
    recentTopics.length > 0 ? `Recently covered topics to avoid: ${recentTopics.join(', ')}.` : '';

  const weightHint =
    weights && Object.keys(weights).length > 0
      ? `Current top performers by engagement: ${Object.entries(weights)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([p]) => p)
          .join(', ')} — lean into these while keeping variety.`
      : '';

  return `${BRAND_VOICE}

${FEATURE_ANGLES}

Write an Instagram post for TradeAura.
${avoid}
${weightHint}

Roughly half of posts should be feature spotlights — pick ONE specific TradeAura feature and show exactly how it helps a trader. Be concrete: "TradeAura's AI graded my trade a C and told me I entered 3 minutes before the candle closed — that's the kind of feedback that changes habits." The other half can be general trading wisdom/tips that organically mention TradeAura.

Format:
- Hook line (attention-grabbing first line — could be a question, a stat, a bold statement, or a specific feature moment)
- 3-5 lines of value (trading insight or specific feature walkthrough)
- CTA: "Link in bio to try TradeAura free"
- Hashtags on the last line: use 5-8 from this list: #trading #tradingjournal #forextrading #gold #xauusd #ict #smartmoneyconcepts #propfirm #ftmo #tradeaura #aitrading #daytrader

Output only the post text.`;
}

export function WeekCalendarPrompt(recentTopics: string[], weights?: Record<string, number>): string {
  const avoid =
    recentTopics.length > 0 ? `Recently covered topics to avoid: ${recentTopics.join(', ')}.` : '';

  const weightHint =
    weights && Object.keys(weights).length > 0
      ? `Current top performers by engagement: ${Object.entries(weights)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([p]) => p)
          .join(', ')} — lean into these while keeping all pillars represented.`
      : '';

  return `${BRAND_VOICE}

${FEATURE_ANGLES}

Generate a 7-day Instagram content calendar for TradeAura — 14 Instagram posts total (2 per day).
${avoid}
${weightHint}

Content mix rule: Cover all 7 pillars across the 14 posts, using each pillar exactly twice. Rotate formats. Do not repeat the same pillar+format combo more than once.

Pillars: ai-grading | trade-journal | performance-stats | playbook | ai-coach | mindset | education

Formats:
- feed-single: static image post — hook line, 3-5 value bullets, CTA, hashtags
- carousel-hook: swipe carousel concept — hook on slide 1, value on slides 2-5, CTA on last slide (write as full caption describing each slide)
- reel-hook: short video concept — 3-second hook, problem, feature walkthrough, CTA (write as full caption/script)

For each of the 14 posts, use this exact format:
DAY: [1-7]
PLATFORM: instagram
PILLAR: [ai-grading|trade-journal|performance-stats|playbook|ai-coach|mindset|education]
FORMAT: [feed-single|carousel-hook|reel-hook]
TITLE: [short content title, max 8 words]
CONTENT: [full caption — hook line, value, CTA "Link in bio to try TradeAura free", hashtags (5-8 from: #trading #tradingjournal #forextrading #gold #xauusd #ict #smartmoneyconcepts #propfirm #ftmo #tradeaura #aitrading #daytrader)]
---

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

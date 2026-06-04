import { Router, type IRouter } from "express";

interface FetchResponse {
  ok: boolean;
  status: number;
  text(): Promise<string>;
  json(): Promise<unknown>;
}

const router: IRouter = Router();

const TUTOR_SYSTEM = `You are an elite trading coach and market analyst inside TradeAura, a professional trading journal app.

CRITICAL — LIVE DATA ACCESS: When the conversation contains a [MARKET CONTEXT] message with today's date/time and news headlines, that IS your live real-time market data feed. You MUST use it. Never say you lack real-time data or can't access current market information — you have been given today's live headlines. Analyze them directly, reference specific headlines by name, and give confident market opinions based on them.

Rules you MUST follow:
1. ONLY answer questions about trading, markets, investing, technical/fundamental analysis, risk management, trading psychology, order flow, market structure, futures, stocks, options, forex, crypto, or related financial topics.
2. If the user asks about ANYTHING unrelated to trading or finance, politely decline and redirect them: "I'm your trading tutor — I can only help with trading and market questions. Ask me anything about charts, strategies, risk, or markets!"
3. Be concise, clear, and practical. Give real examples and specific price levels when useful.
4. Format responses for mobile readability — short paragraphs, use bullet points for lists.
5. Speak like a knowledgeable, opinionated trading mentor. Be direct — say bullish or bearish, not "it could go either way."
6. When you have live news context, reference specific headlines and explain exactly how they impact the instruments the user is asking about.`;

router.post("/ai/chat", async (req, res) => {
  const { messages } = req.body as { messages: { role: string; content: string }[] };

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "messages array is required" });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "AI not configured" });
    return;
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 800,
        system: TUTOR_SYSTEM,
        messages,
      }),
    }) as unknown as FetchResponse;

    if (!response.ok) {
      const err = await response.text();
      req.log.error({ status: response.status, err }, "Anthropic API error");
      res.status(502).json({ error: "AI request failed" });
      return;
    }

    const data = await response.json() as unknown as { content: { text?: string }[] };
    const reply = data.content.map((b) => b.text || "").join("");
    res.json({ reply });
  } catch (err) {
    req.log.error(err, "AI chat error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.post("/ai/grade", async (req, res) => {
  const { prompt, maxTokens = 600 } = req.body as { prompt: string; maxTokens?: number };

  if (!prompt || typeof prompt !== "string") {
    res.status(400).json({ error: "prompt is required" });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "AI not configured" });
    return;
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      }),
    }) as unknown as FetchResponse;

    if (!response.ok) {
      const err = await response.text();
      req.log.error({ status: response.status, err }, "Anthropic API error");
      res.status(502).json({ error: "AI request failed" });
      return;
    }

    const data = await response.json() as unknown as { content: { text?: string }[] };
    const text = data.content.map((b) => b.text || "").join("");
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      res.status(502).json({ error: "No JSON in AI response" });
      return;
    }
    res.json(JSON.parse(match[0]));
  } catch (err) {
    req.log.error(err, "AI proxy error");
    res.status(500).json({ error: "Internal error" });
  }
});

// ── MARKET CONTEXT ────────────────────────────────────────────────────────────
// Returns live news headlines + current date/time + real price data for key tickers.
// Requires NEWS_API_KEY env var (free at newsapi.org — 100 req/day developer plan).
// Price data fetched from Yahoo Finance (no API key required).
router.get("/ai/market-context", async (req, res) => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const dayName = now.toLocaleDateString("en-US", { weekday: "long", timeZone: "America/New_York" });
  const timeET = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "America/New_York" });

  const newsKey = process.env.NEWS_API_KEY;
  let headlines: { title: string; source: string; publishedAt: string }[] = [];

  if (newsKey) {
    try {
      const url = `https://newsapi.org/v2/top-headlines?category=business&language=en&pageSize=12&apiKey=${newsKey}`;
      const r = await fetch(url) as unknown as FetchResponse;
      if (r.ok) {
        const data = await r.json() as unknown as { articles: { title: string; source: { name: string }; publishedAt: string }[] };
        headlines = (data.articles || [])
          .filter(a => a.title && !a.title.includes("[Removed]"))
          .slice(0, 10)
          .map(a => ({ title: a.title, source: a.source?.name || "", publishedAt: a.publishedAt }));
      }
    } catch (e) {
      req.log.warn(e, "NewsAPI fetch failed");
    }
  }

  // Fetch prices: Twelve Data for stocks (requires TWELVE_DATA_KEY), CoinGecko for BTC
  interface TickerPrice { symbol:string; lastOpen:number; lastHigh:number; lastLow:number; lastClose:number; prevClose:number; changePct:number; }
  const prices: TickerPrice[] = [];

  const tdKey = process.env.TWELVE_DATA_KEY;
  if (tdKey) {
    try {
      // Batch request — all 5 tickers in one call (commas must NOT be encoded)
      const r = await fetch(`https://api.twelvedata.com/quote?symbol=SPY,QQQ,IWM,GLD,BTC/USD&apikey=${tdKey}`) as unknown as FetchResponse;
      if (r.ok) {
        const data = await r.json() as unknown as Record<string, { open:string; high:string; low:string; close:string; previous_close:string; percent_change:string; symbol:string }>;
        const LABEL: Record<string,string> = { SPY:"SPY", QQQ:"QQQ", IWM:"IWM", GLD:"Gold", "BTC/USD":"BTC" };
        for (const [key, q] of Object.entries(data)) {
          const label = LABEL[key];
          if (!label || !q.close || (q as any).status === "error") continue;
          prices.push({
            symbol: label,
            lastOpen:  +parseFloat(q.open).toFixed(2),
            lastHigh:  +parseFloat(q.high).toFixed(2),
            lastLow:   +parseFloat(q.low).toFixed(2),
            lastClose: +parseFloat(q.close).toFixed(2),
            prevClose: +parseFloat(q.previous_close).toFixed(2),
            changePct: +parseFloat(q.percent_change).toFixed(2),
          });
        }
      }
    } catch (e) { req.log.warn(e, "Twelve Data fetch failed"); }
  }

  // BTC fallback via CoinGecko if Twelve Data didn't get it
  if (!prices.find(p => p.symbol === "BTC")) {
    try {
      const r = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_24hr_high=true&include_24hr_low=true") as unknown as FetchResponse;
      if (r.ok) {
        const d = await r.json() as unknown as { bitcoin: { usd:number; usd_24h_change:number; usd_24h_high:number; usd_24h_low:number } };
        const b = d?.bitcoin;
        if (b?.usd) prices.push({ symbol:"BTC", lastOpen:0, lastHigh:+b.usd_24h_high.toFixed(0), lastLow:+b.usd_24h_low.toFixed(0), lastClose:+b.usd.toFixed(0), prevClose:+(b.usd/(1+(b.usd_24h_change||0)/100)).toFixed(0), changePct:+(b.usd_24h_change||0).toFixed(2) });
      }
    } catch (_) {}
  }

  res.json({ date: dateStr, dayName, timeET, headlines, hasNews: headlines.length > 0, prices, hasPrices: prices.length > 0 });
});

export default router;

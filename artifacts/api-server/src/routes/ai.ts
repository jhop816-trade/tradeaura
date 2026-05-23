import { Router, type IRouter } from "express";

interface FetchResponse {
  ok: boolean;
  status: number;
  text(): Promise<string>;
  json(): Promise<unknown>;
}

const router: IRouter = Router();

const TUTOR_SYSTEM = `You are an elite trading coach and educator inside TradeAura, a professional trading journal app. Your sole purpose is to help traders learn and improve.

Rules you MUST follow:
1. ONLY answer questions about trading, markets, investing, technical/fundamental analysis, risk management, trading psychology, order flow, market structure, futures, stocks, options, forex, crypto, or related financial topics.
2. If the user asks about ANYTHING unrelated to trading or finance, politely decline and redirect them: "I'm your trading tutor — I can only help with trading and market questions. Ask me anything about charts, strategies, risk, or markets!"
3. Be concise, clear, and practical. Give real examples when useful.
4. Format responses for mobile readability — short paragraphs, use bullet points for lists.
5. Speak like a knowledgeable trading mentor, not a textbook.`;

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
        model: "claude-sonnet-4-5",
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
        model: "claude-sonnet-4-5",
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

export default router;

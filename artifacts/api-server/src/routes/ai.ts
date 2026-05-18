import { Router, type IRouter } from "express";

const router: IRouter = Router();

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
    });

    if (!response.ok) {
      const err = await response.text();
      req.log.error({ status: response.status, err }, "Anthropic API error");
      res.status(502).json({ error: "AI request failed" });
      return;
    }

    const data = await response.json() as { content: { text?: string }[] };
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

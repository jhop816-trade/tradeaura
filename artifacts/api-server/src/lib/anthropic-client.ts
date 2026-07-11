const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-haiku-4-5-20251001";
const MAX_RETRIES = 4;
const BASE_DELAY_MS = 500;

export interface ClaudeMessage {
  role: "user" | "assistant";
  content: string;
}

export interface CallClaudeOptions {
  system: string;
  messages: ClaudeMessage[];
  maxTokens?: number;
  signal?: AbortSignal;
}

function jitter(ms: number): number {
  return ms * (0.5 + Math.random() * 0.5);
}

export async function callClaude(opts: CallClaudeOptions): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

  const { system, messages, maxTokens = 800, signal } = opts;

  const body = {
    model: MODEL,
    max_tokens: maxTokens,
    system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
    messages,
  };

  let lastErr: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (signal?.aborted) throw Object.assign(new Error("Aborted"), { name: "AbortError" });

    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "prompt-caching-2024-07-31",
      },
      body: JSON.stringify(body),
      signal,
    });

    if (response.ok) {
      const data = await response.json() as { content: Array<{ text?: string }> };
      return data.content.map((b) => b.text ?? "").join("");
    }

    const status = response.status;
    const isRetryable = status === 429 || status === 529 || status >= 500;
    if (!isRetryable || attempt === MAX_RETRIES) {
      const errText = await response.text();
      throw new Error(`Anthropic API error ${status}: ${errText}`);
    }

    const retryAfterHeader = response.headers.get("Retry-After");
    const retryAfterMs = retryAfterHeader ? parseFloat(retryAfterHeader) * 1000 : 0;
    const backoffMs = Math.pow(2, attempt) * BASE_DELAY_MS;
    const delayMs = Math.max(retryAfterMs, jitter(backoffMs));

    lastErr = new Error(`Anthropic API ${status} (attempt ${attempt + 1})`);
    await new Promise<void>((resolve) => setTimeout(resolve, delayMs));
  }
  throw lastErr;
}

import axios from 'axios';
import type { Logger } from './logger.js';

export interface DailyCounts {
  x: number;
  ig: number;
  fb: number;
  tiktok: number;
}

export const AlertMessages = {
  online: () => '✅ GID online — MarketingAgent running',
  tiktokDraftReady: () => '📝 New TikTok draft ready for review — check Supabase drafts',
  siteDown: (statusCode: number, time: string) =>
    `🚨 TradeAura is down — ${statusCode} at ${time}`,
  sentryError: (summary: string) => `⚠️ Sentry error detected — ${summary}`,
  dailySummary: (counts: DailyCounts, siteUp: boolean) =>
    `📊 Daily summary [5PM]: X posts: ${counts.x} | IG: ${counts.ig} | FB: ${counts.fb} | TikTok drafts: ${counts.tiktok} | Site: ${siteUp ? '✅' : '❌'}`,
};

export class Alerter {
  constructor(private readonly logger: Logger) {}

  async send(message: string): Promise<void> {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) {
      this.logger.warn('Telegram credentials not set — skipping alert');
      return;
    }
    try {
      await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
        chat_id: chatId,
        text: message,
      });
    } catch (err) {
      this.logger.error({ err }, 'Failed to send Telegram alert');
    }
  }
}

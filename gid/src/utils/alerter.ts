import axios from 'axios';
import type { Logger } from './logger.js';

export interface DailyCounts {
  ig: number;
}

export const AlertMessages = {
  online: () => '✅ GID online — MarketingAgent running',
  siteDown: (statusCode: number, time: string) =>
    `🚨 TradeAura is down — ${statusCode} at ${time}`,
  sentryError: (summary: string) => `⚠️ Sentry error detected — ${summary}`,
  dailySummary: (counts: DailyCounts, siteUp: boolean) =>
    `📊 Daily [5PM]: IG posts: ${counts.ig} | Site: ${siteUp ? '✅' : '❌'}`,
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
        parse_mode: 'HTML',
      });
    } catch (err) {
      this.logger.error({ err }, 'Failed to send Telegram alert');
    }
  }

  async sendWithButtons(
    message: string,
    buttons: Array<Array<{ text: string; callback_data: string }>>,
  ): Promise<number> {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) return 0;
    try {
      const res = await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: buttons },
      });
      return (res.data?.result?.message_id as number) ?? 0;
    } catch (err) {
      this.logger.error({ err }, 'Failed to send Telegram message with buttons');
      return 0;
    }
  }

  async editMessage(messageId: number, text: string): Promise<void> {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId || !messageId) return;
    try {
      await axios.post(`https://api.telegram.org/bot${token}/editMessageText`, {
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'HTML',
      });
    } catch (_) {}
  }
}

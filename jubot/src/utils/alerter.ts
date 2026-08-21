import axios from 'axios';
import type { Logger } from './logger.js';

export const AlertMessages = {
  online: () => '✅ jubot online — watching JuFade',
  crash: (summary: string) => `⚠️ jubot crashed — ${summary}`,
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
}

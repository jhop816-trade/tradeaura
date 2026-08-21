import axios from 'axios';
import type { JuBotAgent } from '../agent.js';
import type { Logger } from '../utils/logger.js';

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from?: { id: number; username?: string };
    chat: { id: number };
    text?: string;
  };
}

interface GetUpdatesResponse {
  ok: boolean;
  result: TelegramUpdate[];
}

const WELCOME =
  "jubot online. Send me:\n" +
  "• Pasted Google Ads numbers → I'll save them and tell you the trend\n" +
  "• A forwarded Booksy booking notification → I'll remind you before it\n" +
  "• Anything else → I'll just answer\n\n" +
  "Google Ads / Business Profile auto-management is pending API approval — see the jubot README.";

export class TelegramBot {
  private offset = 0;
  private running = false;

  constructor(
    private readonly agent: JuBotAgent,
    private readonly logger: Logger,
  ) {}

  start(): void {
    if (this.running) return;
    this.running = true;
    this.pollLoop();
  }

  async sendMessage(text: string): Promise<void> {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) return;
    try {
      await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
        chat_id: chatId,
        text,
      });
    } catch (err) {
      this.logger.error({ err }, 'Failed to send Telegram message');
    }
  }

  private pollLoop(): void {
    const loop = async (): Promise<void> => {
      while (this.running) {
        try {
          await this.poll();
        } catch (err) {
          this.logger.error({ err }, 'Telegram poll error — will retry');
          await new Promise((r) => setTimeout(r, 5000));
        }
      }
    };
    loop().catch((err) => {
      this.logger.error({ err }, 'Telegram poll loop crashed');
    });
  }

  private async poll(): Promise<void> {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return;

    const response = await axios.get<GetUpdatesResponse>(
      `https://api.telegram.org/bot${token}/getUpdates`,
      { params: { offset: this.offset, timeout: 30 }, timeout: 35000 },
    );

    const updates = response.data.result ?? [];
    for (const update of updates) {
      this.offset = update.update_id + 1;
      await this.handleUpdate(update).catch((err) => {
        this.logger.error({ err, update_id: update.update_id }, 'Error handling Telegram update');
      });
    }
  }

  private async handleUpdate(update: TelegramUpdate): Promise<void> {
    const message = update.message;
    if (!message?.text) return;

    const allowedChatId = process.env.TELEGRAM_CHAT_ID;
    if (allowedChatId && String(message.chat.id) !== String(allowedChatId)) {
      this.logger.warn({ chatId: message.chat.id }, 'Ignoring message from unauthorized chat');
      return;
    }

    if (message.text === '/start') {
      await this.sendMessage(WELCOME);
      return;
    }

    const reply = await this.agent.handleMessage(message.text);
    await this.sendMessage(reply);
  }
}

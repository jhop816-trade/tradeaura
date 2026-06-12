import axios from 'axios';
import type Anthropic from '@anthropic-ai/sdk';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { AgentMemory } from '../memory/agentMemory.js';
import type { MarketingAgent } from '../agents/marketingAgent.js';
import { BRAND_VOICE } from '../prompts/marketingPrompts.js';
import type { Logger } from '../utils/logger.js';

const MODEL = 'claude-sonnet-4-5-20251022';

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

const AGENT_NAME = 'marketing-agent';

export class TelegramBot {
  private offset = 0;
  private running = false;
  private agent: MarketingAgent | null = null;

  constructor(
    private readonly supabase: SupabaseClient,
    private readonly memory: AgentMemory,
    private readonly anthropic: Anthropic,
    private readonly logger: Logger,
  ) {}

  setAgent(agent: MarketingAgent): void {
    this.agent = agent;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.pollLoop();
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
    const msg = update.message;
    if (!msg?.text) return;

    const chatId = msg.chat.id;
    const allowedChatId = Number(process.env.TELEGRAM_CHAT_ID);
    if (allowedChatId && chatId !== allowedChatId) {
      this.logger.warn({ chatId }, 'Ignoring message from unauthorized chat');
      return;
    }

    const text = msg.text.trim();
    if (text.startsWith('/')) {
      const command = text.split(' ')[0].toLowerCase();
      await this.handleCommand(chatId, command);
    } else {
      await this.handleMessage(chatId, text);
    }
  }

  private async sendMessage(chatId: number, text: string): Promise<void> {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return;
    try {
      await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      });
    } catch (err) {
      this.logger.error({ err, chatId }, 'Failed to send Telegram message');
    }
  }

  private async handleCommand(chatId: number, command: string): Promise<void> {
    switch (command) {
      case '/today':
        await this.cmdToday(chatId);
        break;
      case '/week':
        await this.cmdWeek(chatId);
        break;
      case '/pause':
        await this.cmdPause(chatId);
        break;
      case '/resume':
        await this.cmdResume(chatId);
        break;
      case '/status':
        await this.cmdStatus(chatId);
        break;
      case '/tiktok':
        await this.cmdTikTok(chatId);
        break;
      case '/test':
        await this.cmdTest(chatId);
        break;
      default:
        await this.sendMessage(chatId, `Unknown command: ${command}\n\nAvailable: /today /week /pause /resume /status /tiktok /test`);
    }
  }

  private async cmdToday(chatId: number): Promise<void> {
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
    const { data, error } = await this.supabase
      .from('content_calendar')
      .select('platform, title, status, content')
      .eq('scheduled_date', today)
      .order('platform');

    if (error) {
      this.logger.error({ error }, 'content_calendar query failed');
      await this.sendMessage(chatId, `Database error: ${error.message}`);
      return;
    }
    if (!data || data.length === 0) {
      await this.sendMessage(chatId, `No calendar content scheduled for today (${today}).`);
      return;
    }

    const lines = [`<b>Today's Content (${today})</b>\n`];
    for (const row of data) {
      const statusIcon = row.status === 'posted' ? '✅' : '⏳';
      lines.push(`${statusIcon} <b>${String(row.platform).toUpperCase()}</b> — ${String(row.title ?? 'Untitled')}`);
      lines.push(`<i>${String(row.content).substring(0, 120)}...</i>\n`);
    }

    await this.sendMessage(chatId, lines.join('\n'));
  }

  private async cmdWeek(chatId: number): Promise<void> {
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    const end = sevenDaysLater.toISOString().slice(0, 10);

    const { data, error } = await this.supabase
      .from('content_calendar')
      .select('scheduled_date, platform, title, status')
      .gte('scheduled_date', today)
      .lte('scheduled_date', end)
      .order('scheduled_date')
      .order('platform');

    if (error || !data || data.length === 0) {
      await this.sendMessage(chatId, 'No calendar content found for the next 7 days.');
      return;
    }

    const lines = ['<b>This Week\'s Calendar</b>\n'];
    let lastDate = '';
    for (const row of data) {
      const date = String(row.scheduled_date);
      if (date !== lastDate) {
        lines.push(`\n<b>${date}</b>`);
        lastDate = date;
      }
      const statusIcon = row.status === 'posted' ? '✅' : '⏳';
      lines.push(`  ${statusIcon} ${String(row.platform).toUpperCase()} — ${String(row.title ?? 'Untitled')}`);
    }

    await this.sendMessage(chatId, lines.join('\n'));
  }

  private async cmdPause(chatId: number): Promise<void> {
    await this.memory.upsert(AGENT_NAME, 'posting-paused', true);
    await this.sendMessage(chatId, '⏸ Posting paused. All scheduled posts will be skipped until you send /resume.');
  }

  private async cmdResume(chatId: number): Promise<void> {
    await this.memory.delete(AGENT_NAME, 'posting-paused');
    await this.sendMessage(chatId, '▶️ Posting resumed. Scheduled posts will run normally.');
  }

  private async cmdStatus(chatId: number): Promise<void> {
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
    const key = `daily-counts-${today}`;

    const counts = (await this.memory.get<{ x: number; ig: number; fb: number; tiktok: number }>(
      AGENT_NAME,
      key,
    )) ?? { x: 0, ig: 0, fb: 0, tiktok: 0 };

    const paused = await this.memory.get<boolean>(AGENT_NAME, 'posting-paused');
    const siteStatus = await this.memory.get<{ up: boolean }>('website-monitor', 'site-status');

    const { data: recentLog } = await this.supabase
      .from('content_log')
      .select('platform, posted_at')
      .order('posted_at', { ascending: false })
      .limit(4);

    const lastPosts = (recentLog ?? [])
      .map((r) => `  ${String(r.platform).toUpperCase()}: ${String(r.posted_at).slice(0, 16).replace('T', ' ')}`)
      .join('\n');

    const lines = [
      '<b>GID Status</b>\n',
      `Posting: ${paused ? '⏸ Paused' : '▶️ Active'}`,
      `Site: ${siteStatus?.up !== false ? '✅ Up' : '❌ Down'}`,
      `\n<b>Today's counts (${today})</b>`,
      `X: ${counts.x} | IG: ${counts.ig} | FB: ${counts.fb} | TikTok drafts: ${counts.tiktok}`,
    ];

    if (lastPosts) {
      lines.push('\n<b>Recent posts</b>');
      lines.push(lastPosts);
    }

    await this.sendMessage(chatId, lines.join('\n'));
  }

  private async cmdTikTok(chatId: number): Promise<void> {
    const { data, error } = await this.supabase
      .from('content_drafts')
      .select('content, created_at')
      .eq('platform', 'tiktok')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      await this.sendMessage(chatId, 'No pending TikTok drafts found.');
      return;
    }

    const preview = String(data.content).substring(0, 500);
    const created = String(data.created_at).slice(0, 16).replace('T', ' ');
    await this.sendMessage(
      chatId,
      `<b>Latest TikTok Draft</b> (${created})\n\n${preview}${data.content.length > 500 ? '...' : ''}`,
    );
  }

  private async cmdTest(chatId: number): Promise<void> {
    if (!this.agent) {
      await this.sendMessage(chatId, 'Agent not ready yet.');
      return;
    }
    await this.sendMessage(chatId, '⏳ Testing all platforms — this may take 30 seconds...');

    const results: string[] = [];

    try {
      await this.agent.postX('morning');
      results.push('✅ X — posted');
    } catch (err) {
      results.push(`❌ X — ${String(err instanceof Error ? err.message : err).substring(0, 100)}`);
    }

    try {
      await this.agent.postInstagram();
      results.push('✅ Instagram — posted');
    } catch (err) {
      results.push(`❌ Instagram — ${String(err instanceof Error ? err.message : err).substring(0, 100)}`);
    }

    try {
      await this.agent.postFacebook();
      results.push('✅ Facebook — posted');
    } catch (err) {
      results.push(`❌ Facebook — ${String(err instanceof Error ? err.message : err).substring(0, 100)}`);
    }

    await this.sendMessage(chatId, `<b>Test Results</b>\n\n${results.join('\n')}`);
  }

  private async handleMessage(chatId: number, text: string): Promise<void> {
    try {
      const response = await this.anthropic.messages.create({
        model: MODEL,
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: `${BRAND_VOICE}\n\nYou are GID, TradeAura's autonomous marketing assistant. Answer this question about TradeAura marketing concisely:\n\n${text}`,
          },
        ],
      });
      const block = response.content[0];
      const reply = block && block.type === 'text' ? block.text.trim() : 'Sorry, I could not generate a response.';
      await this.sendMessage(chatId, reply);
    } catch (err) {
      this.logger.error({ err }, 'Failed to generate Claude response for Telegram message');
      await this.sendMessage(chatId, 'Sorry, I encountered an error. Please try again.');
    }
  }
}

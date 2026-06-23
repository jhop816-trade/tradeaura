import axios from 'axios';
import type Anthropic from '@anthropic-ai/sdk';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { AgentMemory } from '../memory/agentMemory.js';
import type { MarketingAgent } from '../agents/marketingAgent.js';
import { BRAND_VOICE } from '../prompts/marketingPrompts.js';
import type { Logger } from '../utils/logger.js';

const MODEL = 'claude-sonnet-4-6';

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
      await this.handleCommand(chatId, command, text);
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

  private async handleCommand(chatId: number, command: string, fullText: string): Promise<void> {
    switch (command) {
      case '/today':
        await this.cmdToday(chatId);
        break;
      case '/week':
        await this.cmdWeek(chatId);
        break;
      case '/calendar':
        await this.cmdCalendar(chatId);
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
      case '/post':
        await this.cmdPost(chatId, fullText);
        break;
      case '/logs':
        await this.cmdLogs(chatId);
        break;
      case '/help':
        await this.cmdHelp(chatId);
        break;
      case '/test':
        await this.cmdTest(chatId);
        break;
      case '/metatoken':
        await this.cmdMetaToken(chatId);
        break;
      case '/dbcheck':
        await this.cmdDbCheck(chatId);
        break;
      case '/approve':
        await this.cmdApprove(chatId);
        break;
      case '/skip':
        await this.cmdSkip(chatId);
        break;
      case '/preview':
        await this.cmdPreview(chatId);
        break;
      default:
        await this.sendMessage(
          chatId,
          `Unknown command: ${command}\n\nSend /help for a list of available commands.`,
        );
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

  private async cmdCalendar(chatId: number): Promise<void> {
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    const end = sevenDaysLater.toISOString().slice(0, 10);

    const { data, error } = await this.supabase
      .from('content_calendar')
      .select('id, scheduled_date, platform, title')
      .eq('status', 'scheduled')
      .gte('scheduled_date', today)
      .lte('scheduled_date', end)
      .order('scheduled_date')
      .order('platform')
      .limit(20);

    if (error) {
      this.logger.error({ error }, 'content_calendar query failed');
      await this.sendMessage(chatId, `Database error: ${error.message}`);
      return;
    }
    if (!data || data.length === 0) {
      await this.sendMessage(chatId, 'No scheduled content found for the next 7 days.');
      return;
    }

    const lines = ['📅 <b>Upcoming Content</b>\n'];
    let lastDate = '';
    for (const row of data) {
      const date = String(row.scheduled_date);
      if (date !== lastDate) {
        lines.push(`\n<b>${date}</b>`);
        lastDate = date;
      }
      lines.push(`  • ${String(row.platform)} — ${String(row.title ?? 'Untitled')}`);
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

  private getNextScheduledPost(): string {
    // Schedule (ET): X at 9:30, 13:00, 19:00 | IG at 11:00 | FB at 15:00 | TikTok draft at 8:00
    const now = new Date();
    const etFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour: 'numeric',
      minute: '2-digit',
      hour12: false,
    });
    const etParts = etFormatter.formatToParts(now);
    const etHour = Number(etParts.find((p) => p.type === 'hour')?.value ?? 0);
    const etMinute = Number(etParts.find((p) => p.type === 'minute')?.value ?? 0);
    const etTotalMinutes = etHour * 60 + etMinute;

    // Sorted schedule entries: [minuteOfDay, label]
    const schedule: [number, string][] = [
      [8 * 60, '🎵 TikTok draft at 8:00am ET'],
      [9 * 60 + 30, '𝕏 X post at 9:30am ET'],
      [11 * 60, '📸 Instagram post at 11:00am ET'],
      [13 * 60, '𝕏 X post at 1:00pm ET'],
      [15 * 60, '👥 Facebook post at 3:00pm ET'],
      [19 * 60, '𝕏 X post at 7:00pm ET'],
    ];

    for (const [minuteOfDay, label] of schedule) {
      if (etTotalMinutes < minuteOfDay) {
        return label;
      }
    }
    // All posts done for today — next is tomorrow's first
    return '🎵 TikTok draft at 8:00am ET (tomorrow)';
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

    const nextPost = this.getNextScheduledPost();

    const lines = [
      '<b>GID Status</b>\n',
      `Posting: ${paused ? '⏸ Paused' : '▶️ Active'}`,
      `Site: ${siteStatus?.up !== false ? '✅ Up' : '❌ Down'}`,
      `Next: ${nextPost}`,
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

  private async cmdDbCheck(chatId: number): Promise<void> {
    const { Intl: _I } = globalThis;
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
    const { data, error, count } = await this.supabase
      .from('content_calendar')
      .select('scheduled_date, platform, status, title', { count: 'exact' })
      .eq('scheduled_date', today)
      .eq('platform', 'instagram');
    if (error) {
      await this.sendMessage(chatId, `❌ DB error: ${error.message}`);
      return;
    }
    const lines = [`<b>DB Check — Instagram rows for ${today}</b>\n`, `Total: ${count ?? 0}`];
    (data ?? []).forEach((r: any) => lines.push(`• ${String(r.status)} — ${String(r.title ?? 'no title')}`));
    await this.sendMessage(chatId, lines.join('\n'));
  }

  private async cmdMetaToken(chatId: number): Promise<void> {
    const token = process.env.META_ACCESS_TOKEN;
    if (!token) {
      await this.sendMessage(chatId, '❌ META_ACCESS_TOKEN is not set in environment');
      return;
    }
    const preview = `${token.substring(0, 10)}...${token.substring(token.length - 6)}`;
    try {
      const { data } = await axios.get('https://graph.facebook.com/v21.0/me', {
        params: { fields: 'id,name', access_token: token },
      });
      await this.sendMessage(
        chatId,
        `✅ Token valid\nToken preview: <code>${preview}</code>\nUser: ${String(data.name)} (${String(data.id)})`,
      );
    } catch (err: unknown) {
      const metaErr = (err as any)?.response?.data;
      await this.sendMessage(
        chatId,
        `❌ Token invalid\nToken preview: <code>${preview}</code>\nError: ${metaErr ? JSON.stringify(metaErr) : String(err)}`,
      );
    }
  }

  private async cmdTest(chatId: number): Promise<void> {
    if (!this.agent) {
      await this.sendMessage(chatId, 'Agent not ready yet.');
      return;
    }
    await this.sendMessage(chatId, '⏳ Testing all platforms — this may take 30 seconds...');

    const results: string[] = [];

    results.push('⏭ X — skipped (Twitter API requires paid plan)');

    try {
      await this.agent.postInstagram();
      results.push('✅ Instagram — posted');
    } catch (err) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err) ?? String(err);
      results.push(`❌ Instagram — ${msg.substring(0, 150)}`);
    }

    results.push('⏭ Facebook — skipped (cross-posted from Instagram)');

    await this.sendMessage(chatId, `<b>Test Results</b>\n\n${results.join('\n')}`);
  }

  private async cmdPost(chatId: number, fullText: string): Promise<void> {
    if (!this.agent) {
      await this.sendMessage(chatId, 'Agent not ready yet.');
      return;
    }

    const parts = fullText.trim().split(/\s+/);
    const platform = parts[1]?.toLowerCase();

    if (!platform) {
      await this.sendMessage(chatId, 'Usage: /post x | /post ig | /post fb | /post tiktok');
      return;
    }

    const platformLabels: Record<string, string> = {
      x: '𝕏',
      ig: '📸 Instagram',
      fb: '👥 Facebook',
      tiktok: '🎵 TikTok',
    };

    const label = platformLabels[platform];
    if (!label) {
      await this.sendMessage(chatId, `Unknown platform: ${platform}\n\nAvailable: x, ig, fb, tiktok`);
      return;
    }

    await this.sendMessage(chatId, `⏳ Posting to ${label}...`);

    try {
      if (platform === 'x') {
        await this.agent.postX('morning');
      } else if (platform === 'ig') {
        await this.agent.postInstagram();
      } else if (platform === 'fb') {
        await this.agent.postFacebook();
      } else if (platform === 'tiktok') {
        await this.agent.generateTikTokDraft();
      }
      await this.sendMessage(chatId, `✅ ${label} — done`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await this.sendMessage(chatId, `❌ ${label} — ${msg.substring(0, 200)}`);
    }
  }

  private async cmdLogs(chatId: number): Promise<void> {
    const { data, error } = await this.supabase
      .from('content_log')
      .select('platform, content, posted_at')
      .order('posted_at', { ascending: false })
      .limit(5);

    if (error) {
      this.logger.error({ error }, 'content_log query failed');
      await this.sendMessage(chatId, `Database error: ${error.message}`);
      return;
    }

    if (!data || data.length === 0) {
      await this.sendMessage(chatId, 'No posts logged yet.');
      return;
    }

    const platformIcon: Record<string, string> = {
      x: '𝕏',
      instagram: '📸',
      facebook: '👥',
      tiktok: '🎵',
    };

    const lines = ['<b>Last 5 Posts</b>\n'];
    for (const row of data) {
      const platform = String(row.platform);
      const icon = platformIcon[platform] ?? platform.toUpperCase();
      const preview = String(row.content).substring(0, 60).replace(/\n/g, ' ');
      const time = String(row.posted_at).slice(0, 16).replace('T', ' ');
      lines.push(`${icon} <b>${time}</b>`);
      lines.push(`<i>${preview}…</i>\n`);
    }

    await this.sendMessage(chatId, lines.join('\n'));
  }

  private async cmdPreview(chatId: number): Promise<void> {
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
    const { data, error } = await this.supabase
      .from('content_calendar')
      .select('id, scheduled_date, title, content, image_url')
      .eq('status', 'scheduled')
      .eq('platform', 'instagram')
      .gte('scheduled_date', today)
      .order('scheduled_date')
      .limit(1)
      .maybeSingle();

    if (error) {
      await this.sendMessage(chatId, `❌ DB error: ${error.message}`);
      return;
    }
    if (!data) {
      await this.sendMessage(chatId, 'No upcoming Instagram posts scheduled.');
      return;
    }

    const lines = [
      `📸 <b>Next Instagram Post — ${String(data.scheduled_date)}</b>`,
      `<b>${String(data.title ?? 'Untitled')}</b>\n`,
      String(data.content),
    ];

    if (data.image_url) {
      lines.push(`\n🖼 <a href="${String(data.image_url)}">View Image</a>`);
    }

    await this.sendMessage(chatId, lines.join('\n'));
  }

  private async cmdApprove(chatId: number): Promise<void> {
    if (!this.agent) {
      await this.sendMessage(chatId, 'Agent not ready yet.');
      return;
    }

    const pending = await this.memory.get<{ calendarId: string | null; caption: string; imageUrl: string | null }>(
      AGENT_NAME,
      'pending-instagram-post',
    );

    if (!pending) {
      await this.sendMessage(chatId, 'No pending Instagram post.');
      return;
    }

    try {
      await this.agent.postInstagramNow(pending.caption, pending.imageUrl, pending.calendarId);
      await this.memory.delete(AGENT_NAME, 'pending-instagram-post');
      await this.sendMessage(chatId, '✅ Posted to Instagram!');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await this.sendMessage(chatId, `❌ Failed to post: ${msg.substring(0, 200)}`);
    }
  }

  private async cmdSkip(chatId: number): Promise<void> {
    const pending = await this.memory.get<{ calendarId: string | null; caption: string; imageUrl: string | null }>(
      AGENT_NAME,
      'pending-instagram-post',
    );

    if (!pending) {
      await this.sendMessage(chatId, 'No pending Instagram post.');
      return;
    }

    if (pending.calendarId) {
      const { error } = await this.supabase
        .from('content_calendar')
        .update({ status: 'posted' })
        .eq('id', pending.calendarId);
      if (error) {
        this.logger.error({ error, calendarId: pending.calendarId }, 'Failed to mark calendar row as posted during /skip');
      }
    }

    await this.memory.delete(AGENT_NAME, 'pending-instagram-post');
    await this.sendMessage(chatId, '⏭ Skipped — marked as done.');
  }

  private async cmdHelp(chatId: number): Promise<void> {
    const help = [
      '<b>GID Marketing Bot — Commands</b>\n',
      '/status — Agent status and today\'s post counts',
      '/today — Content scheduled for today',
      '/week — This week\'s full calendar',
      '/calendar — Next 7 days of scheduled content',
      '/logs — Last 5 published posts',
      '',
      '/post x — Post to 𝕏 immediately',
      '/post ig — Post to Instagram immediately',
      '/post fb — Post to Facebook immediately',
      '/post tiktok — Generate a TikTok draft immediately',
      '',
      '/tiktok — View the latest pending TikTok draft',
      '/pause — Pause all scheduled posting',
      '/resume — Resume scheduled posting',
      '/test — Run a test post to all platforms',
      '',
      '/preview — Show the next scheduled Instagram post in full',
      '/approve — Post the pending Instagram content now',
      '/skip — Skip the pending Instagram post (mark as done)',
      '',
      'You can also send a free-text message to ask GID a question.',
    ];
    await this.sendMessage(chatId, help.join('\n'));
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

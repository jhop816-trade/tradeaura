import axios from 'axios';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { AgentMemory } from '../memory/agentMemory.js';
import type { ContentGenerator } from '../tools/contentGenerator.js';
import type { SocialPoster } from '../tools/socialPoster.js';
import type { Alerter } from '../utils/alerter.js';
import { AlertMessages } from '../utils/alerter.js';
import type { DailyCounts } from '../utils/alerter.js';
import { getTodayKeyNY } from '../utils/date.js';
import type { Logger } from '../utils/logger.js';
import { withRetry } from '../utils/retry.js';

interface CalendarContent {
  id: string;
  content: string;
  title: string | null;
  image_url: string | null;
  video_url: string | null;
  pillar: string | null;
  format: string | null;
}

export interface PendingInstagramPost {
  calendarId: string | null;
  caption: string;
  imageUrl: string | null;
  pillar: string | null;
  format: string | null;
  preparedAt: string;
  telegramMessageId: number;
  chatId: number;
}

const AGENT_NAME = 'marketing-agent';

export class MarketingAgent {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly contentGenerator: ContentGenerator,
    private readonly socialPoster: SocialPoster,
    private readonly memory: AgentMemory,
    private readonly alerter: Alerter,
    private readonly logger: Logger,
  ) {}

  private async isPostingPaused(): Promise<boolean> {
    const paused = await this.memory.get<boolean>(AGENT_NAME, 'posting-paused');
    return paused === true;
  }

  private async getRecentTopics(): Promise<string[]> {
    const topics = await this.memory.get<string[]>(AGENT_NAME, 'recent-topics');
    return topics ?? [];
  }

  private async addRecentTopic(topic: string): Promise<void> {
    const topics = await this.getRecentTopics();
    const updated = [topic, ...topics].slice(0, 14);
    await this.memory.upsert(AGENT_NAME, 'recent-topics', updated);
  }

  private async incrementDailyCounter(): Promise<void> {
    const today = getTodayKeyNY();
    const key = `daily-counts-${today}`;
    const current = (await this.memory.get<DailyCounts>(AGENT_NAME, key)) ?? { ig: 0 };
    current.ig++;
    await this.memory.upsert(AGENT_NAME, key, current);
  }

  private async logPost(
    platform: string,
    content: string,
    postId: string,
    pillar?: string | null,
    format?: string | null,
    utmLink?: string | null,
  ): Promise<void> {
    await this.supabase.from('content_log').insert({
      platform,
      content,
      post_id: postId,
      ...(pillar != null && { pillar }),
      ...(format != null && { format }),
      ...(utmLink != null && { utm_link: utmLink }),
    });
  }

  private async handlePostError(platform: string, err: unknown): Promise<never> {
    const message = err instanceof Error ? err.message : String(err);
    this.logger.error({ platform, err }, 'Post failed after all retries');
    await this.supabase.from('system_alerts').insert({
      alert_type: 'post_failed',
      message: `${platform} post failed: ${message}`,
      resolved: false,
    });
    await this.alerter.send(AlertMessages.sentryError(`${platform} post failed: ${message}`));
    throw err;
  }

  async getCalendarContent(
    platform: string,
    slot?: string,
  ): Promise<{ row: CalendarContent } | null> {
    const today = getTodayKeyNY();
    let query = this.supabase
      .from('content_calendar')
      .select('id, content, title, image_url, video_url, pillar, format')
      .eq('scheduled_date', today)
      .eq('platform', platform)
      .eq('status', 'scheduled');

    if (slot !== undefined) {
      query = query.eq('slot', slot);
    }

    const { data, error } = await query.limit(1).maybeSingle();
    if (error) {
      this.logger.error({ error, platform }, 'Failed to query content_calendar');
      return null;
    }
    if (!data) return null;
    return { row: data as CalendarContent };
  }

  private async markCalendarRowPosted(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('content_calendar')
      .update({ status: 'posted' })
      .eq('id', id);
    if (error) {
      this.logger.error({ error, id }, 'Failed to mark calendar row as posted');
    }
  }

  async postInstagram(): Promise<void> {
    if (await this.isPostingPaused()) {
      this.logger.info('Posting paused — skipping Instagram post');
      return;
    }
    try {
      let caption: string;
      let pillar: string | null = null;
      let format: string | null = null;
      const calendarResult = await this.getCalendarContent('instagram');

      if (calendarResult) {
        caption = calendarResult.row.content;
        pillar = calendarResult.row.pillar ?? null;
        format = calendarResult.row.format ?? null;
        const imageUrl = calendarResult.row.image_url ?? undefined;
        this.logger.info({ id: calendarResult.row.id }, 'Using calendar content for Instagram');
        const { postId } = await withRetry(() => this.socialPoster.postToInstagram(caption, imageUrl));
        await this.logPost('instagram', caption, postId, pillar, format);
        await this.markCalendarRowPosted(calendarResult.row.id);
        await this.incrementDailyCounter();
        await this.addRecentTopic(caption.substring(0, 60));
        this.logger.info({ postId }, 'Instagram post published from calendar');
      } else {
        const recentTopics = await this.getRecentTopics();
        ({ caption } = await this.contentGenerator.generateInstagramPost(recentTopics));
        const { postId } = await withRetry(() =>
          this.socialPoster.postToInstagram(caption, process.env.INSTAGRAM_DEFAULT_IMAGE_URL),
        );
        await this.logPost('instagram', caption, postId);
        await this.incrementDailyCounter();
        await this.addRecentTopic(caption.substring(0, 60));
        this.logger.info({ postId }, 'Instagram post published from Claude generation');
      }
    } catch (err) {
      await this.handlePostError('instagram', err);
    }
  }

  private async buildPendingPost(): Promise<Omit<PendingInstagramPost, 'preparedAt' | 'telegramMessageId' | 'chatId'>> {
    const calendarResult = await this.getCalendarContent('instagram');
    if (calendarResult) {
      this.logger.info({ id: calendarResult.row.id }, 'Prepared Instagram post from calendar');
      return {
        calendarId: calendarResult.row.id,
        caption: calendarResult.row.content,
        imageUrl: calendarResult.row.image_url,
        pillar: calendarResult.row.pillar ?? null,
        format: calendarResult.row.format ?? null,
      };
    }
    const recentTopics = await this.getRecentTopics();
    const { caption } = await this.contentGenerator.generateInstagramPost(recentTopics);
    this.logger.info('Prepared Instagram post from Claude generation');
    return {
      calendarId: null,
      caption,
      imageUrl: process.env.INSTAGRAM_DEFAULT_IMAGE_URL ?? null,
      pillar: null,
      format: null,
    };
  }

  async prepareInstagramPost(chatId?: number): Promise<void> {
    if (await this.isPostingPaused()) {
      this.logger.info('Posting paused — skipping Instagram post preparation');
      return;
    }

    if (process.env.AUTO_POST === 'true') {
      await this.postInstagram();
      return;
    }

    try {
      const postData = await this.buildPendingPost();
      const tgChatId = chatId ?? Number(process.env.TELEGRAM_CHAT_ID ?? '0');

      const pending: PendingInstagramPost = {
        ...postData,
        preparedAt: new Date().toISOString(),
        telegramMessageId: 0,
        chatId: tgChatId,
      };

      await this.memory.upsert(AGENT_NAME, 'pending-instagram-post', pending);

      const imageLabel = postData.imageUrl ?? 'default image';
      const approvalText = [
        '📸 <b>Instagram Post Ready for Approval</b>',
        postData.pillar ? `Pillar: <code>${postData.pillar}</code> | Format: <code>${postData.format ?? 'feed-single'}</code>` : '',
        '',
        postData.caption,
        '',
        `🖼 Image: ${imageLabel}`,
      ].filter(Boolean).join('\n');

      const messageId = await this.alerter.sendWithButtons(approvalText, [
        [
          { text: '✅ Approve', callback_data: 'approve_post' },
          { text: '❌ Reject', callback_data: 'reject_post' },
          { text: '🔄 Regenerate', callback_data: 'regenerate_post' },
        ],
      ]);

      pending.telegramMessageId = messageId;
      await this.memory.upsert(AGENT_NAME, 'pending-instagram-post', pending);
    } catch (err) {
      await this.handlePostError('instagram', err);
    }
  }

  async regenerateInstagramPost(): Promise<void> {
    try {
      const existing = await this.memory.get<PendingInstagramPost>(AGENT_NAME, 'pending-instagram-post');
      const postData = await this.buildPendingPost();
      const tgChatId = existing?.chatId ?? Number(process.env.TELEGRAM_CHAT_ID ?? '0');

      const pending: PendingInstagramPost = {
        ...postData,
        preparedAt: new Date().toISOString(),
        telegramMessageId: 0,
        chatId: tgChatId,
      };

      await this.memory.upsert(AGENT_NAME, 'pending-instagram-post', pending);
      await this.memory.delete(AGENT_NAME, 'pending-ig-reminded');

      const imageLabel = postData.imageUrl ?? 'default image';
      const approvalText = [
        '📸 <b>Instagram Post Ready for Approval (regenerated)</b>',
        postData.pillar ? `Pillar: <code>${postData.pillar}</code> | Format: <code>${postData.format ?? 'feed-single'}</code>` : '',
        '',
        postData.caption,
        '',
        `🖼 Image: ${imageLabel}`,
      ].filter(Boolean).join('\n');

      const messageId = await this.alerter.sendWithButtons(approvalText, [
        [
          { text: '✅ Approve', callback_data: 'approve_post' },
          { text: '❌ Reject', callback_data: 'reject_post' },
          { text: '🔄 Regenerate', callback_data: 'regenerate_post' },
        ],
      ]);

      pending.telegramMessageId = messageId;
      await this.memory.upsert(AGENT_NAME, 'pending-instagram-post', pending);
    } catch (err) {
      this.logger.error({ err }, 'Failed to regenerate Instagram post');
    }
  }

  async postInstagramNow(
    caption: string,
    imageUrl: string | null,
    calendarId: string | null,
    pillar?: string | null,
    format?: string | null,
    utmLink?: string | null,
  ): Promise<void> {
    const { postId } = await withRetry(() =>
      this.socialPoster.postToInstagram(caption, imageUrl ?? undefined),
    );
    await this.logPost('instagram', caption, postId, pillar, format, utmLink);
    if (calendarId) {
      await this.markCalendarRowPosted(calendarId);
    }
    await this.incrementDailyCounter();
    await this.addRecentTopic(caption.substring(0, 60));
    await this.memory.delete(AGENT_NAME, 'pending-ig-reminded');
    this.logger.info({ postId }, 'Instagram post published via /approve');
  }

  async postFacebook(): Promise<void> {
    this.logger.info('Facebook handled via Instagram cross-post — no action needed');
  }

  async checkPendingApprovalReminder(): Promise<void> {
    const pending = await this.memory.get<PendingInstagramPost>(AGENT_NAME, 'pending-instagram-post');
    if (!pending) return;

    const preparedAt = new Date(pending.preparedAt);
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const alreadyReminded = await this.memory.get<boolean>(AGENT_NAME, 'pending-ig-reminded');
    if (alreadyReminded) return;

    if (preparedAt < twoHoursAgo) {
      await this.alerter.send(
        '⚠️ <b>Held post reminder</b>\n\nAn Instagram post prepared 2+ hours ago is still waiting for approval. Use /approve, /reject, or /regenerate.',
      );
      await this.memory.upsert(AGENT_NAME, 'pending-ig-reminded', true);
    }
  }

  async sendDailySummary(): Promise<void> {
    const today = getTodayKeyNY();
    const counts = (await this.memory.get<DailyCounts>(AGENT_NAME, `daily-counts-${today}`)) ?? { ig: 0 };
    const siteStatus = await this.memory.get<{ up: boolean }>(
      'website-monitor',
      'site-status',
    );
    const siteUp = siteStatus?.up ?? true;
    await this.alerter.send(AlertMessages.dailySummary(counts, siteUp));
    this.logger.info({ counts, siteUp }, 'Daily summary sent');
  }

  async weeklyContentAudit(): Promise<void> {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await this.supabase
        .from('content_log')
        .select('platform, content')
        .gte('posted_at', sevenDaysAgo)
        .order('posted_at', { ascending: false })
        .limit(50);

      const recentPosts = (data ?? []).map((row) => `[${row.platform}] ${String(row.content).substring(0, 100)}`);
      const { report } = await this.contentGenerator.generateAuditReport(recentPosts);

      const weekKey = `weekly-audit-${getTodayKeyNY()}`;
      await this.memory.upsert(AGENT_NAME, weekKey, { report, auditedAt: new Date().toISOString() });
      this.logger.info('Weekly content audit complete');

      await this.refillCalendarIfNeeded();
    } catch (err) {
      this.logger.error({ err }, 'Weekly content audit failed');
    }
  }

  async refillCalendarIfNeeded(): Promise<void> {
    try {
      const today = getTodayKeyNY();
      const { count, error } = await this.supabase
        .from('content_calendar')
        .select('id', { count: 'exact', head: true })
        .gt('scheduled_date', today)
        .eq('status', 'scheduled');

      if (error) {
        this.logger.error({ error }, 'Failed to count future calendar rows');
        return;
      }

      const futureDays = Math.floor((count ?? 0) / 2);
      this.logger.info({ futureDays }, 'Future calendar days remaining');

      if (futureDays >= 14) return;

      this.logger.info('Fewer than 14 days of calendar content remain — generating new week');

      const recentTopics = await this.getRecentTopics();
      const pieces = await this.contentGenerator.generateWeekCalendar(recentTopics);

      if (pieces.length === 0) {
        this.logger.warn('generateWeekCalendar returned no pieces');
        return;
      }

      const lastDateResult = await this.supabase
        .from('content_calendar')
        .select('scheduled_date')
        .eq('status', 'scheduled')
        .gt('scheduled_date', today)
        .order('scheduled_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      const baseDate = lastDateResult.data?.scheduled_date
        ? new Date(lastDateResult.data.scheduled_date as string)
        : new Date(today);

      const rows = pieces.map((piece, idx) => {
        const dayOffset = Math.floor(idx / 2) + 1;
        const d = new Date(baseDate);
        d.setDate(d.getDate() + dayOffset);
        return {
          day_number: dayOffset,
          scheduled_date: d.toISOString().slice(0, 10),
          platform: piece.platform,
          slot: null as string | null,
          title: piece.title,
          content: piece.content,
          pillar: piece.pillar,
          format: piece.format,
          status: 'scheduled',
        };
      });

      const { error: insertError } = await this.supabase.from('content_calendar').insert(rows);
      if (insertError) {
        this.logger.error({ insertError }, 'Failed to insert new calendar rows');
      } else {
        this.logger.info({ count: rows.length }, 'New calendar rows inserted');
      }
    } catch (err) {
      this.logger.error({ err }, 'refillCalendarIfNeeded failed');
    }
  }

  async weeklyAnalyticsReport(): Promise<void> {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      let followerCount: number | null = null;
      let followerChange: number | null = null;
      try {
        const token = process.env.META_ACCESS_TOKEN;
        const igId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
        if (token && igId) {
          const res = await axios.get(`https://graph.facebook.com/v21.0/${igId}`, {
            params: { fields: 'followers_count', access_token: token },
          });
          followerCount = res.data?.followers_count ?? null;
          const lastCount = await this.memory.get<number>(AGENT_NAME, 'last-follower-count');
          if (lastCount != null && followerCount != null) followerChange = followerCount - lastCount;
          if (followerCount != null) await this.memory.upsert(AGENT_NAME, 'last-follower-count', followerCount);
        }
      } catch (err) {
        this.logger.warn({ err }, 'Failed to fetch follower count');
      }

      const { data: insights } = await this.supabase
        .from('post_insights')
        .select('instagram_post_id, pillar, format, reach, saves, score')
        .eq('window', '24h')
        .gte('fetched_at', sevenDaysAgo)
        .order('score', { ascending: false });

      const totalReach = (insights ?? []).reduce((s: number, r: any) => s + Number(r.reach), 0);
      const top3 = (insights ?? []).slice(0, 3);
      const worst = (insights ?? []).length > 0 ? (insights ?? [])[(insights ?? []).length - 1] : null;

      const { data: pillarScores } = await this.supabase
        .from('pillar_scores')
        .select('pillar, format, avg_score')
        .order('avg_score', { ascending: false })
        .limit(1);

      const bestCombo = pillarScores?.[0];

      const { report } = await this.contentGenerator.generateAuditReport(
        (insights ?? []).slice(0, 10).map((r: any) => `[${r.pillar ?? 'unknown'}/${r.format ?? 'feed'}] score: ${r.score}`),
      );

      const followerLine = followerCount != null
        ? `👥 Followers: ${followerCount.toLocaleString()}${followerChange != null ? ` (${followerChange >= 0 ? '+' : ''}${followerChange} WoW)` : ''}`
        : '👥 Followers: data unavailable';

      const lines = [
        '📊 <b>Weekly Analytics Report</b>\n',
        followerLine,
        `📡 Total Reach: ${totalReach.toLocaleString()}`,
        '',
        '<b>Top 3 Posts</b>',
        ...top3.map((r: any, i: number) => `  ${i + 1}. ${r.pillar ?? '?'} / ${r.format ?? '?'} — score ${Number(r.score).toFixed(1)}`),
        worst ? `\n<b>Worst Post</b>\n  ${(worst as any).pillar ?? '?'} / ${(worst as any).format ?? '?'} — score ${Number((worst as any).score).toFixed(1)}` : '',
        bestCombo ? `\n🏆 Best combo: <b>${bestCombo.pillar} / ${bestCombo.format}</b> (avg score ${Number(bestCombo.avg_score).toFixed(1)})` : '',
        `\n<i>${report.substring(0, 300)}</i>`,
      ].filter(Boolean);

      const { data: utmPosts } = await this.supabase
        .from('content_log')
        .select('pillar, utm_link')
        .eq('platform', 'instagram')
        .gte('posted_at', sevenDaysAgo)
        .not('utm_link', 'is', null);

      const campaigns = [...new Set((utmPosts ?? []).map((r: any) => r.pillar ?? 'general'))];
      if (campaigns.length > 0) {
        lines.push(`\n🔗 Active campaigns this week: ${campaigns.join(', ')}`);
      }

      await this.alerter.send(lines.join('\n'));
      this.logger.info('Weekly analytics report sent');
    } catch (err) {
      this.logger.error({ err }, 'Weekly analytics report failed');
    }
  }
}

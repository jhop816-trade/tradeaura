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

  async prepareInstagramPost(): Promise<void> {
    if (await this.isPostingPaused()) {
      this.logger.info('Posting paused — skipping Instagram post preparation');
      return;
    }
    try {
      let caption: string;
      let imageUrl: string | null;
      let calendarId: string | null;
      let pillar: string | null = null;
      let format: string | null = null;

      const calendarResult = await this.getCalendarContent('instagram');

      if (calendarResult) {
        caption = calendarResult.row.content;
        imageUrl = calendarResult.row.image_url;
        calendarId = calendarResult.row.id;
        pillar = calendarResult.row.pillar ?? null;
        format = calendarResult.row.format ?? null;
        this.logger.info({ id: calendarId }, 'Prepared Instagram post from calendar');
      } else {
        const recentTopics = await this.getRecentTopics();
        ({ caption } = await this.contentGenerator.generateInstagramPost(recentTopics));
        imageUrl = process.env.INSTAGRAM_DEFAULT_IMAGE_URL ?? null;
        calendarId = null;
        this.logger.info('Prepared Instagram post from Claude generation');
      }

      await this.memory.upsert(AGENT_NAME, 'pending-instagram-post', {
        calendarId,
        caption,
        imageUrl,
        pillar,
        format,
      });

      const imageLabel = imageUrl ?? 'default image';
      const notification = [
        '📸 Instagram post ready',
        '',
        caption,
        '',
        `🖼 Image: ${imageLabel}`,
        '',
        'Reply /approve to auto-post, or post manually in Instagram with music then /skip to mark done.',
      ].join('\n');

      await this.alerter.send(notification);
    } catch (err) {
      await this.handlePostError('instagram', err);
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
    this.logger.info({ postId }, 'Instagram post published via /approve');
  }

  async postFacebook(): Promise<void> {
    this.logger.info('Facebook handled via Instagram cross-post — no action needed');
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
}

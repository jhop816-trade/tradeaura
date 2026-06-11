import type { SupabaseClient } from '@supabase/supabase-js';
import type { AgentMemory } from '../memory/agentMemory.js';
import type { ContentGenerator } from '../tools/contentGenerator.js';
import type { SocialPoster } from '../tools/socialPoster.js';
import type { TiktokDrafter } from '../tools/tiktokDrafter.js';
import type { Alerter } from '../utils/alerter.js';
import { AlertMessages } from '../utils/alerter.js';
import { getTodayKeyNY } from '../utils/date.js';
import type { Logger } from '../utils/logger.js';
import { withRetry } from '../utils/retry.js';

interface DailyCounts {
  x: number;
  ig: number;
  fb: number;
  tiktok: number;
}

const AGENT_NAME = 'marketing-agent';

export class MarketingAgent {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly contentGenerator: ContentGenerator,
    private readonly socialPoster: SocialPoster,
    private readonly tiktokDrafter: TiktokDrafter,
    private readonly memory: AgentMemory,
    private readonly alerter: Alerter,
    private readonly logger: Logger,
  ) {}

  private async getRecentTopics(): Promise<string[]> {
    const topics = await this.memory.get<string[]>(AGENT_NAME, 'recent-topics');
    return topics ?? [];
  }

  private async addRecentTopic(topic: string): Promise<void> {
    const topics = await this.getRecentTopics();
    const updated = [topic, ...topics].slice(0, 14);
    await this.memory.upsert(AGENT_NAME, 'recent-topics', updated);
  }

  private async incrementDailyCounter(field: keyof DailyCounts): Promise<void> {
    const today = getTodayKeyNY();
    const key = `daily-counts-${today}`;
    const current = (await this.memory.get<DailyCounts>(AGENT_NAME, key)) ?? {
      x: 0,
      ig: 0,
      fb: 0,
      tiktok: 0,
    };
    current[field]++;
    await this.memory.upsert(AGENT_NAME, key, current);
  }

  private async logPost(platform: string, content: string, postId: string): Promise<void> {
    await this.supabase.from('content_log').insert({ platform, content, post_id: postId });
  }

  private async handlePostError(platform: string, err: unknown): Promise<void> {
    const message = err instanceof Error ? err.message : String(err);
    this.logger.error({ platform, err }, 'Post failed after all retries');
    await this.supabase.from('system_alerts').insert({
      alert_type: 'post_failed',
      message: `${platform} post failed: ${message}`,
      resolved: false,
    });
    await this.alerter.send(AlertMessages.sentryError(`${platform} post failed: ${message}`));
  }

  async postX(slot: 'morning' | 'midday' | 'afternoon' | 'evening'): Promise<void> {
    try {
      const recentTopics = await this.getRecentTopics();
      const { text } = await this.contentGenerator.generateXPost(slot, recentTopics);
      const { postId } = await withRetry(() => this.socialPoster.postToX(text));
      await this.logPost('x', text, postId);
      await this.incrementDailyCounter('x');
      await this.addRecentTopic(text.substring(0, 60));
      this.logger.info({ slot, postId }, 'X post published');
    } catch (err) {
      await this.handlePostError('x', err);
    }
  }

  async postInstagram(): Promise<void> {
    try {
      const recentTopics = await this.getRecentTopics();
      const { caption } = await this.contentGenerator.generateInstagramPost(recentTopics);
      const { postId } = await withRetry(() => this.socialPoster.postToInstagram(caption));
      await this.logPost('instagram', caption, postId);
      await this.incrementDailyCounter('ig');
      await this.addRecentTopic(caption.substring(0, 60));
      this.logger.info({ postId }, 'Instagram post published');
    } catch (err) {
      await this.handlePostError('instagram', err);
    }
  }

  async postFacebook(): Promise<void> {
    try {
      const recentTopics = await this.getRecentTopics();
      const { message } = await this.contentGenerator.generateFacebookPost(recentTopics);
      const { postId } = await withRetry(() => this.socialPoster.postToFacebook(message));
      await this.logPost('facebook', message, postId);
      await this.incrementDailyCounter('fb');
      await this.addRecentTopic(message.substring(0, 60));
      this.logger.info({ postId }, 'Facebook post published');
    } catch (err) {
      await this.handlePostError('facebook', err);
    }
  }

  async generateTikTokDraft(): Promise<void> {
    try {
      const { script } = await this.contentGenerator.generateTikTokScript();
      await this.tiktokDrafter.saveDraft(script);
      await this.incrementDailyCounter('tiktok');
      await this.alerter.send(AlertMessages.tiktokDraftReady());
      this.logger.info('TikTok draft saved');
    } catch (err) {
      await this.handlePostError('tiktok', err);
    }
  }

  async sendDailySummary(): Promise<void> {
    const today = getTodayKeyNY();
    const counts = (await this.memory.get<DailyCounts>(AGENT_NAME, `daily-counts-${today}`)) ?? {
      x: 0,
      ig: 0,
      fb: 0,
      tiktok: 0,
    };
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
    } catch (err) {
      this.logger.error({ err }, 'Weekly content audit failed');
    }
  }
}

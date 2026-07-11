import axios from 'axios';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Logger } from '../utils/logger.js';
import { withRetry } from '../utils/retry.js';

function computeScore(likes: number, comments: number, saves: number, shares: number): number {
  return saves * 3 + shares * 2 + comments * 1 + likes * 0.5;
}

async function getPageToken(logger: Logger): Promise<string> {
  const token = process.env.META_ACCESS_TOKEN;
  if (!token) throw new Error('META_ACCESS_TOKEN not set');
  try {
    const res = await axios.get('https://graph.facebook.com/v21.0/me/accounts', {
      params: { access_token: token },
    });
    const pages = (res.data?.data ?? []) as Array<{ id: string; access_token: string }>;
    const page = pages.find((p) => p.id === process.env.META_PAGE_ID);
    if (page) return page.access_token;
  } catch (_) {}
  return token;
}

export class InstagramInsights {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly logger: Logger,
  ) {}

  private async fetchInsightsForPost(
    postId: string,
    accessToken: string,
  ): Promise<{ reach: number; likes: number; comments: number; saves: number; shares: number }> {
    const metrics = 'reach,likes,comments,saved,shares';
    const res = await withRetry(() =>
      axios.get(`https://graph.facebook.com/v21.0/${postId}/insights`, {
        params: { metric: metrics, access_token: accessToken },
      }),
    );

    const data = (res.data?.data ?? []) as Array<{ name: string; values: Array<{ value: number }> }>;
    const get = (name: string) => data.find((d) => d.name === name)?.values?.[0]?.value ?? 0;

    return {
      reach: get('reach'),
      likes: get('likes'),
      comments: get('comments'),
      saves: get('saved'),
      shares: get('shares'),
    };
  }

  async fetchPendingInsights(): Promise<void> {
    const now = new Date();
    const h24ago = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const h48ago = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const d7ago = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const d8ago = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);

    const { data: posts } = await this.supabase
      .from('content_log')
      .select('post_id, pillar, format, posted_at')
      .eq('platform', 'instagram')
      .not('post_id', 'is', null);

    if (!posts || posts.length === 0) return;

    const { data: existing } = await this.supabase
      .from('post_insights')
      .select('instagram_post_id, window');

    const seen = new Set((existing ?? []).map((r: any) => `${r.instagram_post_id}:${r.window}`));

    let pageToken: string;
    try {
      pageToken = await getPageToken(this.logger);
    } catch (err) {
      this.logger.warn({ err }, 'Cannot fetch insights — no Meta token');
      return;
    }

    for (const post of posts) {
      const postedAt = new Date(post.posted_at as string);
      const postId = post.post_id as string;

      if (postedAt <= h24ago && postedAt > h48ago && !seen.has(`${postId}:24h`)) {
        await this.storeInsights(postId, '24h', post.pillar as string | null, post.format as string | null, pageToken);
      }

      if (postedAt <= d7ago && postedAt > d8ago && !seen.has(`${postId}:7d`)) {
        await this.storeInsights(postId, '7d', post.pillar as string | null, post.format as string | null, pageToken);
      }
    }

    await this.recomputePillarScores();
  }

  private async storeInsights(
    postId: string,
    window: '24h' | '7d',
    pillar: string | null,
    format: string | null,
    accessToken: string,
  ): Promise<void> {
    try {
      const metrics = await this.fetchInsightsForPost(postId, accessToken);
      const score = computeScore(metrics.likes, metrics.comments, metrics.saves, metrics.shares);

      await this.supabase.from('post_insights').upsert(
        {
          instagram_post_id: postId,
          pillar,
          format,
          window,
          reach: metrics.reach,
          likes: metrics.likes,
          comments_count: metrics.comments,
          saves: metrics.saves,
          shares: metrics.shares,
          score,
          fetched_at: new Date().toISOString(),
        },
        { onConflict: 'instagram_post_id,window' },
      );

      this.logger.info({ postId, window, score }, 'Stored Instagram insights');
    } catch (err) {
      this.logger.warn({ err, postId, window }, 'Failed to fetch insights for post');
    }
  }

  async recomputePillarScores(): Promise<void> {
    const { data } = await this.supabase
      .from('post_insights')
      .select('pillar, format, score')
      .not('pillar', 'is', null);

    if (!data || data.length === 0) return;

    const groups = new Map<string, { total: number; count: number }>();
    for (const row of data) {
      const key = `${row.pillar}:${row.format ?? 'feed-single'}`;
      const existing = groups.get(key) ?? { total: 0, count: 0 };
      existing.total += Number(row.score);
      existing.count++;
      groups.set(key, existing);
    }

    for (const [key, { total, count }] of groups) {
      const [pillar, format] = key.split(':');
      await this.supabase.from('pillar_scores').upsert(
        {
          pillar,
          format,
          avg_score: total / count,
          post_count: count,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'pillar,format' },
      );
    }
  }

  async getWeightedPillarDistribution(): Promise<Record<string, number>> {
    const { data } = await this.supabase
      .from('pillar_scores')
      .select('pillar, avg_score');

    if (!data || data.length === 0) return {};

    const ALL_PILLARS = ['ai-grading', 'trade-journal', 'performance-stats', 'playbook', 'ai-coach', 'mindset', 'education'];
    const scoreMap = new Map(data.map((r: any) => [r.pillar as string, Number(r.avg_score)]));

    const minPct = 0.1;
    const remainingPct = 1 - minPct * ALL_PILLARS.length;

    const totalScore = ALL_PILLARS.reduce((s, p) => s + (scoreMap.get(p) ?? 1), 0);
    const weights: Record<string, number> = {};
    for (const pillar of ALL_PILLARS) {
      const score = scoreMap.get(pillar) ?? 1;
      weights[pillar] = minPct + (score / totalScore) * remainingPct;
    }

    return weights;
  }
}

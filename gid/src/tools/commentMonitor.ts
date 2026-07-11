import axios from 'axios';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Alerter } from '../utils/alerter.js';
import type { Logger } from '../utils/logger.js';
import { withRetry } from '../utils/retry.js';

const QUESTION_PATTERNS = [/\?/, /how do/i, /what is/i, /where can/i, /does it/i, /can i/i, /do you/i, /is there/i];
const HIGH_ENGAGEMENT_LIKES = 5;
const VELOCITY_THRESHOLD = 3;

function isQuestion(text: string): boolean {
  return QUESTION_PATTERNS.some((p) => p.test(text));
}

export class CommentMonitor {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly alerter: Alerter,
    private readonly logger: Logger,
  ) {}

  async poll(): Promise<void> {
    const token = process.env.META_ACCESS_TOKEN;
    const igId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
    if (!token || !igId) return;

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: posts } = await this.supabase
      .from('content_log')
      .select('post_id')
      .eq('platform', 'instagram')
      .not('post_id', 'is', null)
      .gte('posted_at', thirtyDaysAgo);

    if (!posts || posts.length === 0) return;

    for (const post of posts) {
      const postId = post.post_id as string;
      try {
        await this.checkPostComments(postId, token);
      } catch (err) {
        this.logger.warn({ err, postId }, 'Comment poll failed for post');
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  private async checkPostComments(postId: string, accessToken: string): Promise<void> {
    const res = await withRetry(() =>
      axios.get(`https://graph.facebook.com/v21.0/${postId}/comments`, {
        params: {
          fields: 'id,text,like_count,timestamp,username',
          access_token: accessToken,
          limit: 25,
        },
      }),
    );

    const comments = (res.data?.data ?? []) as Array<{
      id: string;
      text: string;
      like_count: number;
      timestamp: string;
      username: string;
    }>;

    const { data: seen } = await this.supabase
      .from('seen_comments')
      .select('comment_id')
      .eq('instagram_post_id', postId);
    const seenIds = new Set((seen ?? []).map((r: any) => r.comment_id as string));

    const newComments = comments.filter((c) => !seenIds.has(c.id));
    if (newComments.length === 0) return;

    if (newComments.length >= VELOCITY_THRESHOLD) {
      const postUrl = await this.getPermalinkForPost(postId, accessToken);
      await this.alerter.send(
        `⚡ <b>Comment spike</b> — ${newComments.length} new comments on one post\n${postUrl}`,
      );
    }

    for (const c of newComments) {
      const shouldAlert = isQuestion(c.text) || c.like_count >= HIGH_ENGAGEMENT_LIKES;

      if (shouldAlert) {
        const postUrl = await this.getPermalinkForPost(postId, accessToken);
        const reason = isQuestion(c.text) ? '❓ Question' : '🔥 High engagement';
        await this.alerter.send(
          [
            `${reason} comment from @${c.username}`,
            `<i>"${c.text.substring(0, 200)}"</i>`,
            `Reply: ${postUrl}`,
          ].join('\n'),
        );
      }

      await this.supabase.from('seen_comments').upsert(
        {
          instagram_post_id: postId,
          comment_id: c.id,
          text_preview: c.text.substring(0, 100),
          alerted: shouldAlert,
          seen_at: new Date().toISOString(),
        },
        { onConflict: 'comment_id' },
      );
    }
  }

  async getPermalinkForPost(postId: string, accessToken: string): Promise<string> {
    try {
      const res = await axios.get(`https://graph.facebook.com/v21.0/${postId}`, {
        params: { fields: 'permalink', access_token: accessToken },
      });
      return (res.data?.permalink as string) ?? 'https://www.instagram.com/';
    } catch (_) {
      return 'https://www.instagram.com/';
    }
  }
}

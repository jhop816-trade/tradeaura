import axios from 'axios';
import { TwitterApi } from 'twitter-api-v2';
import type { Logger } from '../utils/logger.js';

export class SocialPoster {
  private xClient: TwitterApi | null = null;

  constructor(private readonly logger: Logger) {}

  private getXClient(): TwitterApi {
    if (!this.xClient) {
      if (!process.env.TWITTER_APP_KEY || !process.env.TWITTER_APP_SECRET) {
        throw new Error('TWITTER_PAYMENT_REQUIRED');
      }
      this.xClient = new TwitterApi({
        appKey: process.env.TWITTER_APP_KEY,
        appSecret: process.env.TWITTER_APP_SECRET,
        accessToken: process.env.TWITTER_ACCESS_TOKEN!,
        accessSecret: process.env.TWITTER_ACCESS_SECRET!,
      });
    }
    return this.xClient;
  }

  async postToX(text: string): Promise<{ postId: string }> {
    this.logger.info('Posting to X');
    try {
      const tweet = await this.getXClient().v2.tweet(text);
      return { postId: tweet.data.id };
    } catch (err: unknown) {
      const status = (err as any)?.code ?? (err as any)?.status ?? (err as any)?.data?.status;
      if (status === 402 || String((err as any)?.message ?? '').includes('402')) {
        throw new Error('TWITTER_PAYMENT_REQUIRED');
      }
      throw err;
    }
  }

  private async getPageAccessToken(): Promise<string> {
    if (process.env.FACEBOOK_PAGE_ACCESS_TOKEN) {
      return process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    }
    let res;
    try {
      res = await axios.get('https://graph.facebook.com/v21.0/me/accounts', {
        params: { access_token: process.env.META_ACCESS_TOKEN },
      });
    } catch (err: unknown) {
      const metaErr = (err as any)?.response?.data;
      throw new Error(
        `Failed to fetch page list from Meta: ${metaErr ? JSON.stringify(metaErr) : String(err)}`,
      );
    }
    const pages = (res.data?.data ?? []) as Array<{ id: string; access_token: string }>;
    const page = pages.find((p) => p.id === process.env.META_PAGE_ID);
    if (!page) {
      const ids = pages.map((p) => p.id).join(', ') || 'none';
      throw new Error(
        `Page ${process.env.META_PAGE_ID ?? '(META_PAGE_ID not set)'} not found in Meta accounts. Found: ${ids}`,
      );
    }
    return page.access_token;
  }

  async postToFacebook(message: string): Promise<{ postId: string }> {
    this.logger.info('Posting to Facebook');
    const pageToken = await this.getPageAccessToken();
    const { data } = await axios.post(
      `https://graph.facebook.com/v21.0/${process.env.META_PAGE_ID}/feed`,
      {
        message,
        access_token: pageToken,
      },
    );
    return { postId: data.id as string };
  }

  async postToInstagram(caption: string, imageUrl?: string): Promise<{ postId: string }> {
    this.logger.info('Posting to Instagram');
    const resolvedImageUrl = imageUrl ?? process.env.INSTAGRAM_DEFAULT_IMAGE_URL;
    if (!resolvedImageUrl) {
      throw new Error('No image URL provided and INSTAGRAM_DEFAULT_IMAGE_URL is not set');
    }

    const pageToken = await this.getPageAccessToken();

    let containerRes;
    try {
      containerRes = await axios.post(
        `https://graph.facebook.com/v21.0/${process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID}/media`,
        {
          caption,
          image_url: resolvedImageUrl,
          access_token: pageToken,
        },
      );
    } catch (err: unknown) {
      const metaErr = (err as any)?.response?.data;
      throw new Error(
        `Instagram media container request failed: ${metaErr ? JSON.stringify(metaErr) : String(err)}`,
      );
    }

    const container = containerRes.data;
    if (!container.id) {
      throw new Error(`Instagram media container failed: ${JSON.stringify(container)}`);
    }

    let publishRes;
    try {
      publishRes = await axios.post(
        `https://graph.facebook.com/v21.0/${process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID}/media_publish`,
        {
          creation_id: container.id,
          access_token: pageToken,
        },
      );
    } catch (err: unknown) {
      const metaErr = (err as any)?.response?.data;
      throw new Error(
        `Instagram media publish request failed: ${metaErr ? JSON.stringify(metaErr) : String(err)}`,
      );
    }

    const published = publishRes.data;

    return { postId: published.id as string };
  }

  async postToTikTok(videoUrl: string, caption: string): Promise<{ postId: string }> {
    this.logger.info('Posting to TikTok');
    const { data: init } = await axios.post(
      'https://open.tiktokapis.com/v2/post/publish/video/init/',
      {
        post_info: {
          title: caption.substring(0, 150),
          privacy_level: 'PUBLIC_TO_EVERYONE',
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
          video_cover_timestamp_ms: 1000,
        },
        source_info: {
          source: 'PULL_FROM_URL',
          video_url: videoUrl,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.TIKTOK_ACCESS_TOKEN}`,
          'Content-Type': 'application/json; charset=UTF-8',
        },
      },
    );

    return { postId: init.data?.publish_id ?? 'unknown' };
  }
}

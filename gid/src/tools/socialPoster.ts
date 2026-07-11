import axios from 'axios';
import type { Logger } from '../utils/logger.js';

export class SocialPoster {
  constructor(private readonly logger: Logger) {}

  private async getPageAccessToken(): Promise<string> {
    if (process.env.FACEBOOK_PAGE_ACCESS_TOKEN) {
      return process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    }

    const userToken = process.env.META_ACCESS_TOKEN;
    if (!userToken) throw new Error('META_ACCESS_TOKEN is not set');

    try {
      const res = await axios.get('https://graph.facebook.com/v21.0/me/accounts', {
        params: { access_token: userToken },
      });
      const pages = (res.data?.data ?? []) as Array<{ id: string; access_token: string }>;
      const page = pages.find((p) => p.id === process.env.META_PAGE_ID);
      if (page) return page.access_token;
      this.logger.warn({ found: pages.map((p) => p.id) }, '/me/accounts returned pages but META_PAGE_ID not found — falling back to user token');
    } catch (err: unknown) {
      this.logger.warn({ err: (err as any)?.response?.data ?? String(err) }, '/me/accounts failed — using user token directly');
    }

    return userToken;
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

    await new Promise(resolve => setTimeout(resolve, 8000));

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
}

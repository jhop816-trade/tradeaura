import axios from 'axios';
import { TwitterApi } from 'twitter-api-v2';
import type { Logger } from '../utils/logger.js';

export class SocialPoster {
  private xClient: TwitterApi;

  constructor(private readonly logger: Logger) {
    this.xClient = new TwitterApi({
      appKey: process.env.TWITTER_APP_KEY!,
      appSecret: process.env.TWITTER_APP_SECRET!,
      accessToken: process.env.TWITTER_ACCESS_TOKEN!,
      accessSecret: process.env.TWITTER_ACCESS_SECRET!,
    });
  }

  async postToX(text: string): Promise<{ postId: string }> {
    this.logger.info('Posting to X');
    const tweet = await this.xClient.v2.tweet(text);
    return { postId: tweet.data.id };
  }

  async postToFacebook(message: string): Promise<{ postId: string }> {
    this.logger.info('Posting to Facebook');
    const { data } = await axios.post(
      `https://graph.facebook.com/v21.0/${process.env.META_PAGE_ID}/feed`,
      {
        message,
        access_token: process.env.META_ACCESS_TOKEN,
      },
    );
    return { postId: data.id as string };
  }

  async postToInstagram(caption: string): Promise<{ postId: string }> {
    this.logger.info('Posting to Instagram');
    const imageUrl = process.env.INSTAGRAM_DEFAULT_IMAGE_URL;
    if (!imageUrl) {
      throw new Error('INSTAGRAM_DEFAULT_IMAGE_URL is required for Instagram posts');
    }

    const { data: container } = await axios.post(
      `https://graph.facebook.com/v21.0/${process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID}/media`,
      {
        caption,
        image_url: imageUrl,
        access_token: process.env.META_ACCESS_TOKEN,
      },
    );

    const { data: published } = await axios.post(
      `https://graph.facebook.com/v21.0/${process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID}/media_publish`,
      {
        creation_id: container.id,
        access_token: process.env.META_ACCESS_TOKEN,
      },
    );

    return { postId: published.id as string };
  }
}

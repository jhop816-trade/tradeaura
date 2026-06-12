import Anthropic from '@anthropic-ai/sdk';
import {
  AuditReportPrompt,
  FacebookPostPrompt,
  InstagramPostPrompt,
  TikTokScriptPrompt,
  WeekCalendarPrompt,
  XPostPrompt,
} from '../prompts/marketingPrompts.js';
import type { Logger } from '../utils/logger.js';

const MODEL = 'claude-sonnet-4-6';

function extractText(response: Anthropic.Message): string {
  const block = response.content[0];
  if (!block || block.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }
  return block.text.trim();
}

export class ContentGenerator {
  constructor(
    private readonly anthropic: Anthropic,
    private readonly logger: Logger,
  ) {}

  async generateXPost(
    slot: 'morning' | 'midday' | 'afternoon' | 'evening',
    recentTopics: string[] = [],
  ): Promise<{ text: string }> {
    this.logger.info({ slot }, 'Generating X post');
    const response = await this.anthropic.messages.create({
      model: MODEL,
      max_tokens: 400,
      messages: [{ role: 'user', content: XPostPrompt(slot, recentTopics) }],
    });
    return { text: extractText(response) };
  }

  async generateInstagramPost(recentTopics: string[] = []): Promise<{ caption: string }> {
    this.logger.info('Generating Instagram post');
    const response = await this.anthropic.messages.create({
      model: MODEL,
      max_tokens: 600,
      messages: [{ role: 'user', content: InstagramPostPrompt(recentTopics) }],
    });
    return { caption: extractText(response) };
  }

  async generateFacebookPost(recentTopics: string[] = []): Promise<{ message: string }> {
    this.logger.info('Generating Facebook post');
    const response = await this.anthropic.messages.create({
      model: MODEL,
      max_tokens: 800,
      messages: [{ role: 'user', content: FacebookPostPrompt(recentTopics) }],
    });
    return { message: extractText(response) };
  }

  async generateTikTokScript(): Promise<{ script: string }> {
    this.logger.info('Generating TikTok script');
    const response = await this.anthropic.messages.create({
      model: MODEL,
      max_tokens: 600,
      messages: [{ role: 'user', content: TikTokScriptPrompt() }],
    });
    return { script: extractText(response) };
  }

  async generateWeekCalendar(
    recentTopics: string[],
  ): Promise<Array<{ platform: string; title: string; content: string }>> {
    this.logger.info('Generating week calendar');
    const response = await this.anthropic.messages.create({
      model: MODEL,
      max_tokens: 4000,
      messages: [{ role: 'user', content: WeekCalendarPrompt(recentTopics) }],
    });
    const raw = extractText(response);

    const pieces: Array<{ platform: string; title: string; content: string }> = [];
    const blocks = raw.split('---').map((b) => b.trim()).filter(Boolean);
    for (const block of blocks) {
      const platformMatch = block.match(/^PLATFORM:\s*(.+)$/m);
      const titleMatch = block.match(/^TITLE:\s*(.+)$/m);
      const contentMatch = block.match(/^CONTENT:\s*([\s\S]+?)(?=\n[A-Z]+:|$)/m);
      if (platformMatch && titleMatch && contentMatch) {
        pieces.push({
          platform: platformMatch[1].trim().toLowerCase(),
          title: titleMatch[1].trim(),
          content: contentMatch[1].trim(),
        });
      }
    }

    return pieces;
  }

  async generateAuditReport(recentPosts: string[]): Promise<{ report: string }> {
    this.logger.info('Generating weekly audit report');
    const response = await this.anthropic.messages.create({
      model: MODEL,
      max_tokens: 600,
      messages: [{ role: 'user', content: AuditReportPrompt(recentPosts) }],
    });
    return { report: extractText(response) };
  }
}

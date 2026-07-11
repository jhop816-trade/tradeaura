import Anthropic from '@anthropic-ai/sdk';
import {
  AuditReportPrompt,
  InstagramPostPrompt,
  WeekCalendarPrompt,
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

  async generateInstagramPost(recentTopics: string[] = [], weights?: Record<string, number>): Promise<{ caption: string }> {
    this.logger.info('Generating Instagram post');
    const response = await this.anthropic.messages.create({
      model: MODEL,
      max_tokens: 600,
      messages: [{ role: 'user', content: InstagramPostPrompt(recentTopics, weights) }],
    });
    return { caption: extractText(response) };
  }

  async generateWeekCalendar(
    recentTopics: string[],
    weights?: Record<string, number>,
  ): Promise<Array<{ platform: string; title: string; content: string; pillar: string | null; format: string | null }>> {
    this.logger.info('Generating week calendar');
    const response = await this.anthropic.messages.create({
      model: MODEL,
      max_tokens: 4000,
      messages: [{ role: 'user', content: WeekCalendarPrompt(recentTopics, weights) }],
    });
    const raw = extractText(response);

    const pieces: Array<{ platform: string; title: string; content: string; pillar: string | null; format: string | null }> = [];
    const blocks = raw.split('---').map((b) => b.trim()).filter(Boolean);
    for (const block of blocks) {
      const platformMatch = block.match(/^PLATFORM:\s*(.+)$/m);
      const titleMatch = block.match(/^TITLE:\s*(.+)$/m);
      const contentMatch = block.match(/^CONTENT:\s*([\s\S]+?)(?=\n[A-Z]+:|$)/m);
      const pillarMatch = block.match(/^PILLAR:\s*(.+)$/m);
      const formatMatch = block.match(/^FORMAT:\s*(.+)$/m);
      if (platformMatch && titleMatch && contentMatch) {
        pieces.push({
          platform: platformMatch[1].trim().toLowerCase(),
          title: titleMatch[1].trim(),
          content: contentMatch[1].trim(),
          pillar: pillarMatch ? pillarMatch[1].trim().toLowerCase() : null,
          format: formatMatch ? formatMatch[1].trim().toLowerCase() : null,
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

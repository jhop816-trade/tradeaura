import type Anthropic from '@anthropic-ai/sdk';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Logger } from '../utils/logger.js';

const MODEL = 'claude-sonnet-4-6';

interface AdsSnapshotRow {
  id: string;
  period_label: string;
  clicks: number | null;
  impressions: number | null;
  avg_cpc: number | null;
  cost: number | null;
  conversions: number | null;
  created_at: string;
}

const EXTRACT_TOOL = {
  name: 'record_snapshot',
  description: 'Extract Google Ads performance numbers from pasted text.',
  input_schema: {
    type: 'object' as const,
    properties: {
      period_label: { type: 'string', description: 'What period this covers, e.g. "last 30 days", "this week". Best guess if not stated.' },
      clicks: { type: ['number', 'null'] },
      impressions: { type: ['number', 'null'] },
      avg_cpc: { type: ['number', 'null'], description: 'Average cost per click in dollars, no $ sign' },
      cost: { type: ['number', 'null'], description: 'Total spend in dollars, no $ sign' },
      conversions: { type: ['number', 'null'] },
    },
    required: ['period_label'],
  },
};

/**
 * Parses freeform pasted Google Ads text (screenshots-as-text, dashboard
 * copy/paste, or just typed numbers) into a snapshot row, stores it, and
 * asks Claude to compare against the prior snapshot for a short digest.
 *
 * This is a manual-paste workflow until Google Ads API access is approved —
 * see jubot/.env.example for the placeholders that will replace this once
 * that lands.
 */
export class AdsDigest {
  constructor(
    private readonly anthropic: Anthropic,
    private readonly supabase: SupabaseClient,
    private readonly logger: Logger,
  ) {}

  async recordAndDigest(rawText: string): Promise<string> {
    const extracted = await this.extract(rawText);

    const { data: inserted, error: insertError } = await this.supabase
      .from('ads_snapshots')
      .insert({ ...extracted, raw_text: rawText })
      .select()
      .single();
    if (insertError || !inserted) {
      this.logger.error({ insertError }, 'Failed to store ads snapshot');
      return "Couldn't save that snapshot — try again in a bit.";
    }

    const { data: previous } = await this.supabase
      .from('ads_snapshots')
      .select('*')
      .neq('id', inserted.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return this.buildDigest(inserted as AdsSnapshotRow, previous as AdsSnapshotRow | null);
  }

  private async extract(rawText: string): Promise<{
    period_label: string;
    clicks: number | null;
    impressions: number | null;
    avg_cpc: number | null;
    cost: number | null;
    conversions: number | null;
  }> {
    const res = await this.anthropic.messages.create({
      model: MODEL,
      max_tokens: 500,
      tools: [EXTRACT_TOOL],
      tool_choice: { type: 'tool', name: 'record_snapshot' },
      messages: [
        {
          role: 'user',
          content: `Extract Google Ads performance numbers from this pasted text. Use null for anything not present — don't guess numbers, only guess the period_label if it's genuinely unclear.\n\n${rawText}`,
        },
      ],
    });
    const block = res.content.find((c) => c.type === 'tool_use');
    if (!block || block.type !== 'tool_use') {
      throw new Error('Claude did not return a tool_use block for ads extraction');
    }
    return block.input as {
      period_label: string;
      clicks: number | null;
      impressions: number | null;
      avg_cpc: number | null;
      cost: number | null;
      conversions: number | null;
    };
  }

  private async buildDigest(current: AdsSnapshotRow, previous: AdsSnapshotRow | null): Promise<string> {
    const prompt = previous
      ? `Compare these two Google Ads snapshots for a barber shop (JuFade) and write a short, plain-language digest for the owner — 3-4 sentences max, no jargon, then 1-2 concrete suggestions. Be direct about whether things are trending better or worse.\n\nPrevious (${previous.period_label}, recorded ${previous.created_at}): clicks=${previous.clicks}, impressions=${previous.impressions}, avg_cpc=${previous.avg_cpc}, cost=${previous.cost}, conversions=${previous.conversions}\n\nCurrent (${current.period_label}, recorded ${current.created_at}): clicks=${current.clicks}, impressions=${current.impressions}, avg_cpc=${current.avg_cpc}, cost=${current.cost}, conversions=${current.conversions}`
      : `This is the first Google Ads snapshot recorded for JuFade (a barber shop). Write a short, plain-language summary for the owner — 2-3 sentences, no jargon — and note that future updates will include trend comparisons.\n\n${current.period_label}: clicks=${current.clicks}, impressions=${current.impressions}, avg_cpc=${current.avg_cpc}, cost=${current.cost}, conversions=${current.conversions}`;

    const res = await this.anthropic.messages.create({
      model: MODEL,
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    });
    const text = res.content.find((c) => c.type === 'text');
    return text && text.type === 'text' ? text.text : 'Saved — but the digest failed to generate.';
  }
}

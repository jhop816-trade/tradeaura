import Anthropic from '@anthropic-ai/sdk';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Logger } from './utils/logger.js';
import { AdsDigest } from './tools/adsDigest.js';
import { AppointmentReminders } from './tools/appointmentReminders.js';

const MODEL = 'claude-sonnet-4-6';

const CLASSIFY_TOOL = {
  name: 'classify',
  description: 'Classify what a forwarded Telegram message is about.',
  input_schema: {
    type: 'object' as const,
    properties: {
      kind: {
        type: 'string',
        enum: ['ads_snapshot', 'booking_notification', 'other'],
        description:
          'ads_snapshot = pasted Google Ads numbers/stats (clicks, impressions, cost, conversions). ' +
          'booking_notification = a forwarded Booksy notification about a new/changed appointment. ' +
          'other = anything else (questions, chat, unrelated text).',
      },
    },
    required: ['kind'],
  },
};

/**
 * Central orchestrator, mirroring GID's MarketingAgent pattern: the Telegram
 * bot and the scheduler both call into this, it never talks to Telegram or
 * Supabase directly for business logic — that's delegated to the tools.
 */
export class JuBotAgent {
  private readonly adsDigest: AdsDigest;
  private readonly appointments: AppointmentReminders;

  constructor(
    private readonly anthropic: Anthropic,
    supabase: SupabaseClient,
    private readonly logger: Logger,
  ) {
    this.adsDigest = new AdsDigest(anthropic, supabase, logger);
    this.appointments = new AppointmentReminders(anthropic, supabase, logger);
  }

  /** Routes an incoming Telegram text message to the right tool. */
  async handleMessage(text: string): Promise<string> {
    const trimmed = text.trim();
    if (!trimmed) return "Send me something — pasted ad numbers, a forwarded Booksy notification, or just ask a question.";

    const kind = await this.classify(trimmed);
    this.logger.info({ kind }, 'Classified incoming message');

    switch (kind) {
      case 'ads_snapshot':
        return this.adsDigest.recordAndDigest(trimmed);
      case 'booking_notification':
        return this.appointments.parseAndStore(trimmed);
      default:
        return this.chat(trimmed);
    }
  }

  /** Cron target: fires the weekly nudge to paste fresh ad numbers. */
  weeklyDigestPrompt(): string {
    return '📊 Weekly check-in — paste your Google Ads numbers (clicks, impressions, cost, conversions) from the last 7 days and I\'ll tell you how it\'s trending.';
  }

  /** Cron target: returns reminder lines for any appointment due soon. */
  async checkUpcomingAppointments(): Promise<string[]> {
    const due = await this.appointments.checkUpcoming();
    return due.map((a) => {
      const when = a.appointment_at
        ? new Date(a.appointment_at).toLocaleString('en-US', { timeZone: 'America/New_York', timeStyle: 'short' })
        : 'soon';
      return `⏰ Coming up: ${a.client_name ?? 'Client'} · ${a.service ?? 'appointment'} · ${when}`;
    });
  }

  private async classify(text: string): Promise<'ads_snapshot' | 'booking_notification' | 'other'> {
    try {
      const res = await this.anthropic.messages.create({
        model: MODEL,
        max_tokens: 200,
        tools: [CLASSIFY_TOOL],
        tool_choice: { type: 'tool', name: 'classify' },
        messages: [{ role: 'user', content: text }],
      });
      const block = res.content.find((c) => c.type === 'tool_use');
      if (block && block.type === 'tool_use') {
        return (block.input as { kind: 'ads_snapshot' | 'booking_notification' | 'other' }).kind;
      }
    } catch (err) {
      this.logger.error({ err }, 'Classification failed');
    }
    return 'other';
  }

  private async chat(text: string): Promise<string> {
    const res = await this.anthropic.messages.create({
      model: MODEL,
      max_tokens: 500,
      system:
        "You are jubot, an assistant helping the owner of JuFaded (a private-suite barber shop in Pompano Beach, FL) manage their Google Ads and Google Business Profile. " +
        "You do NOT yet have live API access to Google Ads or Google Business Profile — the owner pastes ad stats manually and forwards Booksy booking notifications manually. " +
        "Be direct, practical, and brief. No corporate marketing-speak.",
      messages: [{ role: 'user', content: text }],
    });
    const textBlock = res.content.find((c) => c.type === 'text');
    return textBlock && textBlock.type === 'text' ? textBlock.text : "Didn't catch that.";
  }
}

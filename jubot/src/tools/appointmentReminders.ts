import type Anthropic from '@anthropic-ai/sdk';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Logger } from '../utils/logger.js';

const MODEL = 'claude-sonnet-4-6';
const TZ = 'America/New_York';

interface AppointmentRow {
  id: string;
  client_name: string | null;
  service: string | null;
  appointment_at: string | null;
  raw_text: string;
  reminded: boolean;
}

const EXTRACT_TOOL = {
  name: 'record_appointment',
  description: 'Extract appointment details from a forwarded Booksy notification.',
  input_schema: {
    type: 'object' as const,
    properties: {
      client_name: { type: ['string', 'null'] },
      service: { type: ['string', 'null'] },
      appointment_at_iso: {
        type: ['string', 'null'],
        description: 'The appointment date/time as an ISO 8601 timestamp with timezone offset. Resolve relative dates ("today", "tomorrow", "Friday") against the provided current time.',
      },
      is_appointment: {
        type: 'boolean',
        description: 'False if this text is not actually a booking notification (e.g. random chat, a question, spam).',
      },
    },
    required: ['is_appointment'],
  },
};

/**
 * No Booksy API is used here — this works entirely off you forwarding
 * Booksy's own new-booking notification (text/email/push) into Telegram.
 * Claude extracts the client, service, and time; jubot reminds YOU before
 * the appointment so you can prep the chair, not the client (no SMS
 * provider is wired up to text clients directly).
 */
export class AppointmentReminders {
  constructor(
    private readonly anthropic: Anthropic,
    private readonly supabase: SupabaseClient,
    private readonly logger: Logger,
  ) {}

  async parseAndStore(rawText: string): Promise<string> {
    const now = new Date().toLocaleString('en-US', { timeZone: TZ });
    const res = await this.anthropic.messages.create({
      model: MODEL,
      max_tokens: 500,
      tools: [EXTRACT_TOOL],
      tool_choice: { type: 'tool', name: 'record_appointment' },
      messages: [
        {
          role: 'user',
          content: `Current date/time in ${TZ}: ${now}.\n\nExtract appointment details from this forwarded Booksy notification. If it doesn't look like a booking notification at all, set is_appointment to false.\n\n${rawText}`,
        },
      ],
    });
    const block = res.content.find((c) => c.type === 'tool_use');
    if (!block || block.type !== 'tool_use') {
      return "Couldn't read that as a booking notification.";
    }
    const parsed = block.input as {
      client_name: string | null;
      service: string | null;
      appointment_at_iso: string | null;
      is_appointment: boolean;
    };

    if (!parsed.is_appointment) {
      return "That doesn't look like a booking notification — forward the actual Booksy message and I'll grab the details.";
    }

    const { error } = await this.supabase.from('appointments').insert({
      client_name: parsed.client_name,
      service: parsed.service,
      appointment_at: parsed.appointment_at_iso,
      raw_text: rawText,
    });
    if (error) {
      this.logger.error({ error }, 'Failed to store appointment');
      return "Got the details but couldn't save them — try again.";
    }

    const when = parsed.appointment_at_iso
      ? new Date(parsed.appointment_at_iso).toLocaleString('en-US', { timeZone: TZ, dateStyle: 'medium', timeStyle: 'short' })
      : 'time unclear — check the original message';
    return `Got it — ${parsed.client_name ?? 'client'} · ${parsed.service ?? 'service'} · ${when}. I'll remind you before it.`;
  }

  /** Cron target: pings you ~60 min before any un-reminded appointment. */
  async checkUpcoming(): Promise<AppointmentRow[]> {
    const windowStart = new Date().toISOString();
    const windowEnd = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const { data, error } = await this.supabase
      .from('appointments')
      .select('*')
      .eq('reminded', false)
      .not('appointment_at', 'is', null)
      .gte('appointment_at', windowStart)
      .lte('appointment_at', windowEnd);

    if (error) {
      this.logger.error({ error }, 'Failed to query upcoming appointments');
      return [];
    }
    const due = (data ?? []) as AppointmentRow[];
    if (due.length > 0) {
      const ids = due.map((a) => a.id);
      await this.supabase.from('appointments').update({ reminded: true }).in('id', ids);
    }
    return due;
  }
}

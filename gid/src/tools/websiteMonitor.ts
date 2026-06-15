import axios from 'axios';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { AgentMemory } from '../memory/agentMemory.js';
import type { Alerter } from '../utils/alerter.js';
import { AlertMessages } from '../utils/alerter.js';
import type { Logger } from '../utils/logger.js';

export class WebsiteMonitor {
  private consecutiveFailures = 0;

  constructor(
    private readonly supabase: SupabaseClient,
    private readonly memory: AgentMemory,
    private readonly alerter: Alerter,
    private readonly logger: Logger,
  ) {}

  async check(): Promise<void> {
    const url = process.env.TRADEAURA_URL!;
    try {
      const response = await axios.get(url, {
        timeout: 10_000,
        validateStatus: (s) => s < 500,
      });

      if (response.status >= 500) throw new Error(`HTTP ${response.status}`);

      this.consecutiveFailures = 0;
      await this.memory.upsert('website-monitor', 'site-status', {
        up: true,
        checkedAt: new Date().toISOString(),
      });
      this.logger.debug({ url }, 'Site check OK');
    } catch (err) {
      this.consecutiveFailures++;
      const statusCode = axios.isAxiosError(err) ? (err.response?.status ?? 0) : 0;
      const checkedAt = new Date().toISOString();

      await this.memory.upsert('website-monitor', 'site-status', {
        up: false,
        statusCode,
        checkedAt,
      });

      this.logger.warn({ url, statusCode, consecutiveFailures: this.consecutiveFailures }, 'Site check failed');

      if (this.consecutiveFailures >= 2) {
        const time = new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York' });
        await this.alerter.send(AlertMessages.siteDown(statusCode, time));
        await this.supabase.from('system_alerts').insert({
          alert_type: 'website_down',
          message: `TradeAura returned ${statusCode} at ${time}`,
          resolved: false,
        });
        this.consecutiveFailures = 0;
      }
    }
  }
}

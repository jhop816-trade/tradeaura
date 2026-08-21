import cron from 'node-cron';
import type { JuBotAgent } from '../agent.js';
import type { TelegramBot } from '../telegram/telegramBot.js';
import type { Logger } from './logger.js';

const TZ = 'America/New_York';

export class Scheduler {
  constructor(
    private readonly agent: JuBotAgent,
    private readonly telegram: TelegramBot,
    private readonly logger: Logger,
  ) {}

  registerAll(): void {
    // Monday 9am — nudge to paste the week's ad numbers
    cron.schedule('0 9 * * 1', () => this.wrap('weekly-digest-prompt', async () => {
      await this.telegram.sendMessage(this.agent.weeklyDigestPrompt());
    }), { timezone: TZ });

    // Every 10 minutes — check for appointments due in the next hour
    cron.schedule('*/10 * * * *', () => this.wrap('appointment-check', async () => {
      const reminders = await this.agent.checkUpcomingAppointments();
      for (const line of reminders) {
        await this.telegram.sendMessage(line);
      }
    }), { timezone: TZ });

    this.logger.info('All cron jobs registered');
  }

  private wrap(jobName: string, fn: () => Promise<void>): void {
    fn().catch((err) => {
      this.logger.error({ jobName, err }, 'Unhandled error in cron job');
    });
  }
}

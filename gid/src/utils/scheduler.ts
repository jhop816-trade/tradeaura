import cron from 'node-cron';
import type { MarketingAgent } from '../agents/marketingAgent.js';
import type { WebsiteMonitor } from '../tools/websiteMonitor.js';
import type { Logger } from './logger.js';

const TZ = 'America/New_York';

export class Scheduler {
  constructor(
    private readonly agent: MarketingAgent,
    private readonly monitor: WebsiteMonitor,
    private readonly logger: Logger,
  ) {}

  registerAll(): void {
    cron.schedule('30 7 * * *', () => this.wrap('tiktok-draft', () => this.agent.generateTikTokDraft()), { timezone: TZ });
    cron.schedule('0 9 * * *', () => this.wrap('instagram', () => this.agent.postInstagram()), { timezone: TZ });
    cron.schedule('30 9 * * *', () => this.wrap('x-morning', () => this.agent.postX('morning')), { timezone: TZ }); // X morning 9:30am NY
    cron.schedule('0 10 * * *', () => this.wrap('facebook', () => this.agent.postFacebook()), { timezone: TZ });
    cron.schedule('0 13 * * *', () => this.wrap('x-midday', () => this.agent.postX('midday')), { timezone: TZ }); // X midday 1pm NY
    cron.schedule('0 17 * * *', () => this.wrap('daily-summary', () => this.agent.sendDailySummary()), { timezone: TZ });
    cron.schedule('0 18 * * *', () => this.wrap('x-evening', () => this.agent.postX('evening')), { timezone: TZ }); // X evening 6pm NY
    cron.schedule('0 6 * * 0', () => this.wrap('weekly-audit', () => this.agent.weeklyContentAudit()), { timezone: TZ });
    cron.schedule('*/5 * * * *', () => this.wrap('site-monitor', () => this.monitor.check()), { timezone: TZ });
    this.logger.info('All cron jobs registered');
  }

  private wrap(jobName: string, fn: () => Promise<void>): void {
    fn().catch((err) => {
      this.logger.error({ jobName, err }, 'Unhandled error in cron job');
    });
  }
}

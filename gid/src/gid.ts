import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { MarketingAgent } from './agents/marketingAgent.js';
import { AgentMemory } from './memory/agentMemory.js';
import { TelegramBot } from './telegram/telegramBot.js';
import { ContentGenerator } from './tools/contentGenerator.js';
import { SocialPoster } from './tools/socialPoster.js';
import { TiktokDrafter } from './tools/tiktokDrafter.js';
import { WebsiteMonitor } from './tools/websiteMonitor.js';
import { Alerter, AlertMessages } from './utils/alerter.js';
import { buildLogger } from './utils/logger.js';
import { Scheduler } from './utils/scheduler.js';

const REQUIRED_ENV = [
  'ANTHROPIC_API_KEY',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_CHAT_ID',
  'TRADEAURA_URL',
];

function validateEnv(): void {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

async function main(): Promise<void> {
  validateEnv();

  const logger = buildLogger();
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const alerter = new Alerter(logger);
  const memory = new AgentMemory(supabase, logger);
  const contentGenerator = new ContentGenerator(anthropic, logger);
  const socialPoster = new SocialPoster(logger);
  const tiktokDrafter = new TiktokDrafter(supabase, logger);
  const monitor = new WebsiteMonitor(supabase, memory, alerter, logger);
  const agent = new MarketingAgent(
    supabase,
    contentGenerator,
    socialPoster,
    tiktokDrafter,
    memory,
    alerter,
    logger,
  );
  const scheduler = new Scheduler(agent, monitor, logger);
  const telegramBot = new TelegramBot(supabase, memory, anthropic, logger);

  process.on('uncaughtException', async (err) => {
    logger.fatal({ err }, 'Uncaught exception');
    await alerter.send(AlertMessages.sentryError(`Uncaught exception: ${err.message}`));
    process.exit(1);
  });

  process.on('unhandledRejection', async (reason) => {
    logger.fatal({ reason }, 'Unhandled rejection');
    await alerter.send(AlertMessages.sentryError(`Unhandled rejection: ${String(reason)}`));
    process.exit(1);
  });

  scheduler.registerAll();
  telegramBot.start();
  await alerter.send(AlertMessages.online());
  logger.info('GID started');
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});

import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { JuBotAgent } from './agent.js';
import { TelegramBot } from './telegram/telegramBot.js';
import { Scheduler } from './utils/scheduler.js';
import { Alerter, AlertMessages } from './utils/alerter.js';
import { buildLogger } from './utils/logger.js';

const REQUIRED_ENV = [
  'ANTHROPIC_API_KEY',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_CHAT_ID',
];

function validateEnv(): void {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}. See .env.example.`);
  }
}

async function main(): Promise<void> {
  validateEnv();

  const logger = buildLogger();
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const alerter = new Alerter(logger);

  const agent = new JuBotAgent(anthropic, supabase, logger);
  const telegram = new TelegramBot(agent, logger);
  const scheduler = new Scheduler(agent, telegram, logger);

  process.on('uncaughtException', async (err) => {
    logger.fatal({ err }, 'Uncaught exception');
    await alerter.send(AlertMessages.crash(err.message));
    process.exit(1);
  });

  process.on('unhandledRejection', async (reason) => {
    logger.fatal({ reason }, 'Unhandled rejection');
    await alerter.send(AlertMessages.crash(String(reason)));
    process.exit(1);
  });

  scheduler.registerAll();
  telegram.start();

  logger.info('jubot started');
  await alerter.send(AlertMessages.online());
}

main().catch((err) => {
  console.error('[jubot] Fatal startup error:', err);
  process.exit(1);
});

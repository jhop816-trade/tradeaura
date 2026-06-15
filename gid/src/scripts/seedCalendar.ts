import 'dotenv/config';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';

const CALENDAR_HTML_PATH = resolve(
  process.cwd(),
  '../artifacts/tradeaura/public/calendar.html',
);

interface CalendarRow {
  day_number: number;
  scheduled_date: string;
  platform: string;
  slot: string | null;
  title: string | null;
  content: string;
  image_url: string | null;
  status: string;
}

function getScheduledDate(dayNumber: number): string {
  const today = new Date();
  const d = new Date(today);
  d.setDate(today.getDate() + (dayNumber - 1));
  return d.toISOString().slice(0, 10);
}

async function main(): Promise<void> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const html = readFileSync(CALENDAR_HTML_PATH, 'utf-8');
  const $ = cheerio.load(html);

  const rows: CalendarRow[] = [];

  for (let day = 1; day <= 21; day++) {
    const scheduledDate = getScheduledDate(day);
    const daySection = $(`#day${day}`);

    const cards = daySection.find('.card');
    const slots = ['a', 'b'];

    cards.each((cardIdx, cardEl) => {
      const slot = slots[cardIdx] ?? String(cardIdx + 1);
      const title = $(cardEl).find('.card-lbl').first().text().trim() || null;

      const igId = `ig-d${day}${slot}`;
      const ttId = `tt-d${day}${slot}`;

      const igContent = $(`#${igId}`).text().trim();
      const ttContent = $(`#${ttId}`).text().trim();

      if (igContent) {
        rows.push({
          day_number: day,
          scheduled_date: scheduledDate,
          platform: 'instagram',
          slot: null,
          title,
          content: igContent,
          image_url: `https://tradeauraapp.com/ig/d${day}${slot}.jpg`,
          status: 'scheduled',
        });
      }

      if (ttContent) {
        rows.push({
          day_number: day,
          scheduled_date: scheduledDate,
          platform: 'tiktok',
          slot: null,
          title,
          content: ttContent,
          image_url: null,
          status: 'scheduled',
        });
      }
    });
  }

  if (rows.length === 0) {
    console.log('No rows parsed from calendar HTML — check the file path and structure');
    process.exit(1);
  }

  const { error } = await supabase.from('content_calendar').insert(rows);
  if (error) {
    console.error('Insert failed:', error);
    process.exit(1);
  }

  console.log(`Inserted ${rows.length} rows into content_calendar`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const posts = [
  {
    file: '/tmp/ig/feature_1_ai_grading.png',
    storageName: 'feature_ai_grading.png',
    platform: 'instagram',
    title: 'AI Trade Grading',
    content: `Your trading coach doesn't have opinions. It has your rules.

TradeAura's AI grades every trade A–F based on the criteria YOU set. Did you wait for confirmation? Size correctly? Enter at the right level? It reflects your own standards back at you — no excuses, no ego.

An A trade with a loss is still an A. A B trade that printed is still a B. Process is the score.

Most traders don't know if they're executing well. Now you will.

Link in bio — try TradeAura free.

#trading #tradingjournal #ict #smartmoneyconcepts #daytrader #tradeaura #aitrading #propfirm`,
  },
  {
    file: '/tmp/ig/feature_2_trade_journal.png',
    storageName: 'feature_trade_journal.png',
    platform: 'instagram',
    title: 'Trade Journal',
    content: `The traders who improve fastest have one thing in common: they write everything down.

TradeAura's journal captures symbol, direction, entry, exit, setup name, mood, and notes. Takes 30 seconds per trade. What you get back over 100 trades is something no one else has — a map of your own patterns.

Win rate by mood. P&L by time of day. Your best setups vs your worst. None of that exists without the log.

Every trade you skip logging is data you lose forever.

Link in bio — try TradeAura free.

#trading #tradingjournal #ict #smartmoneyconcepts #daytrader #tradeaura #aitrading #propfirm`,
  },
  {
    file: '/tmp/ig/feature_3_performance_stats.png',
    storageName: 'feature_performance_stats.png',
    platform: 'instagram',
    title: 'Performance Stats',
    content: `Gut feeling is not an edge. Numbers are.

TradeAura surfaces your real win rate, profit factor, average winner vs average loser, and best/worst setups — all from your own trade history. The more you log, the sharper it gets.

Most traders are surprised. The setup they think is their best often isn't. The session they think kills them isn't always Monday. The data disagrees with the story.

Stop guessing. Start knowing.

Link in bio — try TradeAura free.

#trading #tradingjournal #ict #smartmoneyconcepts #daytrader #tradeaura #aitrading #propfirm`,
  },
  {
    file: '/tmp/ig/feature_4_playbook.png',
    storageName: 'feature_playbook.png',
    platform: 'instagram',
    title: 'Setup Playbook',
    content: `Not all setups are created equal. Some are making you money. Some are draining it. Most traders have no idea which is which.

TradeAura's Playbook tracks every setup you trade — VWAP reclaim, PDH rejection, opening range break, whatever you name it. It shows win rate, average R:R, and trade count for each one automatically.

One number changes everything: when you see a setup sitting at 41% win rate after 20+ trades, you stop taking it. That's the edge hiding in your own journal.

Cut what's costing you. Scale what's working.

Link in bio — try TradeAura free.

#trading #tradingjournal #ict #smartmoneyconcepts #daytrader #tradeaura #aitrading #propfirm`,
  },
  {
    file: '/tmp/ig/feature_5_ai_coach.png',
    storageName: 'feature_ai_coach.png',
    platform: 'instagram',
    title: 'AI Coach & Market Prep',
    content: `What if you had a coach who knew every trade you'd ever taken — and was ready to talk before the open every morning?

TradeAura's AI Coach gives you a daily market briefing with key levels before the bell. Then it stays available to answer questions about any trade, any setup, any pattern it's seeing in your data.

It told one trader: "Your first-15-minute trades are 38% WR vs 67% after. Wait for structure." That one insight was worth a month of subscription.

Your data. Your patterns. Your coach.

Link in bio — try TradeAura free.

#trading #tradingjournal #ict #smartmoneyconcepts #daytrader #tradeaura #aitrading #propfirm`,
  },
];

// Start dates — spread over the next 5 days starting tomorrow
const today = new Date();
const rows = posts.map((post, i) => {
  const d = new Date(today);
  d.setDate(d.getDate() + i + 1);
  return { ...post, scheduledDate: d.toISOString().slice(0, 10) };
});

async function uploadImage(filePath, storageName) {
  const bytes = readFileSync(filePath);
  const { data, error } = await supabase.storage
    .from('marketing-assets')
    .upload(`feature-posts/${storageName}`, bytes, {
      contentType: 'image/png',
      upsert: true,
    });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  const { data: urlData } = supabase.storage
    .from('marketing-assets')
    .getPublicUrl(`feature-posts/${storageName}`);
  return urlData.publicUrl;
}

async function main() {
  console.log('Uploading images to Supabase Storage...');

  const calendarRows = [];
  for (const row of rows) {
    console.log(`  Uploading ${row.storageName}...`);
    let imageUrl;
    try {
      imageUrl = await uploadImage(row.file, row.storageName);
      console.log(`  ✓ ${imageUrl}`);
    } catch (err) {
      console.error(`  ✗ Upload failed for ${row.storageName}: ${err.message}`);
      imageUrl = null;
    }

    calendarRows.push({
      scheduled_date: row.scheduledDate,
      platform: row.platform,
      slot: null,
      title: row.title,
      content: row.content,
      image_url: imageUrl,
      status: 'scheduled',
    });
  }

  console.log('\nInserting into content_calendar...');
  const { data, error } = await supabase.from('content_calendar').insert(calendarRows).select('id, scheduled_date, title, image_url');
  if (error) {
    console.error('Insert failed:', error.message);
    process.exit(1);
  }
  console.log('✓ Inserted rows:');
  data.forEach(r => console.log(`  [${r.scheduled_date}] ${r.title} — image: ${r.image_url ?? 'none'}`));
  console.log('\nDone.');
}

main().catch(err => { console.error(err); process.exit(1); });

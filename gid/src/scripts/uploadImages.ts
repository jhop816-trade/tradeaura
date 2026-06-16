import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { resolve } from 'path';

const IMAGE_DIR = resolve(process.cwd(), '../artifacts/tradeaura/public/ig');

async function main(): Promise<void> {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const files = readdirSync(IMAGE_DIR).filter(f => /^d\d+[ab]\.jpg$/.test(f)).sort();
  console.log(`Found ${files.length} images to upload`);

  let ok = 0;
  let skip = 0;
  let fail = 0;

  for (const filename of files) {
    const data = readFileSync(resolve(IMAGE_DIR, filename));
    const { error } = await supabase.storage
      .from('Images')
      .upload(filename, data, { contentType: 'image/jpeg', upsert: true });

    if (error) {
      console.error(`FAIL ${filename}: ${error.message}`);
      fail++;
    } else {
      console.log(`OK   ${filename}`);
      ok++;
    }
  }

  console.log(`\nDone — ${ok} uploaded, ${skip} skipped, ${fail} failed`);
}

main().catch(err => { console.error(err); process.exit(1); });

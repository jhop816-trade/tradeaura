import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { gradeTrade, type TradeInput } from "../src/lib/grade-trade.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env") });

interface Fixture {
  id: string;
  description: string;
  trade: TradeInput;
  expectedGrade: string;
}

const GRADE_ORDER = ["A", "B", "C", "D", "F"];

function withinOne(actual: string, expected: string): boolean {
  const ai = GRADE_ORDER.indexOf(actual);
  const ei = GRADE_ORDER.indexOf(expected);
  return ai !== -1 && ei !== -1 && Math.abs(ai - ei) <= 1;
}

async function main() {
  const fixtures: Fixture[] = JSON.parse(
    readFileSync(resolve(__dirname, "fixtures.json"), "utf-8"),
  );

  console.log(`Running eval on ${fixtures.length} fixtures...\n`);

  let exactMatches = 0;
  let withinOneMatches = 0;

  for (const f of fixtures) {
    process.stdout.write(`  ${f.id}: `);
    try {
      const result = await gradeTrade(f.trade);
      const exact = result.grade === f.expectedGrade;
      const close = withinOne(result.grade, f.expectedGrade);

      if (exact) exactMatches++;
      if (close) withinOneMatches++;

      const status = exact ? "✓" : close ? "~" : "✗";
      console.log(
        `${status} got=${result.grade} expected=${f.expectedGrade} confidence=${result.confidence} low=${result.reviewManually}`,
      );
    } catch (err) {
      console.log(`ERROR: ${(err as Error).message}`);
    }
  }

  const total = fixtures.length;
  const exactPct = Math.round((exactMatches / total) * 100);
  const withinOnePct = Math.round((withinOneMatches / total) * 100);

  console.log(`\nResults:`);
  console.log(`  Exact match:    ${exactMatches}/${total} (${exactPct}%)`);
  console.log(`  Within-1 grade: ${withinOneMatches}/${total} (${withinOnePct}%)`);

  const BASELINE = 70;
  if (withinOnePct < BASELINE) {
    console.error(`\nFAIL: within-one accuracy ${withinOnePct}% is below baseline ${BASELINE}%`);
    process.exit(1);
  }
  console.log(`\nPASS: within-one accuracy ${withinOnePct}% meets baseline ${BASELINE}%`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

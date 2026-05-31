import { Router, type IRouter } from "express";
import healthRouter from "./health";
import tradesRouter from "./trades";
import instrumentsRouter from "./instruments";
import aiRouter from "./ai";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.use(healthRouter);

// Unprotected debug endpoint (no auth required — remove after diagnosis)
router.get("/debug-prices", async (req: any, res) => {
  const tdKey = process.env.TWELVE_DATA_KEY;
  if (!tdKey) { res.json({ error: "TWELVE_DATA_KEY not set" }); return; }
  try {
    const r = await fetch(`https://api.twelvedata.com/quote?symbol=SPY&apikey=${tdKey}`);
    const body = await r.text();
    res.json({ status: (r as any).status, keyLength: tdKey.length, body });
  } catch (e: unknown) { res.json({ error: String(e) }); }
});

router.use(requireAuth);
router.use(tradesRouter);
router.use(instrumentsRouter);
router.use(aiRouter);

export default router;

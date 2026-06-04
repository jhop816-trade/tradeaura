import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import { pinoHttp } from "pino-http";
import { clerkMiddleware } from "./middlewares/auth";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(pinoHttp({
  logger,
  serializers: {
    req(req: any) { return { id: req.id, method: req.method, url: req.url?.split("?")[0] }; },
    res(res: any) { return { statusCode: res.statusCode }; },
  },
}));

app.use(cors({
  origin: process.env.VYBE_FRONTEND_URL ?? true,
  credentials: true,
}));

// Must be before express.json() so that the raw body is available for Stripe signature verification
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(clerkMiddleware());
app.use("/api", router);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(err, "Unhandled error");
  const cause = (err as any).cause;
  const causeMsg = cause instanceof Error ? cause.message : (cause ? String(cause) : "");
  res.status(500).json({ error: causeMsg || err.message || "Internal server error" });
});

export default app;

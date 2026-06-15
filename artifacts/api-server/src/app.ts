import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import { pinoHttp } from 'pino-http';
import rateLimit from "express-rate-limit";
import router from "./routes";
import { logger } from "./lib/logger";

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many AI requests — please wait before trying again." },
});

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req: any) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res: any) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
// Raw body required for Stripe webhook signature verification
app.use("/api/billing/webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api", generalLimiter, router);

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error(err, "Unhandled error");
  const cause = (err as any).cause;
  const causeMsg = cause instanceof Error ? cause.message : (cause ? String(cause) : "");
  res.status(500).json({ error: causeMsg || err.message || "Internal server error" });
});

export default app;

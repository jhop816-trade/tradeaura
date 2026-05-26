import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import { pinoHttp } from 'pino-http';
import router from "./routes";
import { logger } from "./lib/logger";

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
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api", router);

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error(err, "Unhandled error");
  const cause = (err as any).cause;
  const causeMsg = cause instanceof Error ? cause.message : (cause ? String(cause) : "");
  res.status(500).json({ error: causeMsg || err.message || "Internal server error" });
});

export default app;

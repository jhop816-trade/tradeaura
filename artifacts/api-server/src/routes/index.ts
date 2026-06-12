import { Router, type IRouter } from "express";
import healthRouter from "./health";
import tradesRouter from "./trades";
import instrumentsRouter from "./instruments";
import aiRouter from "./ai";
import { billingPublicRouter, billingRouter } from "./billing";
import { requireAuth } from "../middlewares/auth";
import { aiLimiter } from "../app";

const router: IRouter = Router();

router.use(healthRouter);
router.use(billingPublicRouter);
router.use(requireAuth);
router.use(tradesRouter);
router.use(instrumentsRouter);
router.use("/ai", aiLimiter);
router.use(aiRouter);
router.use(billingRouter);

export default router;

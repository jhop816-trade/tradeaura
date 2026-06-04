import { Router, type IRouter } from "express";
import healthRouter from "./health";
import tradesRouter from "./trades";
import instrumentsRouter from "./instruments";
import aiRouter from "./ai";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(requireAuth);
router.use(tradesRouter);
router.use(instrumentsRouter);
router.use(aiRouter);

export default router;

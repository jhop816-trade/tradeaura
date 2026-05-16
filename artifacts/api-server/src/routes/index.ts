import { Router, type IRouter } from "express";
import healthRouter from "./health";
import tradesRouter from "./trades";
import instrumentsRouter from "./instruments";

const router: IRouter = Router();

router.use(healthRouter);
router.use(tradesRouter);
router.use(instrumentsRouter);

export default router;

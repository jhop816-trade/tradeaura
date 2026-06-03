import { Router } from "express";
import healthRouter from "./health";
import providersRouter from "./providers";
import servicesRouter from "./services";
import bookingsRouter from "./bookings";
import clientsRouter from "./clients";
import uploadRouter from "./upload";
import workingHoursRouter from "./working-hours";
import favoritesRouter from "./favorites";
import reviewsRouter from "./reviews";

const router = Router();

router.use(healthRouter);
router.use("/providers", providersRouter);
router.use("/services", servicesRouter);
router.use("/bookings", bookingsRouter);
router.use("/clients", clientsRouter);
router.use("/upload", uploadRouter);
router.use("/working-hours", workingHoursRouter);
router.use("/favorites", favoritesRouter);
router.use("/reviews", reviewsRouter);

export default router;

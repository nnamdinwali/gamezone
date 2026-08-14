import { Router, type IRouter } from "express";
import healthRouter from "./health";
import gamesRouter from "./games";
import usersRouter from "./users";
import playSessionsRouter from "./play_sessions";
import earningsRouter from "./earnings";
import leaderboardRouter from "./leaderboard";
import dashboardRouter from "./dashboard";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(gamesRouter);
router.use(usersRouter);
router.use(playSessionsRouter);
router.use(earningsRouter);
router.use(leaderboardRouter);
router.use(dashboardRouter);
router.use(adminRouter);

export default router;

import { Router } from "express";
import { AgentController } from "./agent.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { USER_ROLES } from "../user/user.interface";

const router = Router();

router.post("/cash-in", checkAuth(USER_ROLES.AGENT), AgentController.cashIn);
router.post("/cash-out", checkAuth(USER_ROLES.AGENT), AgentController.cashOut);

export const AgentRoute = router;
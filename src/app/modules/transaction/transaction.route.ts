import { Router } from "express";
import { TransactionController } from "./transaction.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { USER_ROLES } from "../user/user.interface";

const router = Router();

router.get("/", checkAuth(USER_ROLES.AGENT, USER_ROLES.USER), TransactionController.getAllTransactions);

export const transactionRoutes = router;
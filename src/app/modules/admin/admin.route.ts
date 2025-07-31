import { Router } from "express";
import { AdminController } from "./admin.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { USER_ROLES } from "../user/user.interface";

const router = Router();


router.get("/users", checkAuth(USER_ROLES.ADMIN), AdminController.getAllUsers);
router.get("/wallets", checkAuth(USER_ROLES.ADMIN), AdminController.getAllWallets);
router.patch("/wallets/:walletId/block", checkAuth(USER_ROLES.ADMIN), AdminController.walletBlockUnblock);
router.get("/agents", checkAuth(USER_ROLES.ADMIN), AdminController.getAllAgents);
router.patch("/agents/:userId/approve", checkAuth(USER_ROLES.ADMIN), AdminController.agentApproval);
router.get("/transactions", checkAuth(USER_ROLES.ADMIN), AdminController.getAllTransactions);


export const adminRoutes = router;
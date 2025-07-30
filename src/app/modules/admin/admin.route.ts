import { Router } from "express";
import { AdminController } from "./admin.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { USER_ROLES } from "../user/user.interface";

const router = Router();


router.get("/users", checkAuth(USER_ROLES.ADMIN), AdminController.getAllUsers);
router.get("/wallets", checkAuth(USER_ROLES.ADMIN), AdminController.getAllWallets);
router.patch("/wallets/:walletId/block", checkAuth(USER_ROLES.ADMIN), AdminController.walletBlockUnblock);

export const adminRoutes = router;
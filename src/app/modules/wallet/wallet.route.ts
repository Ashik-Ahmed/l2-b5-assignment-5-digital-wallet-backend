import { Router } from "express";
import { WalletController } from "./wallet.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { USER_ROLES } from "../user/user.interface";

const router = Router();

router.get("/:walletId/balance", checkAuth(USER_ROLES.ADMIN), WalletController.getWalletBalance);

export const WalletRoute = router;
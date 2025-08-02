import { Router } from "express";
import { WalletController } from "./wallet.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { USER_ROLES } from "../user/user.interface";

const router = Router();

router.post("/add-money", checkAuth(USER_ROLES.USER), WalletController.addMoneyToWallet);
router.post("/send-money", checkAuth(USER_ROLES.USER), WalletController.sendMoney);
router.post("/cash-out", checkAuth(USER_ROLES.USER), WalletController.cashOutByUser);
router.get("/balance", checkAuth(USER_ROLES.USER, USER_ROLES.AGENT), WalletController.getWalletBalance);

export const WalletRoute = router;
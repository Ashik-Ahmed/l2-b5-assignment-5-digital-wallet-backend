import { Router } from "express";
import { WalletController } from "./wallet.controller";

const router = Router();

router.get("/:walletId/balance", WalletController.getWalletBalance);

export const WalletRoute = router;
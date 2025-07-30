import AppError from "../../errorHelpers/AppError";
import { Wallet } from "./wallet.model";

const getWalletBalance = async (walletId: string) => {
    const wallet = await Wallet.findById(walletId).select("balance isBlocked dailyLimit monthlyLimit dailySpent monthlySpent -_id");

    if (!wallet) {
        throw new AppError(404, "Wallet not found");
    }

    return wallet;
}

export const WalletService = {
    getWalletBalance
}
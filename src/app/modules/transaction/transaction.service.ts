import { Request } from "express";
import { Wallet } from "../wallet/wallet.model";

const getAllTransactions = async (req: Request) => {

    const transactions = await Wallet.find({ userId: req.user.userId }).select("transactions -_id").populate("transactions").sort({ createdAt: -1 });
    const totalTransactions = await Wallet.find({ userId: req.user.userId }).countDocuments({});

    return {
        transactions,
        meta: {
            total: totalTransactions
        }
    };
}

export const TransactionService = {
    getAllTransactions
}
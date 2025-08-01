import { Request } from "express";
import { Wallet } from "../wallet/wallet.model";
import { Transaction } from "./transaction.model";

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

const getTransactionById = async (id: string) => {

    const transaction = await Transaction.findById(id).populate("fromWallet").populate("toWallet").populate("fromUser").populate("toUser").populate("initiatedBy");

    return transaction;
}

export const TransactionService = {
    getAllTransactions,
    getTransactionById
}
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from "express";
import AppError from "../../errorHelpers/AppError";
import { Wallet } from "./wallet.model";
import httpStatus from "http-status-codes";
import mongoose from "mongoose";
import { Transaction } from "../transaction/transaction.model";
import { TRANSACTION_STATUS, TRANSACTION_TYPES } from "../transaction/transaction.interface";

const getWalletBalance = async (walletId: string) => {
    const wallet = await Wallet.findById(walletId).select("balance isBlocked dailyLimit monthlyLimit dailySpent monthlySpent -_id");

    if (!wallet) {
        throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
    }

    return wallet;
}

const addMoneyToWallet = async (req: Request, amount: number) => {

    if (amount <= 0) {
        throw new AppError(httpStatus.BAD_REQUEST, "Amount must be greater than 0");
    }

    const wallet = await Wallet.findOne({ userId: req.user.userId });

    if (!wallet) {
        throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
    }
    if (wallet.isBlocked) {
        throw new AppError(httpStatus.FORBIDDEN, "Wallet is blocked");
    }


    const transactionPayload = {
        type: TRANSACTION_TYPES.ADD_MONEY,
        amount,
        toWallet: wallet._id,
        initiatedBy: req.user.userId,
        initiatorRole: req.user.role,
        status: TRANSACTION_STATUS.COMPLETED,
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const transaction = await Transaction.create([transactionPayload], { session });

        wallet.balance += amount;
        wallet.transactions.push(transaction[0]._id);

        await wallet.save({ session });

        await session.commitTransaction();

        return {
            wallet,
            transaction: transaction[0]
        };

    } catch (error: any) {
        await session.abortTransaction();
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, (error._message || "Transaction creation failed"));
    } finally {
        await session.endSession();
    }
}

export const WalletService = {
    getWalletBalance,
    addMoneyToWallet
}
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from "express";
import AppError from "../../errorHelpers/AppError";
import { Wallet } from "./wallet.model";
import httpStatus from "http-status-codes";
import mongoose from "mongoose";
import { Transaction } from "../transaction/transaction.model";
import { TRANSACTION_STATUS, TRANSACTION_TYPES } from "../transaction/transaction.interface";
import { User } from "../user/user.model";
import { USER_ROLES } from "../user/user.interface";
import { defaultSystemConfigs } from "../system/system.model";

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


const cashOutByUser = async (req: Request, phone: string, amount: number) => {
    const minTransactionConfig = defaultSystemConfigs.find(config => config.key === "MIN_TRANSACTION_AMOUNT");
    const maxTransactionConfig = defaultSystemConfigs.find(config => config.key === "MAX_TRANSACTION_AMOUNT");
    const agentCommissionConfig = defaultSystemConfigs.find(config => config.key === "AGENT_COMMISSION_RATE");
    const cashOutFeeConfig = defaultSystemConfigs.find(config => config.key === "CASHOUT_FEE_RATE");

    if (!minTransactionConfig) {
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Minimum transaction amount not found");
    }
    if (!maxTransactionConfig) {
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Maximum transaction amount not found");
    }
    if (!agentCommissionConfig) {
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Agent commission rate not found");
    }
    if (!cashOutFeeConfig) {
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Cash-out fee rate not found");
    }
    if (amount < minTransactionConfig.value) {
        throw new AppError(httpStatus.BAD_REQUEST, "Minimum transaction amount is " + minTransactionConfig.value);
    }
    if (amount > maxTransactionConfig.value) {
        throw new AppError(httpStatus.BAD_REQUEST, "Maximum transaction amount is " + maxTransactionConfig.value);
    }

    const agent = await User.findOne({ phone: phone }).select(" -password -_v");
    const user = await User.findById(req.user.userId).select("wallet role isActive");

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    if (!agent) {
        throw new AppError(httpStatus.NOT_FOUND, "Agent not found");
    }

    if (user.role !== USER_ROLES.USER) {
        throw new AppError(httpStatus.FORBIDDEN, "You are not allowed to cash out");
    }

    if (!user.isActive) {
        throw new AppError(httpStatus.FORBIDDEN, "User is not active");
    }

    if (agent.role !== USER_ROLES.AGENT) {
        throw new AppError(httpStatus.FORBIDDEN, "Provide a valid agent phone number");
    }

    if (!agent.isApproved) {
        throw new AppError(httpStatus.FORBIDDEN, "Agent is not approved");
    }

    const userWallet = await Wallet.findById(user.wallet);
    const agentWallet = await Wallet.findById(agent.wallet);

    if (!agentWallet) {
        throw new AppError(httpStatus.NOT_FOUND, "Agent wallet not found");
    }

    if (!userWallet) {
        throw new AppError(httpStatus.NOT_FOUND, "User wallet not found");
    }

    if (userWallet.isBlocked) {
        throw new AppError(httpStatus.FORBIDDEN, "User wallet is blocked");
    }

    if (agentWallet.isBlocked) {
        throw new AppError(httpStatus.FORBIDDEN, "Agent wallet is blocked");
    }

    if (userWallet.balance < (amount + (amount * cashOutFeeConfig.value))) {
        throw new AppError(httpStatus.FORBIDDEN, "Insufficient balance");
    }

    if (userWallet.dailyLimit < (amount + userWallet.dailySpent)) {
        throw new AppError(httpStatus.FORBIDDEN, "Daily limit exceeded");
    }

    if (userWallet.monthlyLimit < (amount + userWallet.monthlySpent)) {
        throw new AppError(httpStatus.FORBIDDEN, "Monthly limit exceeded");
    }

    const transactionPayload = {
        type: TRANSACTION_TYPES.CASH_OUT,
        amount: amount,
        commission: amount * agentCommissionConfig.value,
        fromWallet: userWallet._id,
        toWallet: agentWallet._id,
        initiatedBy: req.user.userId,
        initiatorRole: req.user.role,
        status: TRANSACTION_STATUS.COMPLETED
    };

    const commissionPayload = {
        type: TRANSACTION_TYPES.COMMISSION,
        amount: transactionPayload.commission,
        toWallet: agentWallet._id,
        initiatedBy: req.user.userId,
        initiatorRole: req.user.role,
        status: TRANSACTION_STATUS.COMPLETED
    }

    const cashOutFeePayload = {
        type: TRANSACTION_TYPES.CASH_OUT_FEE,
        amount: amount * cashOutFeeConfig.value,
        fromWallet: userWallet._id,
        initiatedBy: user._id,
        initiatorRole: user.role,
        status: TRANSACTION_STATUS.COMPLETED
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // All operations must use { session }
        const transaction = await Transaction.create([transactionPayload], { session });
        const commissionTransaction = await Transaction.create([commissionPayload], { session });
        const cashOutFeeTransaction = await Transaction.create([cashOutFeePayload], { session });

        agentWallet.balance += amount;
        agentWallet.balance += transactionPayload.commission;
        agentWallet.transactions.push(transaction[0]._id);
        agentWallet.transactions.push(commissionTransaction[0]._id);

        userWallet.balance -= (amount + (cashOutFeeConfig.value * amount));
        userWallet.dailySpent += amount;
        userWallet.transactions.push(transaction[0]._id);
        userWallet.transactions.push(cashOutFeeTransaction[0]._id);

        await userWallet.save({ session });
        await agentWallet.save({ session });

        await session.commitTransaction();

        return {
            transaction: transaction[0],
            commissionTransaction: commissionTransaction[0],
            cashOutFeeTransaction: cashOutFeeTransaction[0],
            userWallet,
            agentWallet
        };
    } catch (error: any) {
        await session.abortTransaction();
        // console.log(error);
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, (error.message || "Something went wrong"));
    } finally {
        session.endSession();
    }
}

const sendMoney = async (req: Request, phone: string, amount: number) => {

    if (amount <= 0) {
        throw new AppError(httpStatus.BAD_REQUEST, "Amount must be greater than 0");
    }

    const sendMoneyFeeConfig = defaultSystemConfigs.find((config) => config.key === "SEND_MONEY_FEE");

    if (!sendMoneyFeeConfig) {
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Send money fee config not found");
    }

    const fromUser = await User.findById(req.user.userId).select("wallet role isActive");
    const toUser = await User.findOne({ phone: phone }).select("wallet role isActive");

    if (!fromUser) {
        throw new AppError(httpStatus.NOT_FOUND, "From user not found");
    }

    if (!toUser) {
        throw new AppError(httpStatus.NOT_FOUND, "To user not found");
    }

    if (fromUser.role !== "user") {
        throw new AppError(httpStatus.FORBIDDEN, "Only users can send money");
    }

    if (toUser.role !== "user") {
        throw new AppError(httpStatus.FORBIDDEN, "Only users can receive money");
    }

    if (!fromUser.isActive) {
        throw new AppError(httpStatus.FORBIDDEN, "From user is not active");
    }

    if (!toUser.isActive) {
        throw new AppError(httpStatus.FORBIDDEN, "To user is not active");
    }

    const fromWallet = await Wallet.findById(fromUser.wallet);
    const toWallet = await Wallet.findById(toUser.wallet);

    if (!fromWallet) {
        throw new AppError(httpStatus.NOT_FOUND, "From user wallet not found");
    }
    if (!toWallet) {
        throw new AppError(httpStatus.NOT_FOUND, "To user wallet not found");
    }
    if (fromWallet.balance < (amount + sendMoneyFeeConfig.value)) {
        throw new AppError(httpStatus.FORBIDDEN, "Insufficient balance");
    }
    if (fromWallet.isBlocked) {
        throw new AppError(httpStatus.FORBIDDEN, "From user wallet is blocked");
    }
    if (toWallet.isBlocked) {
        throw new AppError(httpStatus.FORBIDDEN, "To user wallet is blocked");
    }

    const transactionPayload = {
        type: TRANSACTION_TYPES.SEND_MONEY,
        amount: amount,
        fee: sendMoneyFeeConfig.value,
        fromWallet: fromWallet._id,
        toWallet: toWallet._id,
        initiatedBy: req.user.userId,
        initiatorRole: req.user.role,
        status: TRANSACTION_STATUS.COMPLETED
    };

    const sendMoneyFeeTransactionPayload = {
        type: TRANSACTION_TYPES.SEND_MONEY_FEE,
        amount: sendMoneyFeeConfig.value,
        fromWallet: fromWallet._id,
        toWallet: toWallet._id,
        initiatedBy: req.user.userId,
        initiatorRole: req.user.role,
        status: TRANSACTION_STATUS.COMPLETED
    };

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // All operations must use { session }
        const transaction = await Transaction.create([transactionPayload], { session });
        const sendMoneyFeeTransaction = await Transaction.create([sendMoneyFeeTransactionPayload], { session });

        fromWallet.balance -= (amount + transactionPayload.fee);
        fromWallet.dailySpent += amount;
        fromWallet.transactions.push(transaction[0]._id);
        fromWallet.transactions.push(sendMoneyFeeTransaction[0]._id);

        toWallet.balance += amount;
        toWallet.transactions.push(transaction[0]._id);

        await fromWallet.save({ session });
        await toWallet.save({ session });

        await session.commitTransaction();

        return {
            transaction: transaction[0],
            sendMoneyFeeTransaction: sendMoneyFeeTransaction[0],
            fromWallet,
            toWallet
        };
    } catch (error: any) {
        await session.abortTransaction();
        // console.log(error);
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, (error.message || "Something went wrong"));
    } finally {
        session.endSession();
    }

}

export const WalletService = {
    getWalletBalance,
    addMoneyToWallet,
    cashOutByUser,
    sendMoney
}
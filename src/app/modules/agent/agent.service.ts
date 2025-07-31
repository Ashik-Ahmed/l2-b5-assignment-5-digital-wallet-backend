/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request } from "express";
import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import { Wallet } from "../wallet/wallet.model";
import httpStatus from "http-status-codes";
import { Transaction } from "../transaction/transaction.model";
import { TRANSACTION_STATUS, TRANSACTION_TYPES } from "../transaction/transaction.interface";
import { defaultSystemConfigs } from "../system/system.model";
import mongoose from "mongoose";

const cashIn = async (req: Request, userPhone: string, amount: number) => {

    const minTransactionConfig = defaultSystemConfigs.find(config => config.key === "MIN_TRANSACTION_AMOUNT");
    const maxTransactionConfig = defaultSystemConfigs.find(config => config.key === "MAX_TRANSACTION_AMOUNT");
    const agentCommissionConfig = defaultSystemConfigs.find(config => config.key === "AGENT_COMMISSION_RATE");


    if (!minTransactionConfig) {
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Minimum transaction amount config not found");
    }
    if (!maxTransactionConfig) {
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Maximum transaction amount config not found");
    }
    if (!agentCommissionConfig) {
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Agent commission rate config not found");
    }
    if (amount < minTransactionConfig.value) {
        throw new AppError(httpStatus.BAD_REQUEST, "Minimum transaction amount is " + minTransactionConfig.value);
    }
    if (amount > maxTransactionConfig.value) {
        throw new AppError(httpStatus.BAD_REQUEST, "Maximum transaction amount is " + maxTransactionConfig.value);
    }

    const user = await User.findOne({ phone: userPhone }).select("wallet role");
    const agent = await User.findById(req.user.userId).select("-transactions -password -__v");

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    if (!agent) {
        throw new AppError(httpStatus.NOT_FOUND, "Agent not found");
    }

    if (user.role === "agent" || user.role === "admin") {
        throw new AppError(httpStatus.FORBIDDEN, "Cash-in to agent wallet is not allowed");
    }

    const userWallet = await Wallet.findById(user.wallet);
    const agentWallet = await Wallet.findById(agent.wallet);

    if (!userWallet || !agentWallet) {
        throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
    }

    if (userWallet.isBlocked) {
        throw new AppError(httpStatus.FORBIDDEN, "Wallet is blocked");
    }

    if (!agent.isApproved) {
        throw new AppError(httpStatus.FORBIDDEN, "Agent is not approved");
    }

    if (agentWallet.balance < amount) {
        throw new AppError(httpStatus.FORBIDDEN, "Insufficient balance");
    }

    // if ((amount + userWallet.dailySpent) > userWallet.dailyLimit) {
    //     throw new AppError(httpStatus.FORBIDDEN, "Daily limit exceeded");
    // }


    const transactionPayload = {
        type: TRANSACTION_TYPES.CASH_IN,
        amount,
        commission: amount * agentCommissionConfig.value,
        fromWallet: agentWallet._id,
        toWallet: userWallet._id,
        initiatedBy: req.user.userId,
        initiatorRole: req.user.role,
        status: TRANSACTION_STATUS.COMPLETED,
    }

    const commissioinPayload = {
        type: TRANSACTION_TYPES.COMMISSION,
        amount: transactionPayload.commission,
        toWallet: agentWallet._id,
        initiatedBy: req.user.userId,
        initiatorRole: req.user.role,
        status: TRANSACTION_STATUS.COMPLETED
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // All operations must use { session }
        const transaction = await Transaction.create([transactionPayload], { session });
        const commissionTransaction = await Transaction.create([commissioinPayload], { session });
        agentWallet.balance -= amount;
        agentWallet.balance += transactionPayload.commission;
        agentWallet.transactions.push(transaction[0]._id);
        agentWallet.transactions.push(commissionTransaction[0]._id);

        userWallet.balance += amount;
        // userWallet.dailySpent += amount;
        userWallet.transactions.push(transaction[0]._id);

        await userWallet.save({ session });
        await agentWallet.save({ session });

        await session.commitTransaction();
        session.endSession();

        return {
            transaction: transaction[0],
            commissionTransaction: commissionTransaction[0],
            userWallet,
            agentWallet
        };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Cash-in failed");
    } finally {
        session.endSession();
    }
}

const cashOut = async (req: Request, phone: string, amount: number) => {
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

    const user = await User.findOne({ phone: phone }).select("wallet role isActive");
    const agent = await User.findById(req.user.userId).select(" -password -_v");

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    if (!agent) {
        throw new AppError(httpStatus.NOT_FOUND, "Agent not found");
    }

    if (agent.role !== "agent") {
        throw new AppError(httpStatus.FORBIDDEN, "You are not an agent");
    }

    if (!user.isActive) {
        throw new AppError(httpStatus.FORBIDDEN, "User is not active");
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
        type: TRANSACTION_TYPES.TRANSACTION_FEE,
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
    } catch (error) {
        await session.abortTransaction();
        // console.log(error);
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Transaction failed");
    } finally {
        session.endSession();
    }
}

export const AgentService = {
    cashIn,
    cashOut
}
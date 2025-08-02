"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentService = void 0;
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const user_model_1 = require("../user/user.model");
const wallet_model_1 = require("../wallet/wallet.model");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const transaction_model_1 = require("../transaction/transaction.model");
const transaction_interface_1 = require("../transaction/transaction.interface");
const system_model_1 = require("../system/system.model");
const mongoose_1 = __importDefault(require("mongoose"));
const cashIn = (req, userPhone, amount) => __awaiter(void 0, void 0, void 0, function* () {
    const minTransactionConfig = system_model_1.defaultSystemConfigs.find(config => config.key === "MIN_TRANSACTION_AMOUNT");
    const maxTransactionConfig = system_model_1.defaultSystemConfigs.find(config => config.key === "MAX_TRANSACTION_AMOUNT");
    const agentCommissionConfig = system_model_1.defaultSystemConfigs.find(config => config.key === "AGENT_COMMISSION_RATE");
    if (!minTransactionConfig) {
        throw new AppError_1.default(http_status_codes_1.default.INTERNAL_SERVER_ERROR, "Minimum transaction amount config not found");
    }
    if (!maxTransactionConfig) {
        throw new AppError_1.default(http_status_codes_1.default.INTERNAL_SERVER_ERROR, "Maximum transaction amount config not found");
    }
    if (!agentCommissionConfig) {
        throw new AppError_1.default(http_status_codes_1.default.INTERNAL_SERVER_ERROR, "Agent commission rate config not found");
    }
    if (amount < minTransactionConfig.value) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Minimum transaction amount is " + minTransactionConfig.value);
    }
    if (amount > maxTransactionConfig.value) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Maximum transaction amount is " + maxTransactionConfig.value);
    }
    const user = yield user_model_1.User.findOne({ phone: userPhone }).select("wallet role");
    const agent = yield user_model_1.User.findById(req.user.userId).select("-transactions -password -__v");
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    if (!agent) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Agent not found");
    }
    if (user.role === "agent" || user.role === "admin") {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Cash-in to agent wallet is not allowed");
    }
    const userWallet = yield wallet_model_1.Wallet.findById(user.wallet);
    const agentWallet = yield wallet_model_1.Wallet.findById(agent.wallet);
    if (!userWallet || !agentWallet) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Wallet not found");
    }
    if (userWallet.isBlocked) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Wallet is blocked");
    }
    if (!agent.isApproved) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Agent is not approved");
    }
    if (agentWallet.balance < amount) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Insufficient balance");
    }
    // if ((amount + userWallet.dailySpent) > userWallet.dailyLimit) {
    //     throw new AppError(httpStatus.FORBIDDEN, "Daily limit exceeded");
    // }
    const transactionPayload = {
        type: transaction_interface_1.TRANSACTION_TYPES.CASH_IN,
        amount,
        commission: amount * agentCommissionConfig.value,
        fromWallet: agentWallet._id,
        toWallet: userWallet._id,
        initiatedBy: req.user.userId,
        initiatorRole: req.user.role,
        status: transaction_interface_1.TRANSACTION_STATUS.COMPLETED,
    };
    const commissioinPayload = {
        type: transaction_interface_1.TRANSACTION_TYPES.COMMISSION,
        amount: transactionPayload.commission,
        toWallet: agentWallet._id,
        initiatedBy: req.user.userId,
        initiatorRole: req.user.role,
        status: transaction_interface_1.TRANSACTION_STATUS.COMPLETED
    };
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        // All operations must use { session }
        const transaction = yield transaction_model_1.Transaction.create([transactionPayload], { session });
        const commissionTransaction = yield transaction_model_1.Transaction.create([commissioinPayload], { session });
        agentWallet.balance -= amount;
        agentWallet.balance += transactionPayload.commission;
        agentWallet.transactions.push(transaction[0]._id);
        agentWallet.transactions.push(commissionTransaction[0]._id);
        userWallet.balance += amount;
        // userWallet.dailySpent += amount;
        userWallet.transactions.push(transaction[0]._id);
        yield userWallet.save({ session });
        yield agentWallet.save({ session });
        yield session.commitTransaction();
        session.endSession();
        return {
            transaction: transaction[0],
            commissionTransaction: commissionTransaction[0],
            userWallet,
            agentWallet
        };
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw new AppError_1.default(http_status_codes_1.default.INTERNAL_SERVER_ERROR, "Cash-in failed");
    }
    finally {
        session.endSession();
    }
});
const cashOut = (req, phone, amount) => __awaiter(void 0, void 0, void 0, function* () {
    const minTransactionConfig = system_model_1.defaultSystemConfigs.find(config => config.key === "MIN_TRANSACTION_AMOUNT");
    const maxTransactionConfig = system_model_1.defaultSystemConfigs.find(config => config.key === "MAX_TRANSACTION_AMOUNT");
    const agentCommissionConfig = system_model_1.defaultSystemConfigs.find(config => config.key === "AGENT_COMMISSION_RATE");
    const cashOutFeeConfig = system_model_1.defaultSystemConfigs.find(config => config.key === "CASHOUT_FEE_RATE");
    if (!minTransactionConfig) {
        throw new AppError_1.default(http_status_codes_1.default.INTERNAL_SERVER_ERROR, "Minimum transaction amount not found");
    }
    if (!maxTransactionConfig) {
        throw new AppError_1.default(http_status_codes_1.default.INTERNAL_SERVER_ERROR, "Maximum transaction amount not found");
    }
    if (!agentCommissionConfig) {
        throw new AppError_1.default(http_status_codes_1.default.INTERNAL_SERVER_ERROR, "Agent commission rate not found");
    }
    if (!cashOutFeeConfig) {
        throw new AppError_1.default(http_status_codes_1.default.INTERNAL_SERVER_ERROR, "Cash-out fee rate not found");
    }
    if (amount < minTransactionConfig.value) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Minimum transaction amount is " + minTransactionConfig.value);
    }
    if (amount > maxTransactionConfig.value) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Maximum transaction amount is " + maxTransactionConfig.value);
    }
    const user = yield user_model_1.User.findOne({ phone: phone }).select("wallet role isActive");
    const agent = yield user_model_1.User.findById(req.user.userId).select(" -password -_v");
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    if (!agent) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Agent not found");
    }
    if (agent.role !== "agent") {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not an agent");
    }
    if (!user.isActive) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "User is not active");
    }
    if (!agent.isApproved) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Agent is not approved");
    }
    const userWallet = yield wallet_model_1.Wallet.findById(user.wallet);
    const agentWallet = yield wallet_model_1.Wallet.findById(agent.wallet);
    if (!agentWallet) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Agent wallet not found");
    }
    if (!userWallet) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User wallet not found");
    }
    if (userWallet.isBlocked) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "User wallet is blocked");
    }
    if (agentWallet.isBlocked) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Agent wallet is blocked");
    }
    if (userWallet.balance < (amount + (amount * cashOutFeeConfig.value))) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Insufficient balance");
    }
    if (userWallet.dailyLimit < (amount + userWallet.dailySpent)) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Daily limit exceeded");
    }
    if (userWallet.monthlyLimit < (amount + userWallet.monthlySpent)) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Monthly limit exceeded");
    }
    const transactionPayload = {
        type: transaction_interface_1.TRANSACTION_TYPES.CASH_OUT,
        amount: amount,
        commission: amount * agentCommissionConfig.value,
        fromWallet: userWallet._id,
        toWallet: agentWallet._id,
        initiatedBy: req.user.userId,
        initiatorRole: req.user.role,
        status: transaction_interface_1.TRANSACTION_STATUS.COMPLETED
    };
    const commissionPayload = {
        type: transaction_interface_1.TRANSACTION_TYPES.COMMISSION,
        amount: transactionPayload.commission,
        toWallet: agentWallet._id,
        initiatedBy: req.user.userId,
        initiatorRole: req.user.role,
        status: transaction_interface_1.TRANSACTION_STATUS.COMPLETED
    };
    const cashOutFeePayload = {
        type: transaction_interface_1.TRANSACTION_TYPES.CASH_OUT_FEE,
        amount: amount * cashOutFeeConfig.value,
        fromWallet: userWallet._id,
        initiatedBy: user._id,
        initiatorRole: user.role,
        status: transaction_interface_1.TRANSACTION_STATUS.COMPLETED
    };
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        // All operations must use { session }
        const transaction = yield transaction_model_1.Transaction.create([transactionPayload], { session });
        const commissionTransaction = yield transaction_model_1.Transaction.create([commissionPayload], { session });
        const cashOutFeeTransaction = yield transaction_model_1.Transaction.create([cashOutFeePayload], { session });
        agentWallet.balance += amount;
        agentWallet.balance += transactionPayload.commission;
        agentWallet.transactions.push(transaction[0]._id);
        agentWallet.transactions.push(commissionTransaction[0]._id);
        userWallet.balance -= (amount + (cashOutFeeConfig.value * amount));
        userWallet.dailySpent += amount;
        userWallet.transactions.push(transaction[0]._id);
        userWallet.transactions.push(cashOutFeeTransaction[0]._id);
        yield userWallet.save({ session });
        yield agentWallet.save({ session });
        yield session.commitTransaction();
        return {
            transaction: transaction[0],
            commissionTransaction: commissionTransaction[0],
            cashOutFeeTransaction: cashOutFeeTransaction[0],
            userWallet,
            agentWallet
        };
    }
    catch (error) {
        yield session.abortTransaction();
        // console.log(error);
        throw new AppError_1.default(http_status_codes_1.default.INTERNAL_SERVER_ERROR, "Transaction failed");
    }
    finally {
        session.endSession();
    }
});
const getCommissionHistoryByAgent = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const agent = yield user_model_1.User.findById(req.user.userId).select("wallet role isActive");
    if (!agent) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Agent not found");
    }
    if (agent.role !== "agent") {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not an agent");
    }
    const agentWallet = yield wallet_model_1.Wallet.findById(agent.wallet);
});
exports.AgentService = {
    cashIn,
    cashOut
};

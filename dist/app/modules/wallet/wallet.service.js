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
exports.WalletService = void 0;
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const wallet_model_1 = require("./wallet.model");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const mongoose_1 = __importDefault(require("mongoose"));
const transaction_model_1 = require("../transaction/transaction.model");
const transaction_interface_1 = require("../transaction/transaction.interface");
const user_model_1 = require("../user/user.model");
const user_interface_1 = require("../user/user.interface");
const system_model_1 = require("../system/system.model");
const getWalletBalance = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const wallet = yield wallet_model_1.Wallet.findOne({ userId: req.user.userId }).select("balance isBlocked dailyLimit monthlyLimit dailySpent monthlySpent -_id");
    if (!wallet) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Wallet not found");
    }
    return wallet;
});
const addMoneyToWallet = (req, amount) => __awaiter(void 0, void 0, void 0, function* () {
    if (amount <= 0) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Amount must be greater than 0");
    }
    const wallet = yield wallet_model_1.Wallet.findOne({ userId: req.user.userId });
    if (!wallet) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Wallet not found");
    }
    if (wallet.isBlocked) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Wallet is blocked");
    }
    const transactionPayload = {
        type: transaction_interface_1.TRANSACTION_TYPES.ADD_MONEY,
        amount,
        toWallet: wallet._id,
        initiatedBy: req.user.userId,
        initiatorRole: req.user.role,
        status: transaction_interface_1.TRANSACTION_STATUS.COMPLETED,
    };
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const transaction = yield transaction_model_1.Transaction.create([transactionPayload], { session });
        wallet.balance += amount;
        wallet.transactions.push(transaction[0]._id);
        yield wallet.save({ session });
        yield session.commitTransaction();
        return {
            wallet,
            transaction: transaction[0]
        };
    }
    catch (error) {
        yield session.abortTransaction();
        throw new AppError_1.default(http_status_codes_1.default.INTERNAL_SERVER_ERROR, (error._message || "Transaction creation failed"));
    }
    finally {
        yield session.endSession();
    }
});
const cashOutByUser = (req, phone, amount) => __awaiter(void 0, void 0, void 0, function* () {
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
    const agent = yield user_model_1.User.findOne({ phone: phone }).select(" -password -_v");
    const user = yield user_model_1.User.findById(req.user.userId).select("wallet role isActive");
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    if (!agent) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Agent not found");
    }
    if (user.role !== user_interface_1.USER_ROLES.USER) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not allowed to cash out");
    }
    if (!user.isActive) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "User is not active");
    }
    if (agent.role !== user_interface_1.USER_ROLES.AGENT) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Provide a valid agent phone number");
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
        throw new AppError_1.default(http_status_codes_1.default.INTERNAL_SERVER_ERROR, (error.message || "Something went wrong"));
    }
    finally {
        session.endSession();
    }
});
const sendMoney = (req, phone, amount) => __awaiter(void 0, void 0, void 0, function* () {
    if (amount <= 0) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Amount must be greater than 0");
    }
    const sendMoneyFeeConfig = system_model_1.defaultSystemConfigs.find((config) => config.key === "SEND_MONEY_FEE");
    if (!sendMoneyFeeConfig) {
        throw new AppError_1.default(http_status_codes_1.default.INTERNAL_SERVER_ERROR, "Send money fee config not found");
    }
    const fromUser = yield user_model_1.User.findById(req.user.userId).select("wallet role isActive");
    const toUser = yield user_model_1.User.findOne({ phone: phone }).select("wallet role isActive");
    if (!fromUser) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "From user not found");
    }
    if (!toUser) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "To user not found");
    }
    if (fromUser.role !== "user") {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Only users can send money");
    }
    if (toUser.role !== "user") {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Only users can receive money");
    }
    if (!fromUser.isActive) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "From user is not active");
    }
    if (!toUser.isActive) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "To user is not active");
    }
    const fromWallet = yield wallet_model_1.Wallet.findById(fromUser.wallet);
    const toWallet = yield wallet_model_1.Wallet.findById(toUser.wallet);
    if (!fromWallet) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "From user wallet not found");
    }
    if (!toWallet) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "To user wallet not found");
    }
    if (fromWallet.balance < (amount + sendMoneyFeeConfig.value)) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Insufficient balance");
    }
    if (fromWallet.isBlocked) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "From user wallet is blocked");
    }
    if (toWallet.isBlocked) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "To user wallet is blocked");
    }
    const transactionPayload = {
        type: transaction_interface_1.TRANSACTION_TYPES.SEND_MONEY,
        amount: amount,
        fee: sendMoneyFeeConfig.value,
        fromWallet: fromWallet._id,
        toWallet: toWallet._id,
        initiatedBy: req.user.userId,
        initiatorRole: req.user.role,
        status: transaction_interface_1.TRANSACTION_STATUS.COMPLETED
    };
    const sendMoneyFeeTransactionPayload = {
        type: transaction_interface_1.TRANSACTION_TYPES.SEND_MONEY_FEE,
        amount: sendMoneyFeeConfig.value,
        fromWallet: fromWallet._id,
        toWallet: toWallet._id,
        initiatedBy: req.user.userId,
        initiatorRole: req.user.role,
        status: transaction_interface_1.TRANSACTION_STATUS.COMPLETED
    };
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        // All operations must use { session }
        const transaction = yield transaction_model_1.Transaction.create([transactionPayload], { session });
        const sendMoneyFeeTransaction = yield transaction_model_1.Transaction.create([sendMoneyFeeTransactionPayload], { session });
        fromWallet.balance -= (amount + transactionPayload.fee);
        fromWallet.dailySpent += amount;
        fromWallet.transactions.push(transaction[0]._id);
        fromWallet.transactions.push(sendMoneyFeeTransaction[0]._id);
        toWallet.balance += amount;
        toWallet.transactions.push(transaction[0]._id);
        yield fromWallet.save({ session });
        yield toWallet.save({ session });
        yield session.commitTransaction();
        return {
            transaction: transaction[0],
            sendMoneyFeeTransaction: sendMoneyFeeTransaction[0],
            fromWallet,
            toWallet
        };
    }
    catch (error) {
        yield session.abortTransaction();
        // console.log(error);
        throw new AppError_1.default(http_status_codes_1.default.INTERNAL_SERVER_ERROR, (error.message || "Something went wrong"));
    }
    finally {
        session.endSession();
    }
});
exports.WalletService = {
    getWalletBalance,
    addMoneyToWallet,
    cashOutByUser,
    sendMoney
};

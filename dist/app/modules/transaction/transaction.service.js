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
exports.TransactionService = void 0;
const wallet_model_1 = require("../wallet/wallet.model");
const transaction_model_1 = require("./transaction.model");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const mongoose_1 = __importDefault(require("mongoose"));
const getAllTransactions = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield wallet_model_1.Wallet.find({ userId: req.user.userId }).select("transactions -_id").populate("transactions").sort({ createdAt: -1 });
    // const result = await Wallet.aggregate([
    //     {
    //         $match: {
    //             userId: new mongoose.Types.ObjectId(req.user.userId)
    //         }
    //     },
    //     {
    //         $unwind: "$transactions"
    //     }
    // ]);
    const totalTransactions = yield wallet_model_1.Wallet.find({ userId: req.user.userId }).select("transactions -_id");
    return {
        transactions: result[0].transactions,
        meta: {
            total: totalTransactions[0].transactions.length
        }
    };
});
const getTransactionById = (req, id) => __awaiter(void 0, void 0, void 0, function* () {
    const wallet = yield wallet_model_1.Wallet.findOne({ userId: req.user.userId });
    if (!wallet) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Wallet not found");
    }
    if (!wallet.transactions.includes(id)) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not authorized to view this transaction");
    }
    // const transaction = await Transaction.findById(id).populate("fromWallet").populate("toWallet").populate("fromUser").populate("toUser").populate("initiatedBy");
    const transaction = yield transaction_model_1.Transaction.aggregate([
        { $match: { _id: new mongoose_1.default.Types.ObjectId(id) } },
        // Lookup fromWallet
        {
            $lookup: {
                from: "wallets",
                localField: "fromWallet",
                foreignField: "_id",
                as: "fromWalletData"
            }
        },
        // Lookup toWallet
        {
            $lookup: {
                from: "wallets",
                localField: "toWallet",
                foreignField: "_id",
                as: "toWalletData"
            }
        },
        // Lookup user data for fromWallet
        {
            $lookup: {
                from: "users",
                localField: "fromWalletData.userId",
                foreignField: "_id",
                as: "fromUserData"
            }
        },
        // Lookup user data for toWallet
        {
            $lookup: {
                from: "users",
                localField: "toWalletData.userId",
                foreignField: "_id",
                as: "toUserData"
            }
        },
        // Lookup initiator data
        {
            $lookup: {
                from: "users",
                localField: "initiatedBy",
                foreignField: "_id",
                as: "initiatorData"
            }
        },
        // Project the final structure
        {
            $project: {
                _id: 1,
                type: 1,
                amount: 1,
                commission: 1,
                status: 1,
                createdAt: 1,
                updatedAt: 1,
                initiatorRole: 1,
                fromWallet: {
                    $cond: {
                        if: { $gt: [{ $size: "$fromUserData" }, 0] },
                        then: {
                            name: { $arrayElemAt: ["$fromUserData.name", 0] },
                            phone: { $arrayElemAt: ["$fromUserData.phone", 0] }
                        },
                        else: null
                    }
                },
                toWallet: {
                    $cond: {
                        if: { $gt: [{ $size: "$toUserData" }, 0] },
                        then: {
                            name: { $arrayElemAt: ["$toUserData.name", 0] },
                            phone: { $arrayElemAt: ["$toUserData.phone", 0] }
                        },
                        else: null
                    }
                },
                initiatedBy: {
                    $cond: {
                        if: { $gt: [{ $size: "$initiatorData" }, 0] },
                        then: {
                            name: { $arrayElemAt: ["$initiatorData.name", 0] },
                            phone: { $arrayElemAt: ["$initiatorData.phone", 0] }
                        },
                        else: null
                    }
                }
            }
        }
    ]);
    return transaction;
});
exports.TransactionService = {
    getAllTransactions,
    getTransactionById
};

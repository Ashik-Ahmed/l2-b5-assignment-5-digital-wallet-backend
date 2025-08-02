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
exports.AdminService = void 0;
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const transaction_model_1 = require("../transaction/transaction.model");
const user_model_1 = require("../user/user.model");
const wallet_model_1 = require("../wallet/wallet.model");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const getAllUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_model_1.User.find({}).select("-password -__v");
    const totalUsers = yield user_model_1.User.countDocuments({});
    return {
        users,
        meta: {
            total: totalUsers
        }
    };
});
const getAllWallets = () => __awaiter(void 0, void 0, void 0, function* () {
    const wallets = yield wallet_model_1.Wallet.find({}).populate("userId", "name email phone");
    const totalWallets = yield wallet_model_1.Wallet.countDocuments({});
    return {
        wallets,
        meta: {
            total: totalWallets
        }
    };
});
const walletBlockUnblock = (walletId, blockStatus) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield wallet_model_1.Wallet.findByIdAndUpdate(walletId, { isBlocked: blockStatus }, { new: true, runValidators: true });
    if (!result) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Wallet not found");
    }
    return result;
});
const getWalletDetails = (walletId) => __awaiter(void 0, void 0, void 0, function* () {
    const wallet = yield wallet_model_1.Wallet.findById(walletId).populate("userId", "name email phone");
    if (!wallet) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Wallet not found");
    }
    return wallet;
});
const getAllAgents = () => __awaiter(void 0, void 0, void 0, function* () {
    const agents = yield user_model_1.User.find({ role: "agent" }).select("-password -__v");
    const totalAgents = yield user_model_1.User.countDocuments({ role: "agent" });
    return {
        agents,
        meta: {
            total: totalAgents
        }
    };
});
const agentApproval = (userId, approvalStatus) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Agent not found");
    }
    if (user.role !== "agent") {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User is not an agent");
    }
    const result = yield user_model_1.User.findByIdAndUpdate(userId, { isApproved: approvalStatus }, { new: true, runValidators: true });
    return result;
});
const getAllTransactions = () => __awaiter(void 0, void 0, void 0, function* () {
    // const transactions = await Transaction.find({})
    //     .populate({
    //         path: "fromWallet",
    //         select: "userId -_id",
    //         populate: {
    //             path: "userId",
    //             select: "name email phone -_id"
    //         }
    //     })
    //     .populate({
    //         path: "toWallet",
    //         select: "userId -_id",
    //         populate: {
    //             path: "userId",
    //             select: "name email phone -_id"
    //         }
    //     })
    //     .populate({
    //         path: "initiatedBy",
    //         select: "name email phone -_id"
    //     });
    const transactions = yield transaction_model_1.Transaction.aggregate([
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
    const totalTransactions = yield transaction_model_1.Transaction.countDocuments({});
    return {
        transactions,
        meta: {
            total: totalTransactions
        }
    };
});
exports.AdminService = {
    getAllUsers,
    getAllWallets,
    walletBlockUnblock,
    getWalletDetails,
    getAllAgents,
    agentApproval,
    getAllTransactions
};

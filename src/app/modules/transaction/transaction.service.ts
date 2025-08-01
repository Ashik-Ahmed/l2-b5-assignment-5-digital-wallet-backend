import { Request } from "express";
import { Wallet } from "../wallet/wallet.model";
import { Transaction } from "./transaction.model";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import mongoose from "mongoose";

const getAllTransactions = async (req: Request) => {

    const result = await Wallet.find({ userId: req.user.userId }).select("transactions -_id").populate("transactions").sort({ createdAt: -1 });

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


    const totalTransactions = await Wallet.find({ userId: req.user.userId }).select("transactions -_id");

    return {
        transactions: result[0].transactions,
        meta: {
            total: totalTransactions[0].transactions.length
        }
    };
}

const getTransactionById = async (req: Request, id: string) => {

    const wallet = await Wallet.findOne({ userId: req.user.userId });

    if (!wallet) {
        throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
    }

    if (!wallet.transactions.includes(id)) {
        throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to view this transaction");
    }

    // const transaction = await Transaction.findById(id).populate("fromWallet").populate("toWallet").populate("fromUser").populate("toUser").populate("initiatedBy");


    const transaction = await Transaction.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(id) } },
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
    ])

    return transaction;
}

export const TransactionService = {
    getAllTransactions,
    getTransactionById
}
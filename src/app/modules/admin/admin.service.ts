import AppError from "../../errorHelpers/AppError";
import { Transaction } from "../transaction/transaction.model";
import { User } from "../user/user.model";
import { Wallet } from "../wallet/wallet.model";
import httpStatus from "http-status-codes";

const getAllUsers = async () => {
    const users = await User.find({}).select("-password -__v");

    const totalUsers = await User.countDocuments({});

    return {
        users,
        meta: {
            total: totalUsers
        }
    };
}

const getAllWallets = async () => {
    const wallets = await Wallet.find({}).populate("userId", "name email phone");
    const totalWallets = await Wallet.countDocuments({});
    return {
        wallets,
        meta: {
            total: totalWallets
        }
    };
}

const walletBlockUnblock = async (walletId: string, blockStatus: boolean) => {
    const result = await Wallet.findByIdAndUpdate(walletId, { isBlocked: blockStatus }, { new: true, runValidators: true });

    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
    }

    return result;

}

const getWalletDetails = async (walletId: string) => {
    const wallet = await Wallet.findById(walletId).populate("userId", "name email phone");
    if (!wallet) {
        throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
    }
    return wallet;
}


const getAllAgents = async () => {
    const agents = await User.find({ role: "agent" }).select("-password -__v");
    const totalAgents = await User.countDocuments({ role: "agent" });
    return {
        agents,
        meta: {
            total: totalAgents
        }
    };
}

const agentApproval = async (userId: string, approvalStatus: boolean) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "Agent not found");
    }
    if (user.role !== "agent") {
        throw new AppError(httpStatus.BAD_REQUEST, "User is not an agent");
    }

    const result = await User.findByIdAndUpdate(userId, { isApproved: approvalStatus }, { new: true, runValidators: true });

    return result;
}

const getAllTransactions = async () => {
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

    const transactions = await Transaction.aggregate([
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

    const totalTransactions = await Transaction.countDocuments({});
    return {
        transactions,
        meta: {
            total: totalTransactions
        }
    };
}

export const AdminService = {
    getAllUsers,
    getAllWallets,
    walletBlockUnblock,
    getWalletDetails,
    getAllAgents,
    agentApproval,
    getAllTransactions
}
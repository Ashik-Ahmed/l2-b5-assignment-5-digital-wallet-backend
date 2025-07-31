import AppError from "../../errorHelpers/AppError";
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

export const AdminService = {
    getAllUsers,
    getAllWallets,
    walletBlockUnblock,
    getAllAgents,
    agentApproval
}
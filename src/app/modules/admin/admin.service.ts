import { User } from "../user/user.model";
import { Wallet } from "../wallet/wallet.model";

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
        throw new Error("Wallet not found");
    }

    return result;

}

export const AdminService = {
    getAllUsers,
    getAllWallets,
    walletBlockUnblock
}
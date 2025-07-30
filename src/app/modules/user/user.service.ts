import { JwtPayload } from "jsonwebtoken";
import { IUser } from "./user.interface";
import { User } from "./user.model";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import bcrypt from "bcryptjs";
import { envVars } from "../../config/env";
import { Wallet } from "../wallet/wallet.model";

const createUser = async (payload: Partial<IUser>) => {

    const { name, email, phone, password, ...rest } = payload;

    // mongoose pre-hook is hashing password 
    // const hashedPassword = await bcrypt.hash(password as string, 10);

    const user = await User.create({
        name,
        email,
        phone,
        password,
        ...rest
    });

    if (!user) {
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "User creation failed");
    }

    // Automatically create wallet for user or agent
    if (user.role === "user" || user.role === "agent") {
        const wallet = await Wallet.create({ userId: user._id });
        if (!wallet) {
            throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Wallet creation failed");
        }
        user.wallet = wallet._id;
        await user.save();
    }

    // console.log("User created successfully:", user); 
    // console.log("Wallet created successfully:", wallet);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: pass, ...userWithoutPassword } = user.toObject();

    return userWithoutPassword;
}

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


const updateUser = async (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) => {

    const ifUserExist = await User.findById(userId);

    if (!ifUserExist) {
        throw new AppError(httpStatus.NOT_FOUND, "User Not Found")
    }

    if (payload.role) {
        if (decodedToken.role !== "admin") {
            throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
        }

        // if (payload.role === Role.SUPER_ADMIN && decodedToken.role === Role.ADMIN) {
        //     throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
        // }
    }
    console.log("Decoded Token:", decodedToken.role);
    if ('isActive' in payload || 'isApproved' in payload || 'commissionRate' in payload) {
        if (decodedToken.role !== "admin") {
            throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
        }
    }

    if (payload.password) {
        payload.password = await bcrypt.hash(payload.password, Number(envVars.BCRYPT_SALT_ROUNDS));
    }

    const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true })

    return newUpdatedUser
}

export const UserService = {
    createUser,
    getAllUsers,
    updateUser
};
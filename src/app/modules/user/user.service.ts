import { JwtPayload } from "jsonwebtoken";
import { IUser } from "./user.interface";
import { User } from "./user.model";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import bcrypt from "bcryptjs";
import { envVars } from "../../config/env";



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
    updateUser
};
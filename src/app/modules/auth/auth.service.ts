import AppError from "../../errorHelpers/AppError";
import { IUser } from "../user/user.interface"
import { User } from "../user/user.model";
import httpStatus from "http-status-codes";
import bcrypt from "bcryptjs";
import { envVars } from "../../config/env";
import jwt from "jsonwebtoken";

const credentialLogin = async (payload: Partial<IUser>) => {

    const { email, password } = payload;

    const isUserExist = await User.findOne({ email });

    if (!isUserExist) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    const isPasswordMatched = await bcrypt.compare(password as string, isUserExist.password);

    if (!isPasswordMatched) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Invalid password");
    }

    const jwtPayload = {
        userId: isUserExist._id,
        role: isUserExist.role,
        email: isUserExist.email
    }
    const accessToken = jwt.sign(jwtPayload, envVars.JWT_SECRET, {
        expiresIn: "1d"
    })


    return {
        _id: isUserExist._id,
        email: isUserExist.email,
        name: isUserExist.name,
        role: isUserExist.role,
        accessToken
    }
}


export const AuthService = {
    credentialLogin
}
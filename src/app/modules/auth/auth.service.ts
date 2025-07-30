import AppError from "../../errorHelpers/AppError";
import { IUser } from "../user/user.interface"
import { User } from "../user/user.model";
import httpStatus from "http-status-codes";
import bcrypt from "bcryptjs";
import { createUserTokens } from "../../utils/userTokens";

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

    const userTokens = createUserTokens(isUserExist);

    return {
        user: {
            _id: isUserExist._id,
            email: isUserExist.email,
            name: isUserExist.name,
            role: isUserExist.role,
        },
        accessToken: userTokens.accessToken,
        refreshToken: userTokens.refreshToken,
    }
}


export const AuthService = {
    credentialLogin
}
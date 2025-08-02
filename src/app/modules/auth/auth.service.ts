import AppError from "../../errorHelpers/AppError";
import { IUser } from "../user/user.interface"
import { User } from "../user/user.model";
import httpStatus from "http-status-codes";
import bcrypt from "bcryptjs";
import { createNewAccessTokenWithRefreshToken, createUserTokens } from "../../utils/userTokens";
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
        if (!wallet?._id) {
            await User.findByIdAndDelete(user._id);
            throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Wallet creation failed! User deleted. Please try again.");
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



const getNewAccessToken = async (refreshToken: string) => {

    const newAccessToken = await createNewAccessTokenWithRefreshToken(refreshToken);
    return {
        accessToken: newAccessToken
    }
}


export const AuthService = {
    createUser,
    credentialLogin,
    getNewAccessToken
}
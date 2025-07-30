import { envVars } from "../config/env";
import { IUser } from "../modules/user/user.interface";
import { generateToken } from "./jwt";

export const createUserTokens = (user: Partial<IUser>) => {

    const jwtPayload = {
        userId: user._id,
        role: user.role,
        email: user.email
    }
    // const accessToken = jwt.sign(jwtPayload, envVars.JWT_SECRET, {
    //     expiresIn: envVars.JWT_EXPIRATION
    // } as SignOptions)
    const accessToken = generateToken(jwtPayload, envVars.JWT_SECRET, envVars.JWT_EXPIRATION)

    const refreshToken = generateToken(jwtPayload, envVars.JWT_REFRESH_SECRET, envVars.JWT_REFRESH_EXPIRATION);

    return {
        accessToken,
        refreshToken
    }
}
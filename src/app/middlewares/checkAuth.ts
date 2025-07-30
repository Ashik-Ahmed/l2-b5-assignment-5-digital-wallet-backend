import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelpers/AppError";
import { verifyToken } from "../utils/jwt";
import { envVars } from "../config/env";
import { JwtPayload } from "jsonwebtoken";

export const checkAuth = (...authRoles: string[]) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const accessToken = req.cookies.accessToken;
        if (!accessToken) {
            throw new AppError(403, "Access token is required");
        }
        // const verifiedToken = jwt.verify(accessToken, process.env.JWT_SECRET as string);

        const decodedToken = verifyToken(accessToken, envVars.JWT_SECRET) as JwtPayload;

        if (!decodedToken) {
            throw new AppError(403, "Invalid access token");
        }

        if (!authRoles.includes(decodedToken.role)) {
            throw new AppError(401, "Unauthorized access");
        }

        req.user = decodedToken;

        next();

    } catch (error) {
        next(error);
    }
}
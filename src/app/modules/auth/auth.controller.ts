/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { AuthService } from "./auth.service";
import AppError from "../../errorHelpers/AppError";
import { setAuthCookie } from "../../utils/setCookie";



const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await AuthService.createUser(req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "User created successfully",
        data: user
    });
});


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const credentialLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const loginInfo = await AuthService.credentialLogin(req.body);

    setAuthCookie(res, loginInfo);

    // res.cookie("accessToken", loginInfo.accessToken, {
    //     httpOnly: true,
    //     secure: false, // Set to true if using HTTPS
    // });

    // res.cookie("refreshToken", loginInfo.refreshToken, {
    //     httpOnly: true,
    //     secure: false, // Set to true if using HTTPS
    // });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Logged in successfully",
        data: loginInfo
    });
});


const getNewAccessToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        throw new AppError(httpStatus.BAD_REQUEST, "No refresh token provided");
    }

    const tokenInfo = await AuthService.getNewAccessToken(refreshToken);

    setAuthCookie(res, tokenInfo);

    // res.cookie("accessToken", tokenInfo.accessToken, {
    //     httpOnly: true,
    //     secure: false, // Set to true if using HTTPS
    // });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Logged in successfully",
        data: tokenInfo
    });
});


export const AuthController = {
    createUser,
    credentialLogin,
    getNewAccessToken
}
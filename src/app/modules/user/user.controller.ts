/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { UserService } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelpers/AppError";
import { USER_ROLES } from "./user.interface";
import bcrypt from "bcryptjs";
import { User } from "./user.model";


const getLoggedInUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const userId = req.user.userId;

    const user = await UserService.getLoggedInUser(userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User retrieved successfully",
        data: user
    })
})

const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const userId = req.params.id;
    const payload = req.body;

    if (payload.role) {
        if (req.user.role !== USER_ROLES.ADMIN) {
            throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
        }
    }
    if ('isActive' in payload || 'isApproved' in payload || 'commissionRate' in payload) {
        if (req.user.role !== USER_ROLES.ADMIN) {
            throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
        }
    }

    const user = await UserService.updateUser(userId, payload, req.user as JwtPayload)

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "User updated successfully",
        data: user
    })
})

const changePassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body);
    const userId = req.params.id;
    const { currentPassword, newPassword } = req.body;
    console.log(userId, currentPassword, newPassword);
    const user = await User.findById(userId).select("+password -_id");

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    const isPasswordMatched = await bcrypt.compare(currentPassword, user?.password as string);

    if (!isPasswordMatched) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Current password is incorrect");
    }

    const result = await UserService.changePassword(userId, newPassword);
    console.log("password change result:", result);



    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Password changed successfully",
        data: result
    })
});


export const UserController = {
    getLoggedInUser,
    updateUser,
    changePassword
};
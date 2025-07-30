/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { UserService } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";


const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserService.createUser(req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "User created successfully",
        data: user
    });
});

const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const userId = req.params.id;

    // const token = req.headers.authorization;
    // const verifiedToken = verifyToken(token as string, envVars.JWT_SECRET) as JwtPayload;

    const decodedToken = req.user;

    const payload = req.body;
    const user = await UserService.updateUser(userId, payload, decodedToken as JwtPayload)

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "User updated successfully",
        data: user
    })
})


export const UserController = {
    createUser,
    updateUser
};
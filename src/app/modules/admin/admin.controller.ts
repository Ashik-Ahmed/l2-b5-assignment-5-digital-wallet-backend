/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { AdminService } from "./admin.service";
import httpStatus from "http-status-codes";

const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await AdminService.getAllUsers();

    res.status(httpStatus.OK).json({
        success: true,
        message: "Users retrieved successfully",
        data: result.users,
        meta: result.meta
    });
});

const getAllWallets = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await AdminService.getAllWallets();

    res.status(httpStatus.OK).json({
        success: true,
        message: "Wallets retrieved successfully",
        data: result.wallets,
        meta: result.meta
    });
});

const walletBlockUnblock = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { walletId } = req.params;
    const { isBlocked } = req.body;

    const result = await AdminService.walletBlockUnblock(walletId, isBlocked);

    res.status(httpStatus.OK).json({
        success: true,
        message: `Wallet ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
        data: result
    });
});


export const AdminController = {
    getAllUsers,
    getAllWallets,
    walletBlockUnblock
}
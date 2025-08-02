/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { AdminService } from "./admin.service";
import httpStatus from "http-status-codes";
import { sendResponse } from "../../utils/sendResponse";

const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await AdminService.getAllUsers();

    if (result.users.length === 0) {
        return sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "No users found",
            data: []
        })
    }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Users retrieved successfully",
        data: result.users,
        meta: result.meta
    });
});

const getAllWallets = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await AdminService.getAllWallets();


    sendResponse(res, {
        statusCode: httpStatus.OK,
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

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Wallet ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
        data: result
    });
});


const getWalletDetails = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { walletId } = req.params;

    const result = await AdminService.getWalletDetails(walletId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Wallet details retrieved successfully",
        data: result
    });
});


const getAllAgents = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await AdminService.getAllAgents();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Agents retrieved successfully",
        data: result.agents,
        meta: result.meta
    });
});

const agentApproval = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const { isApproved } = req.body;

    const result = await AdminService.agentApproval(userId, isApproved);


    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Agent ${isApproved ? 'approved' : 'un-approved'} successfully`,
        data: result
    });
});


const getAllTransactions = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await AdminService.getAllTransactions();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Transactions retrieved successfully",
        data: result.transactions,
        meta: result.meta
    });
});

export const AdminController = {
    getAllUsers,
    getAllWallets,
    walletBlockUnblock,
    getWalletDetails,
    getAllAgents,
    agentApproval,
    getAllTransactions
}
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { WalletService } from "./wallet.service";
import httpStatus from "http-status-codes";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getWalletBalance = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { walletId } = req.params;

    const result = await WalletService.getWalletBalance(walletId);

    res.status(httpStatus.OK).json({
        success: true,
        message: "Wallet balance retrieved successfully",
        data: result
    });
});

export const WalletController = {
    getWalletBalance
};

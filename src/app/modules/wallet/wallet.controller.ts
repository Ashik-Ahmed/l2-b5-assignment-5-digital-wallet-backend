/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { WalletService } from "./wallet.service";
import httpStatus from "http-status-codes";
import { sendResponse } from "../../utils/sendResponse";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getWalletBalance = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const result = await WalletService.getWalletBalance(req);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Wallet balance retrieved successfully",
        data: result
    })
});

const addMoneyToWallet = catchAsync(async (req: Request, res: Response, next: NextFunction) => {


    const addMoney = await WalletService.addMoneyToWallet(req, req.body.amount);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Add money successful",
        data: addMoney
    })
})

const cashOutByUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { phone, amount } = req.body;

    const result = await WalletService.cashOutByUser(req, phone, amount);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Cash out successful",
        data: result
    });
});

const sendMoney = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { phone, amount } = req.body;

    const result = await WalletService.sendMoney(req, phone, amount);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Send money successful",
        data: result
    });
});

export const WalletController = {
    getWalletBalance,
    addMoneyToWallet,
    cashOutByUser,
    sendMoney
};

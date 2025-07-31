/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { TransactionService } from "./transaction.service";
import httpStatus from "http-status-codes";
import { sendResponse } from "../../utils/sendResponse";

const getAllTransactions = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    console.log(req);
    const result = await TransactionService.getAllTransactions(req);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Transactions retrieved successfully",
        data: result.transactions,
        meta: result.meta
    });
});

export const TransactionController = {
    getAllTransactions
}
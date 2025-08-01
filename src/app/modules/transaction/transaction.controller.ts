/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { TransactionService } from "./transaction.service";
import httpStatus from "http-status-codes";
import { sendResponse } from "../../utils/sendResponse";

const getAllTransactions = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const result = await TransactionService.getAllTransactions(req);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Transactions retrieved successfully",
        data: result.transactions,
        meta: result.meta
    });
});

const getTransactionById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const result = await TransactionService.getTransactionById(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Transaction retrieved successfully",
        data: result
    });
});


export const TransactionController = {
    getAllTransactions,
    getTransactionById
}
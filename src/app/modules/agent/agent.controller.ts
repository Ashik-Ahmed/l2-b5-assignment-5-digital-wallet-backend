/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AgentService } from "./agent.service";
import { IUser } from "../user/user.interface";

const cashIn = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const { phone, amount } = req.body;

    const result = await AgentService.cashIn(req, phone, amount);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Cash in successful",
        data: result
    });
});


const cashOut = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const { phone, amount } = req.body;

    const result = await AgentService.cashOut(req, phone, amount);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Cash out successful",
        data: result
    });
});

export const AgentController = {
    cashIn,
    cashOut
}
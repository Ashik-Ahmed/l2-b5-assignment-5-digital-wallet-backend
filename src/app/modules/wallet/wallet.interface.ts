import { Document, Schema } from "mongoose";
import { Types } from "mongoose";

export interface IWallet extends Document {
    _id: Types.ObjectId;
    userId: Schema.Types.ObjectId;
    balance: number;
    isBlocked: boolean;
    dailyLimit: number;
    monthlyLimit: number;
    dailySpent: number;
    monthlySpent: number;
    lastDailyReset: Date;
    lastMonthlyReset: Date;
    transactions: string[];
    createdAt: Date;
    updatedAt: Date;
}
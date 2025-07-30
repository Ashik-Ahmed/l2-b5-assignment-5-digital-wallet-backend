import { Document, Schema } from "mongoose";
import { USER_ROLES } from "../user/user.interface";

export enum TRANSACTION_TYPES {
    ADD_MONEY = 'add_money',
    WITHDRAW = 'withdraw',
    SEND_MONEY = 'send_money',
    CASH_IN = 'cash_in',
    CASH_OUT = 'cash_out',
    COMMISSION = 'commission'
}

export enum TRANSACTION_STATUS {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed',
    REVERSED = 'reversed'
}

export interface ITransaction extends Document {
    _id: string;
    transactionId: string;
    type: TRANSACTION_TYPES;
    amount: number;
    fee: number;
    commission: number;
    netAmount: number;
    fromWallet?: Schema.Types.ObjectId;
    toWallet?: Schema.Types.ObjectId;
    fromUser?: Schema.Types.ObjectId;
    toUser?: Schema.Types.ObjectId;
    initiatedBy: Schema.Types.ObjectId;
    initiatorRole: USER_ROLES;
    status: TRANSACTION_STATUS;
    description: string;
    metadata?: {
        agentId?: Schema.Types.ObjectId;
        reference?: string;
        method?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
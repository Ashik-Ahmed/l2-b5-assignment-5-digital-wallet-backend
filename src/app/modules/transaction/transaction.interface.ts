import { Document, Schema } from "mongoose";

export interface ITransaction extends Document {
    _id: string;
    transactionId: string;
    type: 'add_money' | 'withdraw' | 'send_money' | 'cash_in' | 'cash_out' | 'commission';
    amount: number;
    fee: number;
    commission: number;
    netAmount: number;
    fromWallet?: Schema.Types.ObjectId;
    toWallet?: Schema.Types.ObjectId;
    fromUser?: Schema.Types.ObjectId;
    toUser?: Schema.Types.ObjectId;
    initiatedBy: Schema.Types.ObjectId;
    initiatorRole: 'user' | 'agent' | 'admin';
    status: 'pending' | 'completed' | 'failed' | 'reversed';
    description: string;
    metadata?: {
        agentId?: Schema.Types.ObjectId;
        reference?: string;
        method?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
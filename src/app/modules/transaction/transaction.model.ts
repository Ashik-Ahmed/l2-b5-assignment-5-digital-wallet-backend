import { model, Schema } from "mongoose";
import { ITransaction } from "./transaction.interface";

const transactionSchema = new Schema<ITransaction>({
    transactionId: {
        type: String,
        required: true,
        unique: true,
        default: function () {
            return `TXN${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        }
    },
    type: {
        type: String,
        required: [true, 'Transaction type is required'],
        enum: ['add_money', 'withdraw', 'send_money', 'cash_in', 'cash_out', 'commission']
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0.01, 'Amount must be greater than 0']
    },
    fee: {
        type: Number,
        default: 0,
        min: [0, 'Fee cannot be negative']
    },
    commission: {
        type: Number,
        default: 0,
        min: [0, 'Commission cannot be negative']
    },
    netAmount: {
        type: Number,
        required: true
    },
    fromWallet: {
        type: Schema.Types.ObjectId,
        ref: 'Wallet'
    },
    toWallet: {
        type: Schema.Types.ObjectId,
        ref: 'Wallet'
    },
    fromUser: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    toUser: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    initiatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Initiator is required']
    },
    initiatorRole: {
        type: String,
        required: true,
        enum: ['user', 'agent', 'admin']
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'reversed'],
        default: 'pending'
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    metadata: {
        agentId: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        reference: String,
        method: String
    }
}, {
    timestamps: true
});

// Pre-save middleware to calculate net amount
transactionSchema.pre('save', function (next) {
    this.netAmount = this.amount - this.fee;
    next();
});

// Indexes for better query performance
// transactionSchema.index({ transactionId: 1 });
// transactionSchema.index({ fromUser: 1, createdAt: -1 });
// transactionSchema.index({ toUser: 1, createdAt: -1 });
// transactionSchema.index({ initiatedBy: 1, createdAt: -1 });
// transactionSchema.index({ type: 1, status: 1 });
// transactionSchema.index({ createdAt: -1 });

export const Transaction = model<ITransaction>('Transaction', transactionSchema);

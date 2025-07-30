import { model, Schema } from "mongoose";
import { IWallet } from "./wallet.interface";

const walletSchema = new Schema<IWallet>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        unique: true
    },
    balance: {
        type: Number,
        required: true,
        default: 50, // Initial balance BDT-50
        min: [0, 'Balance cannot be negative']
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    dailyLimit: {
        type: Number,
        default: 10000, // BDT-10,000 daily limit
        min: [0, 'Daily limit cannot be negative']
    },
    monthlyLimit: {
        type: Number,
        default: 100000, // BDT-100,000 monthly limit
        min: [0, 'Monthly limit cannot be negative']
    },
    dailySpent: {
        type: Number,
        default: 0,
        min: [0, 'Daily spent cannot be negative']
    },
    monthlySpent: {
        type: Number,
        default: 0,
        min: [0, 'Monthly spent cannot be negative']
    },
    lastDailyReset: {
        type: Date,
        default: Date.now
    },
    lastMonthlyReset: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for better query performance
// walletSchema.index({ userId: 1 });
// walletSchema.index({ isBlocked: 1 });

export const Wallet = model<IWallet>('Wallet', walletSchema);
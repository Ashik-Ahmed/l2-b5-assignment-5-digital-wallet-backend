"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wallet = void 0;
const mongoose_1 = require("mongoose");
const walletSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        unique: true
    },
    balance: {
        type: Number,
        required: true,
        default: 50, // Initial balance BDT-50
        min: [0, 'Balance cannot be negative'],
        set: (value) => Math.round(value * 100) / 100 // Rounds to 2 decimal places
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    dailyLimit: {
        type: Number,
        default: 10000,
        min: [0, 'Daily limit cannot be negative']
    },
    monthlyLimit: {
        type: Number,
        default: 100000,
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
    },
    transactions: [{
            type: String,
            ref: 'Transaction'
        }]
}, {
    timestamps: true
});
// Index for better query performance
// walletSchema.index({ userId: 1 });
// walletSchema.index({ isBlocked: 1 });
exports.Wallet = (0, mongoose_1.model)('Wallet', walletSchema);

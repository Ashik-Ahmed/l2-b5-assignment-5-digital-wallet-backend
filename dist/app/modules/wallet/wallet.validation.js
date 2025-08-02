"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWalletSchema = void 0;
const zod_1 = require("zod");
// Update Wallet Zod Schema
exports.updateWalletSchema = zod_1.z.object({
    userId: zod_1.z.string().optional(), // Should be a MongoDB ObjectId string
    balance: zod_1.z.number().min(0, "Balance cannot be negative").optional(),
    isBlocked: zod_1.z.boolean().optional(),
    dailyLimit: zod_1.z.number().min(0, "Daily limit cannot be negative").optional(),
    monthlyLimit: zod_1.z.number().min(0, "Monthly limit cannot be negative").optional(),
    dailySpent: zod_1.z.number().min(0, "Daily spent cannot be negative").optional(),
    monthlySpent: zod_1.z.number().min(0, "Monthly spent cannot be negative").optional(),
    lastDailyReset: zod_1.z.date().optional(),
    lastMonthlyReset: zod_1.z.date().optional(),
    transactions: zod_1.z.array(zod_1.z.string()).optional(), // assuming transaction IDs are string
});

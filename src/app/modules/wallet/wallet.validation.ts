import { z } from "zod";

// Update Wallet Zod Schema
export const updateWalletSchema = z.object({
    userId: z.string().optional(), // Should be a MongoDB ObjectId string
    balance: z.number().min(0, "Balance cannot be negative").optional(),
    isBlocked: z.boolean().optional(),
    dailyLimit: z.number().min(0, "Daily limit cannot be negative").optional(),
    monthlyLimit: z.number().min(0, "Monthly limit cannot be negative").optional(),
    dailySpent: z.number().min(0, "Daily spent cannot be negative").optional(),
    monthlySpent: z.number().min(0, "Monthly spent cannot be negative").optional(),
    lastDailyReset: z.date().optional(),
    lastMonthlyReset: z.date().optional(),
    transactions: z.array(z.string()).optional(), // assuming transaction IDs are string
});

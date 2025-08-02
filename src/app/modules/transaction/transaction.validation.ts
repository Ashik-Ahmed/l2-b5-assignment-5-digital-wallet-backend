import z from "zod";
import { TRANSACTION_STATUS, TRANSACTION_TYPES } from "./transaction.interface";
import { USER_ROLES } from "../user/user.interface";

export const createTransactionZodSchema = z.object({
    transactionId: z
        .string(),
    type: z
        .enum(TRANSACTION_TYPES),
    amount: z
        .number()
        .min(0.01, 'Amount must be greater than 0'),
    status: z
        .enum(TRANSACTION_STATUS),
    initiatedBy: z
        .string(),
    initiatorRole: z
        .enum(USER_ROLES),
})
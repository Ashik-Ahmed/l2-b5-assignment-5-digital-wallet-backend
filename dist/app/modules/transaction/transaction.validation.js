"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransactionZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const transaction_interface_1 = require("./transaction.interface");
const user_interface_1 = require("../user/user.interface");
exports.createTransactionZodSchema = zod_1.default.object({
    transactionId: zod_1.default
        .string(),
    type: zod_1.default
        .enum(transaction_interface_1.TRANSACTION_TYPES),
    amount: zod_1.default
        .number()
        .min(0.01, 'Amount must be greater than 0'),
    status: zod_1.default
        .enum(transaction_interface_1.TRANSACTION_STATUS),
    initiatedBy: zod_1.default
        .string(),
    initiatorRole: zod_1.default
        .enum(user_interface_1.USER_ROLES),
});

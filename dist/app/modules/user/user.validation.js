"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserZodSchema = exports.createUserZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const user_interface_1 = require("./user.interface");
exports.createUserZodSchema = zod_1.default.object({
    name: zod_1.default
        .string("Name must be string")
        .min(2, "Name too short, minimum 2 characters")
        .max(50, "Name cannot exceed 50 characters"),
    email: zod_1.default
        .string().email("Invalid email format"),
    phone: zod_1.default
        .string()
        .regex(/^(\+88)?01[3-9]\d{8}$/, "Please enter a valid Bangladeshi phone number"),
    password: zod_1.default
        .string()
        .min(6, "Password must be at least 6 characters long"),
    role: zod_1.default
        .enum(user_interface_1.USER_ROLES)
        .optional(),
    isActive: zod_1.default
        .boolean()
        .optional(),
    isApproved: zod_1.default
        .boolean()
        .optional(),
    commissionRate: zod_1.default
        .number()
        .min(0, "Commission rate cannot be negative")
        .max(0.1, "Commission rate cannot exceed 10%")
        .optional()
});
exports.updateUserZodSchema = zod_1.default.object({
    name: zod_1.default
        .string("Name must be string")
        .min(2, "Name too short, minimum 2 characters")
        .max(50, "Name cannot exceed 50 characters")
        .optional(),
    password: zod_1.default
        .string()
        .min(6, "Password must be at least 6 characters long")
        .optional(),
    role: zod_1.default
        .enum(user_interface_1.USER_ROLES)
        .optional(),
    isActive: zod_1.default
        .boolean()
        .optional(),
    isApproved: zod_1.default
        .boolean()
        .optional(),
    commissionRate: zod_1.default
        .number()
        .min(0, "Commission rate cannot be negative")
        .max(0.1, "Commission rate cannot exceed 10%")
        .optional(),
});

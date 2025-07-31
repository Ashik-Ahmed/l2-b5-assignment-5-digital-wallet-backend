import z from "zod";
import { USER_ROLES } from "./user.interface";

export const createUserZodSchema = z.object({
    name: z
        .string("Name must be string")
        .min(2, "Name too short, minimum 2 characters")
        .max(50, "Name cannot exceed 50 characters"),
    email: z
        .string().email("Invalid email format"),
    phone: z
        .string()
        .regex(/^(\+88)?01[3-9]\d{8}$/, "Please enter a valid Bangladeshi phone number"),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters long"),
    role: z
        .enum(USER_ROLES)
        .optional(),
    isActive: z
        .boolean()
        .optional(),
    isApproved: z
        .boolean()
        .optional(),
    commissionRate: z
        .number()
        .min(0, "Commission rate cannot be negative")
        .max(0.1, "Commission rate cannot exceed 10%")
        .optional()
});

export const updateUserZodSchema = z.object({
    name: z
        .string("Name must be string")
        .min(2, "Name too short, minimum 2 characters")
        .max(50, "Name cannot exceed 50 characters")
        .optional(),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters long")
        .optional(),
    role: z
        .enum(USER_ROLES)
        .optional(),
    isActive: z
        .boolean()
        .optional(),
    isApproved: z
        .boolean()
        .optional(),
    commissionRate: z
        .number()
        .min(0, "Commission rate cannot be negative")
        .max(0.1, "Commission rate cannot exceed 10%")
        .optional(),
});
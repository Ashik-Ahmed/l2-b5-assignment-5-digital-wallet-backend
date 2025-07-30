import { Types } from "mongoose";

export interface IUser extends Document {
    _id: Types.ObjectId;
    name: string;
    email: string;
    phone: string;
    password: string;
    role: 'user' | 'agent' | 'admin';
    isActive: boolean;
    isApproved?: boolean; // Only for agents
    commissionRate?: number; // Only for agents
    createdAt?: Date;
    updatedAt?: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}
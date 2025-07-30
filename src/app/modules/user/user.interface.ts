import { Types } from "mongoose";

export enum USER_ROLES {
    USER = 'user',
    AGENT = 'agent',
    ADMIN = 'admin',
}

export interface IUser extends Document {
    _id: Types.ObjectId;
    name: string;
    email: string;
    phone: string;
    password: string;
    role: USER_ROLES;
    wallet?: Types.ObjectId; // Reference to the user's wallet
    isActive: boolean;
    isApproved?: boolean; // Only for agents
    commissionRate?: number; // Only for agents
    createdAt?: Date;
    updatedAt?: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}
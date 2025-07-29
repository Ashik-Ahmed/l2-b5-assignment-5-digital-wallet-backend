import { Schema } from "mongoose";

export interface ISystemConfig extends Document {
    _id: string;
    key: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any;
    description: string;
    updatedBy: Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
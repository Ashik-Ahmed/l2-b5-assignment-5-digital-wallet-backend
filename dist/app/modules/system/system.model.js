"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultSystemConfigs = exports.SystemConfig = void 0;
const mongoose_1 = require("mongoose");
const systemConfigSchema = new mongoose_1.Schema({
    key: {
        type: String,
        required: [true, 'Config key is required'],
        unique: true,
        trim: true
    },
    value: {
        type: mongoose_1.Schema.Types.Mixed,
        required: [true, 'Config value is required']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        maxlength: [200, 'Description cannot exceed 200 characters']
    },
    updatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});
systemConfigSchema.index({ key: 1 });
exports.SystemConfig = (0, mongoose_1.model)('SystemConfig', systemConfigSchema);
// Default system configurations
exports.defaultSystemConfigs = [
    {
        key: 'CASHOUT_FEE_RATE',
        value: 0.005, // 0.5% transaction fee
        description: 'Standard transaction fee rate'
    },
    {
        key: 'SEND_MONEY_FEE',
        value: 5,
        description: 'Standard transaction fee rate'
    },
    {
        key: 'MIN_TRANSACTION_AMOUNT',
        value: 1,
        description: 'Minimum transaction amount in BDT'
    },
    {
        key: 'MAX_TRANSACTION_AMOUNT',
        value: 50000,
        description: 'Maximum transaction amount in BDT'
    },
    {
        key: 'DAILY_TRANSACTION_LIMIT',
        value: 10000,
        description: 'Default daily transaction limit in BDT'
    },
    {
        key: 'MONTHLY_TRANSACTION_LIMIT',
        value: 100000,
        description: 'Default monthly transaction limit in BDT'
    },
    {
        key: 'AGENT_COMMISSION_RATE',
        value: 0.01,
        description: 'Default agent commission rate (1%)'
    }
];

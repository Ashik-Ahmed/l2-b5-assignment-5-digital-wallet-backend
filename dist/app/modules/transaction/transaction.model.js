"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const mongoose_1 = require("mongoose");
const transaction_interface_1 = require("./transaction.interface");
const user_interface_1 = require("../user/user.interface");
const transactionSchema = new mongoose_1.Schema({
    transactionId: {
        type: String,
        required: true,
        unique: true,
        default: function () {
            return `TXN${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        }
    },
    type: {
        type: String,
        required: [true, 'Transaction type is required'],
        enum: transaction_interface_1.TRANSACTION_TYPES
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0.01, 'Amount must be greater than 0']
    },
    fee: {
        type: Number,
        // default: defaultSystemConfigs.find(config => config.key === 'TRANSACTION_FEE_RATE')?.value,
        min: [0, 'Fee cannot be negative']
    },
    commission: {
        type: Number,
        // default: defaultSystemConfigs.find(config => config.key === 'AGENT_COMMISSION_RATE')?.value,
        min: [0, 'Commission cannot be negative']
    },
    netAmount: {
        type: Number,
    },
    fromWallet: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Wallet'
    },
    toWallet: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Wallet'
    },
    fromUser: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    toUser: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    initiatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Initiator is required']
    },
    initiatorRole: {
        type: String,
        required: true,
        enum: user_interface_1.USER_ROLES
    },
    status: {
        type: String,
        enum: transaction_interface_1.TRANSACTION_STATUS,
        default: transaction_interface_1.TRANSACTION_STATUS.PENDING
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    metadata: {
        agentId: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        },
        reference: String,
        method: String
    }
}, {
    timestamps: true
});
// Pre-save middleware to calculate net amount
// transactionSchema.pre('save', function (next) {
//     this.netAmount = this.amount - this.fee;
//     next();
// });
// Indexes for better query performance
// transactionSchema.index({ transactionId: 1 });
// transactionSchema.index({ fromUser: 1, createdAt: -1 });
// transactionSchema.index({ toUser: 1, createdAt: -1 });
// transactionSchema.index({ initiatedBy: 1, createdAt: -1 });
// transactionSchema.index({ type: 1, status: 1 });
// transactionSchema.index({ createdAt: -1 });
exports.Transaction = (0, mongoose_1.model)('Transaction', transactionSchema);

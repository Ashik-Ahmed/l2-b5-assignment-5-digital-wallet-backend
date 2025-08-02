"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const user_interface_1 = require("./user.interface");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const env_1 = require("../../config/env");
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true,
        match: [/^(\+88)?01[3-9]\d{8}$/, 'Please enter a valid Bangladeshi phone number']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    role: {
        type: String,
        enum: user_interface_1.USER_ROLES,
        default: user_interface_1.USER_ROLES.USER
    },
    wallet: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Wallet'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // Agent specific fields
    isApproved: {
        type: Boolean,
        default: false // Set default to false; update in pre-save if needed
    },
    commissionRate: {
        type: Number,
        default: 0.01, // Set default to 0.01; update in pre-save if needed
        min: [0, 'Commission rate cannot be negative'],
        max: [0.1, 'Commission rate cannot exceed 10%']
    }
}, {
    timestamps: true
});
// Pre-save middleware to hash password and handle agent fields
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        // Hash password if modified
        if (this.isModified('password')) {
            try {
                this.password = yield bcryptjs_1.default.hash(this.password, Number(env_1.envVars.BCRYPT_SALT_ROUNDS));
            }
            catch (error) {
                return next(error);
            }
        }
        // Only set agent fields for agents, remove for others
        if (this.role === 'agent') {
            if (typeof this.isApproved === 'undefined') {
                this.isApproved = false;
            }
            // if (typeof this.commissionRate === 'undefined') {
            //     this.commissionRate = 0.01;
            // }
        }
        else {
            // Remove the fields for non-agents
            this.set('isApproved', undefined, { strict: false });
            // this.set('commissionRate', undefined, { strict: false });
        }
        next();
    });
});
// Index for better query performance
// userSchema.index({ email: 1 });
// userSchema.index({ phone: 1 });
// userSchema.index({ role: 1, isApproved: 1 });
exports.User = (0, mongoose_1.model)('User', userSchema);

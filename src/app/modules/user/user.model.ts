import { model, Schema } from "mongoose";
import { IUser } from "./user.interface";
import bcrypt from "bcryptjs";

const userSchema = new Schema<IUser>({
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
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'agent', 'admin'],
        default: 'user'
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
userSchema.pre('save', async function (next) {
    // Hash password if modified
    if (this.isModified('password')) {
        try {
            const saltRounds = 12;
            this.password = await bcrypt.hash(this.password, saltRounds);
        } catch (error) {
            return next(error as Error);
        }
    }

    // Only set agent fields for agents, remove for others
    if (this.role === 'agent') {
        if (typeof this.isApproved === 'undefined') {
            this.isApproved = false;
        }
        if (typeof this.commissionRate === 'undefined') {
            this.commissionRate = 0.01;
        }
    } else {
        // Remove the fields for non-agents
        this.set('isApproved', undefined, { strict: false });
        this.set('commissionRate', undefined, { strict: false });
    }

    next();
});

// Index for better query performance
// userSchema.index({ email: 1 });
// userSchema.index({ phone: 1 });
// userSchema.index({ role: 1, isApproved: 1 });

export const User = model<IUser>('User', userSchema);
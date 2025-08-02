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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_model_1 = require("./user.model");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const env_1 = require("../../config/env");
const wallet_model_1 = require("../wallet/wallet.model");
const createUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, phone, password } = payload, rest = __rest(payload, ["name", "email", "phone", "password"]);
    // mongoose pre-hook is hashing password 
    // const hashedPassword = await bcrypt.hash(password as string, 10);
    const user = yield user_model_1.User.create(Object.assign({ name,
        email,
        phone,
        password }, rest));
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.INTERNAL_SERVER_ERROR, "User creation failed");
    }
    // Automatically create wallet for user or agent
    if (user.role === "user" || user.role === "agent") {
        const wallet = yield wallet_model_1.Wallet.create({ userId: user._id });
        if (!(wallet === null || wallet === void 0 ? void 0 : wallet._id)) {
            yield user_model_1.User.findByIdAndDelete(user._id);
            throw new AppError_1.default(http_status_codes_1.default.INTERNAL_SERVER_ERROR, "Wallet creation failed! User deleted. Please try again.");
        }
        user.wallet = wallet._id;
        yield user.save();
    }
    // console.log("User created successfully:", user); 
    // console.log("Wallet created successfully:", wallet);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _a = user.toObject(), { password: pass } = _a, userWithoutPassword = __rest(_a, ["password"]);
    return userWithoutPassword;
});
const updateUser = (userId, payload, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    const ifUserExist = yield user_model_1.User.findById(userId);
    if (!ifUserExist) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User Not Found");
    }
    if (payload.role) {
        if (decodedToken.role !== "admin") {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not authorized");
        }
        // if (payload.role === Role.SUPER_ADMIN && decodedToken.role === Role.ADMIN) {
        //     throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
        // }
    }
    if ('isActive' in payload || 'isApproved' in payload || 'commissionRate' in payload) {
        if (decodedToken.role !== "admin") {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not authorized");
        }
    }
    if (payload.password) {
        payload.password = yield bcryptjs_1.default.hash(payload.password, Number(env_1.envVars.BCRYPT_SALT_ROUNDS));
    }
    const newUpdatedUser = yield user_model_1.User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true });
    return newUpdatedUser;
});
exports.UserService = {
    createUser,
    updateUser
};

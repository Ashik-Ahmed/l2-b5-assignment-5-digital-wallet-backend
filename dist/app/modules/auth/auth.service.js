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
exports.AuthService = void 0;
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const user_model_1 = require("../user/user.model");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userTokens_1 = require("../../utils/userTokens");
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
const credentialLogin = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = payload;
    const isUserExist = yield user_model_1.User.findOne({ email });
    if (!isUserExist) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    const isPasswordMatched = yield bcryptjs_1.default.compare(password, isUserExist.password);
    if (!isPasswordMatched) {
        throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "Invalid password");
    }
    const userTokens = (0, userTokens_1.createUserTokens)(isUserExist);
    return {
        user: {
            _id: isUserExist._id,
            email: isUserExist.email,
            name: isUserExist.name,
            role: isUserExist.role,
        },
        accessToken: userTokens.accessToken,
        refreshToken: userTokens.refreshToken,
    };
});
const getNewAccessToken = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    const newAccessToken = yield (0, userTokens_1.createNewAccessTokenWithRefreshToken)(refreshToken);
    return {
        accessToken: newAccessToken
    };
});
exports.AuthService = {
    createUser,
    credentialLogin,
    getNewAccessToken
};

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.envVars = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const leadEnvVariables = () => {
    const requiredVariables = ['PORT', 'DB_URL', 'NODE_ENV', 'JWT_SECRET', 'JWT_EXPIRATION', 'JWT_REFRESH_SECRET', 'JWT_REFRESH_EXPIRATION', 'BCRYPT_SALT_ROUNDS', 'SUPER_ADMIN_EMAIL', 'SUPER_ADMIN_PASSWORD'];
    requiredVariables.forEach((variable) => {
        if (!process.env[variable]) {
            throw new Error(`Environment variable ${variable} is not defined`);
        }
    });
    return {
        PORT: process.env.PORT,
        DB_URL: process.env.DB_URL,
        NODE_ENV: process.env.NODE_ENV,
        JWT_SECRET: process.env.JWT_SECRET,
        JWT_EXPIRATION: process.env.JWT_EXPIRATION,
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
        JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION,
        BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS,
        SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL,
        SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD
    };
};
exports.envVars = leadEnvVariables();

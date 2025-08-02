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
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAdmin = void 0;
/* eslint-disable no-console */
const user_model_1 = require("../modules/user/user.model");
const env_1 = require("../config/env");
const user_interface_1 = require("../modules/user/user.interface");
const seedAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isAdminExist = yield user_model_1.User.findOne({ email: env_1.envVars.SUPER_ADMIN_EMAIL });
        if (isAdminExist) {
            // console.log("Admin Already Exists!");
            return;
        }
        console.log("Trying to create Admin...");
        // const hashedPassword = await bcryptjs.hash(envVars.SUPER_ADMIN_PASSWORD, Number(envVars.BCRYPT_SALT_ROUNDS))
        const payload = {
            name: "Admin User",
            role: user_interface_1.USER_ROLES.ADMIN,
            email: env_1.envVars.SUPER_ADMIN_EMAIL,
            password: env_1.envVars.SUPER_ADMIN_PASSWORD,
            phone: "01710112233",
            isActive: true
        };
        const admin = yield user_model_1.User.create(payload);
        console.log("Admin User Created: \n", admin);
    }
    catch (error) {
        console.log(error);
    }
});
exports.seedAdmin = seedAdmin;

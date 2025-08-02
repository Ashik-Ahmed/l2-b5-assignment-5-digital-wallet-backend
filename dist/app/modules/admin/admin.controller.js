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
exports.AdminController = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const admin_service_1 = require("./admin.service");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const sendResponse_1 = require("../../utils/sendResponse");
const getAllUsers = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield admin_service_1.AdminService.getAllUsers();
    if (result.users.length === 0) {
        return (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_codes_1.default.OK,
            success: true,
            message: "No users found",
            data: []
        });
    }
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Users retrieved successfully",
        data: result.users,
        meta: result.meta
    });
}));
const getAllWallets = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield admin_service_1.AdminService.getAllWallets();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Wallets retrieved successfully",
        data: result.wallets,
        meta: result.meta
    });
}));
const walletBlockUnblock = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { walletId } = req.params;
    const { isBlocked } = req.body;
    const result = yield admin_service_1.AdminService.walletBlockUnblock(walletId, isBlocked);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: `Wallet ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
        data: result
    });
}));
const getWalletDetails = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { walletId } = req.params;
    const result = yield admin_service_1.AdminService.getWalletDetails(walletId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Wallet details retrieved successfully",
        data: result
    });
}));
const getAllAgents = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield admin_service_1.AdminService.getAllAgents();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Agents retrieved successfully",
        data: result.agents,
        meta: result.meta
    });
}));
const agentApproval = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const { isApproved } = req.body;
    const result = yield admin_service_1.AdminService.agentApproval(userId, isApproved);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: `Agent ${isApproved ? 'approved' : 'un-approved'} successfully`,
        data: result
    });
}));
const getAllTransactions = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield admin_service_1.AdminService.getAllTransactions();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Transactions retrieved successfully",
        data: result.transactions,
        meta: result.meta
    });
}));
exports.AdminController = {
    getAllUsers,
    getAllWallets,
    walletBlockUnblock,
    getWalletDetails,
    getAllAgents,
    agentApproval,
    getAllTransactions
};

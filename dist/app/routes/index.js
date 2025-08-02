"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const user_route_1 = require("../modules/user/user.route");
const auth_route_1 = require("../modules/auth/auth.route");
const admin_route_1 = require("../modules/admin/admin.route");
const wallet_route_1 = require("../modules/wallet/wallet.route");
const agent_route_1 = require("../modules/agent/agent.route");
const transaction_route_1 = require("../modules/transaction/transaction.route");
exports.router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: "/auth",
        route: auth_route_1.AuthRoutes
    },
    {
        path: "/user",
        route: user_route_1.userRoutes
    },
    {
        path: "/admin",
        route: admin_route_1.adminRoutes
    },
    {
        path: "/agents",
        route: agent_route_1.AgentRoute
    },
    {
        path: "/wallets",
        route: wallet_route_1.WalletRoute
    },
    {
        path: "/transactions",
        route: transaction_route_1.transactionRoutes
    }
];
moduleRoutes.forEach(route => {
    exports.router.use(route.path, route.route);
});
exports.default = exports.router;

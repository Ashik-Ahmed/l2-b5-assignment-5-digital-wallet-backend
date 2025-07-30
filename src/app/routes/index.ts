import { Router } from "express"
import { userRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { adminRoutes } from "../modules/admin/admin.route";
import { WalletRoute } from "../modules/wallet/wallet.route";

export const router = Router();

const moduleRoutes = [
    {
        path: "/auth",
        route: AuthRoutes
    },
    {
        path: "/user",
        route: userRoutes
    },
    {
        path: "/admin",
        route: adminRoutes
    },
    {
        path: "/wallets",
        route: WalletRoute
    }
]

moduleRoutes.forEach(route => {
    router.use(route.path, route.route);
});

export default router;
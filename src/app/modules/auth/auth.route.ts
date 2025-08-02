import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createUserZodSchema } from "../user/user.validation";

const router = Router();

router.post("/register", validateRequest(createUserZodSchema), AuthController.createUser);
router.post("/login", AuthController.credentialLogin);
router.post("/refresh-token", AuthController.getNewAccessToken);

export const AuthRoutes = router;

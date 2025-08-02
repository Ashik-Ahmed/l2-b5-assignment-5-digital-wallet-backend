import { Router } from "express";
import { UserController } from "./user.controller";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";
import { validateRequest } from "../../middlewares/validateRequest";
import { checkAuth } from "../../middlewares/checkAuth";
import { USER_ROLES } from "./user.interface";


const router = Router();


router.post("/register", validateRequest(createUserZodSchema), UserController.createUser);
router.patch("/:id", validateRequest(updateUserZodSchema), checkAuth(USER_ROLES.ADMIN, USER_ROLES.AGENT, USER_ROLES.USER), UserController.updateUser);

export const userRoutes = router;

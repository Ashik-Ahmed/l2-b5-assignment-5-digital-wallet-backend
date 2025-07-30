import { Router } from "express";
import { UserController } from "./user.controller";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";
import { validateRequest } from "../../middlewares/validateRequest";
import { checkAuth } from "../../middlewares/checkAuth";


const router = Router();


router.post("/register", validateRequest(createUserZodSchema), UserController.createUser);
router.patch("/:id", validateRequest(updateUserZodSchema), checkAuth("user", "agent", "admin"), UserController.updateUser);

export const userRoutes = router;

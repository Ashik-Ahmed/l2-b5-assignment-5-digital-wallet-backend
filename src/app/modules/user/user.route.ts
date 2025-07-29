import { Router } from "express";
import { UserController } from "./user.controller";
import { createUserZodSchema } from "./user.validation";
import { validateRequest } from "../../middlewares/validateRequest";
import { checkAuth } from "../../middlewares/checkAuth";


const router = Router();


router.post("/register", validateRequest(createUserZodSchema), UserController.createUser);
router.get("/get-all-users", checkAuth("admin"), UserController.getAllUsers);

export const userRoutes = router;

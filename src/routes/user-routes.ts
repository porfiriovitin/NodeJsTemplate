import { Router } from "express";
import { UserController } from "../controllers/user-controller.js";

const userRoutes = Router();
const userController = new UserController();

userRoutes.post("/register", userController.register);
userRoutes.post("/login", userController.login);
userRoutes.post("/logout", userController.logout);
userRoutes.get("/login", userController.render); 

export { userRoutes };

import { Router } from "express";
import { UserController } from "../controllers/UserController";

const userRoutes = Router();

userRoutes.get("/users", UserController.list);
userRoutes.get("/users/:id", UserController.show);
userRoutes.post("/users", UserController.create);
userRoutes.put("/users/:id", UserController.update);
userRoutes.delete("/users/:id", UserController.remove);

export default userRoutes;

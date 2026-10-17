import { Router } from "express";
import { ProductController } from "../controllers/ProductController";

const productRoutes = Router();

productRoutes.get("/products", ProductController.list);
productRoutes.get("/products/:id", ProductController.show);
productRoutes.post("/products", ProductController.create);
productRoutes.put("/products/:id", ProductController.update);
productRoutes.delete("/products/:id", ProductController.remove);

export default productRoutes;

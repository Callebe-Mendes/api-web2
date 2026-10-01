import { Router } from "express";
import { ProductCategoryController } from "../controllers/ProductCategoryController";

const productCategoryRoutes = Router();

productCategoryRoutes.get("/productcategories", ProductCategoryController.list);
productCategoryRoutes.get("/productcategories/:id", ProductCategoryController.show);
productCategoryRoutes.post("/productcategories", ProductCategoryController.create);
productCategoryRoutes.put("/productcategories/:id", ProductCategoryController.update);
productCategoryRoutes.delete("/productcategories/:id", ProductCategoryController.remove);

export default productCategoryRoutes;

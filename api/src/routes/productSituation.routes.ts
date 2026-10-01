import { Router } from "express";
import { ProductSituationController } from "../controllers/ProductSituationController";

const productSituationRoutes = Router();

productSituationRoutes.get("/productsituations", ProductSituationController.list);
productSituationRoutes.get("/productsituations/:id", ProductSituationController.show);
productSituationRoutes.post("/productsituations", ProductSituationController.create);
productSituationRoutes.put("/productsituations/:id", ProductSituationController.update);
productSituationRoutes.delete("/productsituations/:id", ProductSituationController.remove);

export default productSituationRoutes;

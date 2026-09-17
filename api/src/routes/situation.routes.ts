import { Router } from "express";
import { SituationController } from "../controllers/SituationController";

const situationRoutes = Router();

situationRoutes.get("/situations", SituationController.list);
situationRoutes.get("/situations/:id", SituationController.show);
situationRoutes.post("/situations", SituationController.create);
situationRoutes.put("/situations/:id", SituationController.update);
situationRoutes.delete("/situations/:id", SituationController.remove);

export default situationRoutes;

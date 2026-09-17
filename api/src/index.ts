import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initializeDatabase } from "./data-source";
import situationRoutes from "./routes/situation.routes";

dotenv.config();

async function bootstrap(): Promise<void> {
  await initializeDatabase();

  const app = express();
  const port = process.env.PORT || 8080;

  app.use(express.json());
  app.use(cors());

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/", situationRoutes);

  app.listen(port, () => {
    console.log(`Servidor iniciado na porta ${port}: http://localhost:${port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Falha ao iniciar a aplicação:", error);
  process.exit(1);
});

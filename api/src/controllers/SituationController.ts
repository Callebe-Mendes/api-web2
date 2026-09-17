import { Request, Response } from "express";
import { Not } from "typeorm";
import { AppDataSource } from "../data-source";
import { Situation } from "../entities/Situation";
import { PaginationService } from "../shared/PaginationService";
import { handleValidationError } from "../shared/validation";
import {
  createSituationSchema,
  updateSituationSchema,
} from "../validators/situation.validator";

export class SituationController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const situationRepository = AppDataSource.getRepository(Situation);
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const total = await situationRepository.count();
      if (total === 0) {
        res.status(200).json({
          mensagem: "Nenhuma situação encontrada",
          situations: [],
        });
        return;
      }

      try {
        const result = await PaginationService.paginate(
          situationRepository,
          page,
          limit,
          { id: "DESC" }
        );

        res.status(200).json({
          currentPage: result.currentPage,
          lastPage: result.lastPage,
          total: result.total,
          situations: result.data,
        });
      } catch (paginationError) {
        res.status(400).json({
          mensagem:
            paginationError instanceof Error
              ? paginationError.message
              : "Página inválida",
        });
      }
    } catch {
      res.status(500).json({
        mensagem: "Erro ao listar situação!",
      });
    }
  }

  static async show(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const situationRepository = AppDataSource.getRepository(Situation);
      const situation = await situationRepository.findOneBy({ id });

      if (!situation) {
        res.status(404).json({
          mensagem: "Situação não encontrada!",
        });
        return;
      }

      res.status(200).json(situation);
    } catch {
      res.status(500).json({
        mensagem: "Erro ao visualizar situação!",
      });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      await createSituationSchema.validate(req.body, { abortEarly: false });

      const { nameSituation } = req.body;
      const situationRepository = AppDataSource.getRepository(Situation);

      const existingSituation = await situationRepository.findOneBy({
        nameSituation,
      });
      if (existingSituation) {
        res.status(409).json({
          mensagem: "Já existe uma situação com este nome.",
        });
        return;
      }

      const newSituation = situationRepository.create({ nameSituation });
      await situationRepository.save(newSituation);

      res.status(201).json({
        mensagem: "Situação cadastrada com sucesso!",
        situation: newSituation,
      });
    } catch (error) {
      if (handleValidationError(error, res)) {
        return;
      }

      res.status(500).json({
        mensagem: "Erro ao cadastrar situação!",
      });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      await updateSituationSchema.validate(req.body, { abortEarly: false });

      const situationId = Number(req.params.id);
      const { nameSituation } = req.body;
      const situationRepository = AppDataSource.getRepository(Situation);

      if (nameSituation) {
        const existingSituation = await situationRepository.findOne({
          where: {
            nameSituation,
            id: Not(situationId),
          },
        });

        if (existingSituation) {
          res.status(409).json({
            mensagem: "Já existe outra situação com este nome.",
          });
          return;
        }
      }

      const situation = await situationRepository.findOneBy({ id: situationId });
      if (!situation) {
        res.status(404).json({
          mensagem: "Situação não encontrada!",
        });
        return;
      }

      situationRepository.merge(situation, { nameSituation });
      const updatedSituation = await situationRepository.save(situation);

      res.status(200).json({
        mensagem: "Situação atualizada com sucesso!",
        situation: updatedSituation,
      });
    } catch (error) {
      if (handleValidationError(error, res)) {
        return;
      }

      res.status(500).json({
        mensagem: "Erro ao atualizar situação!",
      });
    }
  }

  static async remove(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const situationRepository = AppDataSource.getRepository(Situation);
      const situation = await situationRepository.findOneBy({ id });

      if (!situation) {
        res.status(404).json({
          mensagem: "Situação não encontrada!",
        });
        return;
      }

      await situationRepository.remove(situation);

      res.status(200).json({
        mensagem: "Situação removida com sucesso!",
      });
    } catch {
      res.status(500).json({
        mensagem: "Erro ao remover situação!",
      });
    }
  }
}

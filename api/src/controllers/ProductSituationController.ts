import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { ProductSituation } from "../entities/ProductSituation";
import { PaginationService } from "../shared/PaginationService";
import { handleValidationError } from "../shared/validation";
import {
  createProductSituationSchema,
  updateProductSituationSchema,
} from "../validators/productSituation.validator";

export class ProductSituationController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const repository = AppDataSource.getRepository(ProductSituation);
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const total = await repository.count();
      if (total === 0) {
        res.status(200).json({
          mensagem: "Nenhum registro encontrado",
          productSituations: [],
        });
        return;
      }

      try {
        const result = await PaginationService.paginate(
          repository,
          page,
          limit,
          { id: "DESC" }
        );

        res.status(200).json({
          currentPage: result.currentPage,
          lastPage: result.lastPage,
          total: result.total,
          productSituations: result.data,
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
        mensagem: "Erro ao listar situação de produto!",
      });
    }
  }

  static async show(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const repository = AppDataSource.getRepository(ProductSituation);
      const productSituation = await repository.findOneBy({ id });

      if (!productSituation) {
        res.status(404).json({
          mensagem: "Situação de produto não encontrada!",
        });
        return;
      }

      res.status(200).json(productSituation);
    } catch {
      res.status(500).json({
        mensagem: "Erro ao visualizar situação de produto!",
      });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      await createProductSituationSchema.validate(req.body, { abortEarly: false });

      const { name } = req.body;
      const repository = AppDataSource.getRepository(ProductSituation);

      const newProductSituation = repository.create({ name });
      await repository.save(newProductSituation);

      res.status(201).json({
        mensagem: "Situação de produto cadastrada com sucesso!",
        productSituation: newProductSituation,
      });
    } catch (error) {
      if (handleValidationError(error, res)) {
        return;
      }

      res.status(500).json({
        mensagem: "Erro ao cadastrar situação de produto!",
      });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      await updateProductSituationSchema.validate(req.body, { abortEarly: false });

      const id = Number(req.params.id);
      const { name } = req.body;
      const repository = AppDataSource.getRepository(ProductSituation);

      const productSituation = await repository.findOneBy({ id });
      if (!productSituation) {
        res.status(404).json({
          mensagem: "Situação de produto não encontrada!",
        });
        return;
      }

      repository.merge(productSituation, { name });
      const updatedProductSituation = await repository.save(productSituation);

      res.status(200).json({
        mensagem: "Situação de produto atualizada com sucesso!",
        productSituation: updatedProductSituation,
      });
    } catch (error) {
      if (handleValidationError(error, res)) {
        return;
      }

      res.status(500).json({
        mensagem: "Erro ao atualizar situação de produto!",
      });
    }
  }

  static async remove(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const repository = AppDataSource.getRepository(ProductSituation);
      const productSituation = await repository.findOneBy({ id });

      if (!productSituation) {
        res.status(404).json({
          mensagem: "Situação de produto não encontrada!",
        });
        return;
      }

      await repository.remove(productSituation);

      res.status(200).json({
        mensagem: "Situação de produto removida com sucesso!",
      });
    } catch {
      res.status(500).json({
        mensagem: "Erro ao remover situação de produto!",
      });
    }
  }
}

import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { ProductCategory } from "../entities/ProductCategory";
import { PaginationService } from "../shared/PaginationService";
import { handleValidationError } from "../shared/validation";
import {
  createProductCategorySchema,
  updateProductCategorySchema,
} from "../validators/productCategory.validator";

export class ProductCategoryController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const repository = AppDataSource.getRepository(ProductCategory);
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const total = await repository.count();
      if (total === 0) {
        res.status(200).json({
          mensagem: "Nenhum registro encontrado",
          productCategories: [],
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
          productCategories: result.data,
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
        mensagem: "Erro ao listar categoria de produto!",
      });
    }
  }

  static async show(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const repository = AppDataSource.getRepository(ProductCategory);
      const productCategory = await repository.findOneBy({ id });

      if (!productCategory) {
        res.status(404).json({
          mensagem: "Categoria de produto não encontrada!",
        });
        return;
      }

      res.status(200).json(productCategory);
    } catch {
      res.status(500).json({
        mensagem: "Erro ao visualizar categoria de produto!",
      });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      await createProductCategorySchema.validate(req.body, { abortEarly: false });

      const { name } = req.body;
      const repository = AppDataSource.getRepository(ProductCategory);

      const newProductCategory = repository.create({ name });
      await repository.save(newProductCategory);

      res.status(201).json({
        mensagem: "Categoria de produto cadastrada com sucesso!",
        productCategory: newProductCategory,
      });
    } catch (error) {
      if (handleValidationError(error, res)) {
        return;
      }

      res.status(500).json({
        mensagem: "Erro ao cadastrar categoria de produto!",
      });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      await updateProductCategorySchema.validate(req.body, { abortEarly: false });

      const id = Number(req.params.id);
      const { name } = req.body;
      const repository = AppDataSource.getRepository(ProductCategory);

      const productCategory = await repository.findOneBy({ id });
      if (!productCategory) {
        res.status(404).json({
          mensagem: "Categoria de produto não encontrada!",
        });
        return;
      }

      repository.merge(productCategory, { name });
      const updatedProductCategory = await repository.save(productCategory);

      res.status(200).json({
        mensagem: "Categoria de produto atualizada com sucesso!",
        productCategory: updatedProductCategory,
      });
    } catch (error) {
      if (handleValidationError(error, res)) {
        return;
      }

      res.status(500).json({
        mensagem: "Erro ao atualizar categoria de produto!",
      });
    }
  }

  static async remove(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const repository = AppDataSource.getRepository(ProductCategory);
      const productCategory = await repository.findOneBy({ id });

      if (!productCategory) {
        res.status(404).json({
          mensagem: "Categoria de produto não encontrada!",
        });
        return;
      }

      await repository.remove(productCategory);

      res.status(200).json({
        mensagem: "Categoria de produto removida com sucesso!",
      });
    } catch {
      res.status(500).json({
        mensagem: "Erro ao remover categoria de produto!",
      });
    }
  }
}

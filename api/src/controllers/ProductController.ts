import { Request, Response } from "express";
import { Not } from "typeorm";
import { AppDataSource } from "../data-source";
import { Product } from "../entities/Product";
import { ProductSituation } from "../entities/ProductSituation";
import { ProductCategory } from "../entities/ProductCategory";
import { requireId, sendPaginatedList } from "../shared/http";
import { handleValidationError } from "../shared/validation";
import {
  createProductSchema,
  updateProductSchema,
} from "../validators/product.validator";

const productRelations = { productSituation: true, productCategory: true };

async function findInvalidReference(
  productSituationId?: number,
  productCategoryId?: number
): Promise<string | null> {
  if (productSituationId !== undefined) {
    const productSituation = await AppDataSource.getRepository(
      ProductSituation
    ).findOneBy({ id: productSituationId });
    if (!productSituation) {
      return "A situação de produto informada não existe.";
    }
  }

  if (productCategoryId !== undefined) {
    const productCategory = await AppDataSource.getRepository(
      ProductCategory
    ).findOneBy({ id: productCategoryId });
    if (!productCategory) {
      return "A categoria de produto informada não existe.";
    }
  }

  return null;
}

export class ProductController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      await sendPaginatedList(
        req,
        res,
        AppDataSource.getRepository(Product),
        "products",
        productRelations
      );
    } catch {
      res.status(500).json({
        mensagem: "Erro ao listar produto!",
      });
    }
  }

  static async show(req: Request, res: Response): Promise<void> {
    try {
      const id = requireId(req, res);
      if (id === null) return;
      const productRepository = AppDataSource.getRepository(Product);
      const product = await productRepository.findOne({
        where: { id },
        relations: productRelations,
      });

      if (!product) {
        res.status(404).json({
          mensagem: "Produto não encontrado!",
        });
        return;
      }

      res.status(200).json(product);
    } catch {
      res.status(500).json({
        mensagem: "Erro ao visualizar produto!",
      });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      await createProductSchema.validate(req.body, { abortEarly: false });

      const { name, slug, productSituationId, productCategoryId } = req.body;
      const productRepository = AppDataSource.getRepository(Product);

      const invalidReference = await findInvalidReference(
        productSituationId,
        productCategoryId
      );
      if (invalidReference) {
        res.status(400).json({ mensagem: invalidReference });
        return;
      }

      const existingProduct = await productRepository.findOneBy({ slug });
      if (existingProduct) {
        res.status(409).json({
          mensagem: "Já existe um produto com este slug.",
        });
        return;
      }

      const newProduct = productRepository.create({
        name,
        slug,
        productSituationId,
        productCategoryId,
      });
      await productRepository.save(newProduct);

      const product = await productRepository.findOne({
        where: { id: newProduct.id },
        relations: productRelations,
      });

      res.status(201).json({
        mensagem: "Produto cadastrado com sucesso!",
        product,
      });
    } catch (error) {
      if (handleValidationError(error, res)) {
        return;
      }

      res.status(500).json({
        mensagem: "Erro ao cadastrar produto!",
      });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      await updateProductSchema.validate(req.body, { abortEarly: false });

      const id = requireId(req, res);
      if (id === null) return;
      const { name, slug, productSituationId, productCategoryId } = req.body;
      const productRepository = AppDataSource.getRepository(Product);

      const product = await productRepository.findOneBy({ id });
      if (!product) {
        res.status(404).json({
          mensagem: "Produto não encontrado!",
        });
        return;
      }

      const invalidReference = await findInvalidReference(
        productSituationId,
        productCategoryId
      );
      if (invalidReference) {
        res.status(400).json({ mensagem: invalidReference });
        return;
      }

      if (slug) {
        const existingProduct = await productRepository.findOne({
          where: { slug, id: Not(id) },
        });
        if (existingProduct) {
          res.status(409).json({
            mensagem: "Já existe outro produto com este slug.",
          });
          return;
        }
      }

      productRepository.merge(product, {
        name,
        slug,
        productSituationId,
        productCategoryId,
      });
      await productRepository.save(product);

      const updatedProduct = await productRepository.findOne({
        where: { id },
        relations: productRelations,
      });

      res.status(200).json({
        mensagem: "Produto atualizado com sucesso!",
        product: updatedProduct,
      });
    } catch (error) {
      if (handleValidationError(error, res)) {
        return;
      }

      res.status(500).json({
        mensagem: "Erro ao atualizar produto!",
      });
    }
  }

  static async remove(req: Request, res: Response): Promise<void> {
    try {
      const id = requireId(req, res);
      if (id === null) return;
      const productRepository = AppDataSource.getRepository(Product);
      const product = await productRepository.findOneBy({ id });

      if (!product) {
        res.status(404).json({
          mensagem: "Produto não encontrado!",
        });
        return;
      }

      await productRepository.remove(product);

      res.status(200).json({
        mensagem: "Produto removido com sucesso!",
      });
    } catch {
      res.status(500).json({
        mensagem: "Erro ao remover produto!",
      });
    }
  }
}

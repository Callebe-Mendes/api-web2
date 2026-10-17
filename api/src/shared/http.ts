import { Request, Response } from "express";
import { FindOptionsRelations, ObjectLiteral, Repository } from "typeorm";
import { InvalidPageError, PaginationService } from "./PaginationService";

const MAX_LIMIT = 100;

export function requireId(req: Request, res: Response): number | null {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ mensagem: "ID inválido." });
    return null;
  }

  return id;
}

export async function sendPaginatedList<T extends ObjectLiteral>(
  req: Request,
  res: Response,
  repository: Repository<T>,
  key: string,
  relations?: FindOptionsRelations<T>
): Promise<void> {
  const page = Math.max(1, Math.floor(Number(req.query.page)) || 1);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Math.floor(Number(req.query.limit)) || 10)
  );

  try {
    const result = await PaginationService.paginate(
      repository,
      page,
      limit,
      { id: "DESC" } as never,
      relations
    );

    if (result.total === 0) {
      res.status(200).json({ mensagem: "Nenhum registro encontrado", [key]: [] });
      return;
    }

    res.status(200).json({
      currentPage: result.currentPage,
      lastPage: result.lastPage,
      total: result.total,
      [key]: result.data,
    });
  } catch (error) {
    if (error instanceof InvalidPageError) {
      res.status(400).json({ mensagem: error.message });
      return;
    }
    throw error;
  }
}

import {
  Repository,
  ObjectLiteral,
  FindOptionsOrder,
  FindOptionsRelations,
} from "typeorm";

export interface PaginationResult<T> {
  data: T[];
  currentPage: number;
  lastPage: number;
  total: number;
}

export class InvalidPageError extends Error {}

export class PaginationService {
  static async paginate<T extends ObjectLiteral>(
    repository: Repository<T>,
    page: number = 1,
    limit: number = 10,
    order: FindOptionsOrder<T> = {},
    relations?: FindOptionsRelations<T>
  ): Promise<PaginationResult<T>> {
    const total = await repository.count();
    const lastPage = Math.ceil(total / limit) || 1;

    if (total > 0 && page > lastPage) {
      throw new InvalidPageError(
        `Página inválida, o máximo de páginas é ${lastPage}`
      );
    }

    const offset = (page - 1) * limit;
    const data = await repository.find({
      take: limit,
      skip: offset,
      order,
      relations,
    });

    return {
      data,
      currentPage: page,
      lastPage: total === 0 ? 0 : lastPage,
      total,
    };
  }
}

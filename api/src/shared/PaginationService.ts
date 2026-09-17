import { Repository, ObjectLiteral, FindOptionsOrder } from "typeorm";

export interface PaginationResult<T> {
  data: T[];
  currentPage: number;
  lastPage: number;
  total: number;
}

export class PaginationService {
  static async paginate<T extends ObjectLiteral>(
    repository: Repository<T>,
    page: number = 1,
    limit: number = 10,
    order: FindOptionsOrder<T> = {}
  ): Promise<PaginationResult<T>> {
    const total = await repository.count();
    const lastPage = Math.ceil(total / limit) || 1;

    if (total > 0 && page > lastPage) {
      throw new Error(`Página inválida, o máximo de páginas é ${lastPage}`);
    }

    const offset = (page - 1) * limit;
    const data = await repository.find({
      take: limit,
      skip: offset,
      order,
    });

    return {
      data,
      currentPage: page,
      lastPage: total === 0 ? 0 : lastPage,
      total,
    };
  }
}

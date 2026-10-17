import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateProductsTable1773769600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "products",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "name",
            type: "varchar",
          },
          {
            name: "slug",
            type: "varchar",
            isUnique: true,
          },
          {
            name: "productSituationId",
            type: "int",
          },
          {
            name: "productCategoryId",
            type: "int",
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updatedAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
        ],
        foreignKeys: [
          {
            name: "FK_products_productSituationId",
            columnNames: ["productSituationId"],
            referencedTableName: "productsituations",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
          {
            name: "FK_products_productCategoryId",
            columnNames: ["productCategoryId"],
            referencedTableName: "productcategories",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("products");
  }
}

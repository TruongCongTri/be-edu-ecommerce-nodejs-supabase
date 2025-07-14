import { MigrationInterface, QueryRunner, TableForeignKey } from "typeorm";

export class AddProductCategoryRelations1752276329110
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createForeignKey(
      "products",
      new TableForeignKey({
        columnNames: ["category_id"],
        referencedTableName: "categories",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("products");
    if (table) {
      const foreignKey = table.foreignKeys.find((fk) =>
        fk.columnNames.includes("category_id")
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey("products", foreignKey);
      }
    }
  }
}

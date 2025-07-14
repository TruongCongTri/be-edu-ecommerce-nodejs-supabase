import { MigrationInterface, QueryRunner, TableForeignKey } from "typeorm";

export class AddProductDetailRelations1752276413107
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createForeignKey(
      "product_details",
      new TableForeignKey({
        columnNames: ["product_id"],
        referencedTableName: "products",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("product_details");
    if (table) {
      const foreignKey = table.foreignKeys.find((fk) =>
        fk.columnNames.includes("product_id")
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey("product_details", foreignKey);
      }
    }
  }
}

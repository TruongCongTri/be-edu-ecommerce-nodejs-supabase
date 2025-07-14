import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class AddEducatorIdToProductDetails1752431728653
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add column
    await queryRunner.addColumn(
      "product_details",
      new TableColumn({
        name: "educator_id",
        type: "uuid",
        isNullable: true,
      })
    );

    // Add FK
    await queryRunner.createForeignKey(
      "product_details",
      new TableForeignKey({
        columnNames: ["educator_id"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("product_details");
    const fk = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf("educator_id") !== -1
    );
    if (fk) {
      await queryRunner.dropForeignKey("product_details", fk);
    }
    await queryRunner.dropColumn("product_details", "educator_id");
  }
}

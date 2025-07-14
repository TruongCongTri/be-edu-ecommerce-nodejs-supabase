import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class AddEducatorIdToProducts1752277032707
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add column
    await queryRunner.addColumn(
      "products",
      new TableColumn({
        name: "educator_id",
        type: "uuid",
        isNullable: true,
      })
    );

    // Add FK
    await queryRunner.createForeignKey(
      "products",
      new TableForeignKey({
        columnNames: ["educator_id"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("products");
    const fk = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf("educator_id") !== -1
    );
    if (fk) {
      await queryRunner.dropForeignKey("products", fk);
    }
    await queryRunner.dropColumn("products", "educator_id");
  }
}

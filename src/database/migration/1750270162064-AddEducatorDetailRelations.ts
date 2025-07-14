import { MigrationInterface, QueryRunner, TableForeignKey } from "typeorm";

export class AddEmployerDetailRelations1750270162064
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createForeignKey(
      "educator_details",
      new TableForeignKey({
        columnNames: ["user_id"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("educator_details");
    if (table) {
      const foreignKey = table.foreignKeys.find((fk) =>
        fk.columnNames.includes("user_id")
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey("educator_details", foreignKey);
      }
    }
  }
}

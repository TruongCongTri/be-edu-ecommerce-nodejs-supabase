import { MigrationInterface, QueryRunner, TableForeignKey } from "typeorm";

export class AddRelationsToEmployersTable1750270162064
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createForeignKey(
      "employers",
      new TableForeignKey({
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("employers");
    if (table) {
      const foreignKey = table.foreignKeys.find((fk) =>
        fk.columnNames.includes("user_id")
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey("employers", foreignKey);
      }
    }
  }
}

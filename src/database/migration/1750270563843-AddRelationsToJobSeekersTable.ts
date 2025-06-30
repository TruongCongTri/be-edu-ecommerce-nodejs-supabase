import { MigrationInterface, QueryRunner, TableForeignKey } from "typeorm";

export class AddRelationsToJobSeekersTable1750270563843
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createForeignKey(
      "job_seekers",
      new TableForeignKey({
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("job_seekers");
    if (table) {
      const foreignKey = table.foreignKeys.find((fk) =>
        fk.columnNames.includes("user_id")
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey("job_seekers", foreignKey);
      }
    }
  }
}

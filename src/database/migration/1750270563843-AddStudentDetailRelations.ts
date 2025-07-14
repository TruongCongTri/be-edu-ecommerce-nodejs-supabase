import { MigrationInterface, QueryRunner, TableForeignKey } from "typeorm";

export class AddStudentDetailRelations1750270563843
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createForeignKey(
      "student_details",
      new TableForeignKey({
        columnNames: ["user_id"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("student_details");
    if (table) {
      const foreignKey = table.foreignKeys.find((fk) =>
        fk.columnNames.includes("user_id")
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey("student_details", foreignKey);
      }
    }
  }
}

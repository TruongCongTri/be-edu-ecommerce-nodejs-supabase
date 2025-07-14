import { MigrationInterface, QueryRunner, TableForeignKey } from "typeorm";

export class AddProductSkillsRelations1752276439652
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createForeignKey(
      "product_skills",
      new TableForeignKey({
        columnNames: ["product_id"],
        referencedTableName: "products",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "product_skills",
      new TableForeignKey({
        columnNames: ["skill_id"],
        referencedTableName: "skills",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("product_skills");
    if (table) {
      const foreignKeyProd = table.foreignKeys.find((fk) =>
        fk.columnNames.includes("product_id")
      );
      if (foreignKeyProd) {
        await queryRunner.dropForeignKey("product_skills", foreignKeyProd);
      }

      const foreignKeySkill = table.foreignKeys.find((fk) =>
        fk.columnNames.includes("skill_id")
      );
      if (foreignKeySkill) {
        await queryRunner.dropForeignKey("product_skills", foreignKeySkill);
      }
    }
  }
}

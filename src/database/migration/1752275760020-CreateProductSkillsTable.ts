import {
  MigrationInterface,
  QueryRunner,
  Table,
} from "typeorm";

export class CreateProductSkillsTable1752275760020
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "product_skills",
        columns: [
          { name: "product_id", type: "uuid", isPrimary: true },
          { name: "skill_id", type: "uuid", isPrimary: true },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("product_skills");
  }
}

import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateSkillsTable1750269099560 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "skills",
        columns: [
          { name: "id", type: "uuid", isPrimary: true, isGenerated: true, default: "uuid_generate_v4()" },
          { name: "name", type: "varchar", isUnique: true },
          { name: "slug", type: "varchar",  isUnique: true },
          { name: "description", type: "text", isNullable: true },
          { name: "created_at", type: "timestamp", default: "now()" },
          { name: "updated_at", type: "timestamp", default: "now()", onUpdate: "now()" },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("skills");
  }
}

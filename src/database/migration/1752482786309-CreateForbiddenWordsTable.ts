import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateForbiddenWordsTable1752482786309
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "forbidden_words",
        columns: [
          { name: "id", type: "uuid", isPrimary: true, isGenerated: true, default: "uuid_generate_v4()" },
          { name: "word", type: "varchar", isUnique: true },
          { name: "created_at", type: "timestamp", default: "now()" },
          { name: "updated_at", type: "timestamp", default: "now()", onUpdate: "now()" },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("forbidden_words");
  }
}

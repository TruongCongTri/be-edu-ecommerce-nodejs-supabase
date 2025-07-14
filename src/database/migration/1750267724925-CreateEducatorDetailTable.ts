import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateEducatorDetailTable1750267724925 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "educator_details",
        columns: [
          { name: "id", type: "uuid", isPrimary: true, isGenerated: true, default: "uuid_generate_v4()" },
          { name: "user_id", type: "uuid", isUnique: true },
          { name: "bio", type: "text", isNullable: true },
          { name: 'expertise', type: 'varchar', isNullable: true },
          { name: "created_at", type: "timestamp", default: "now()" },
          { name: "updated_at", type: "timestamp", default: "now()", onUpdate: "now()" },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("educator_details");
  }
}

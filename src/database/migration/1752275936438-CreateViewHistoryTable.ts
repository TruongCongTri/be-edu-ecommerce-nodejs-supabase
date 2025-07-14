import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateViewHistoryTable1752275936438 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "view_history",
        columns: [
          { name: "id", type: "uuid", isPrimary: true, isGenerated: true, default: "uuid_generate_v4()" },
          { name: "user_id", type: "uuid" },
          { name: "product_id", type: "uuid" },
          { name: "viewed_at", type: "timestamp", default: "now()" },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("view_history");
  }
}

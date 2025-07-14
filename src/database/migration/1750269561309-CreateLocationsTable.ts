import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateLocationsTable1750269561309 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "locations",
        columns: [
          { name: "id", type: "uuid", isPrimary: true, isGenerated: true, default: "uuid_generate_v4()" },
          { name: "name", type: "varchar" },
          { name: "code", type: "varchar", isUnique: true,},
          { name: "created_at",  type: "timestamp", default: "now()" },
          { name: "updated_at", type: "timestamp", default: "now()", onUpdate: "now()" },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("locations");
  }
}

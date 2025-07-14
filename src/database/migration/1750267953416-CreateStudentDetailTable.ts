import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateStudentDetailTable1750267953416 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "student_details",
        columns: [
          { name: "id", type: "uuid", isPrimary: true, isGenerated: true, default: "uuid_generate_v4()" },
          { name: "user_id", type: "uuid", isUnique: true },
          { name: "bio", type: "text", isNullable: true },
          { name: "created_at", type: "timestamp", default: "now()" },
          { name: "updated_at", type: "timestamp", default: "now()", onUpdate: "now()" },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("student_details");
  }
}

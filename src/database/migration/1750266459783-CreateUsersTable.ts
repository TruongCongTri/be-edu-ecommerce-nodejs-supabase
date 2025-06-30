import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateUsersTable1750266459783 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "users",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isGenerated: true,
            default: "uuid_generate_v4()",
            // generationStrategy: "uuid",
          },
          {
            name: "full_name",
            type: "varchar",
          },
          {
            name: "email",
            type: "varchar",
            isUnique: true,
          },
          {
            name: "password",
            type: "varchar",
          },
          {
            name: "phone_number",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "address",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "role",
            type: "enum",
            enum: ["job_seeker", "employer", "admin"],
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "now()",
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "now()",
            onUpdate: "now()",
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("users");
  }
}

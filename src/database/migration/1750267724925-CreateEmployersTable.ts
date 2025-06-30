import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateEmployersTable1750267724925 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "employers",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isGenerated: true,
            default: "uuid_generate_v4()",
          },
          {
            name: "user_id",
            type: "uuid",
            isUnique: true,
          },
          {
            name: "company_name",
            type: "varchar",
          },
          {
            name: "slug",
            type: "varchar",
            isUnique: true,
          },
          {
            name: "company_description",
            type: "text",
            isNullable: true,
          },
          {
            name: "company_website",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "company_logo_url",
            type: "varchar",
            isNullable: true,
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
    await queryRunner.dropTable("employers");
  }
}

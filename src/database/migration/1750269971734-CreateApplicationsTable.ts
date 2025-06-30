import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateApplicationsTable1750269971734
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "applications",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isGenerated: true,
            default: "uuid_generate_v4()",
          },
          {
            name: "job_id",
            type: "uuid",
          },
          {
            name: "job_seeker_id",
            type: "uuid",
          },
          {
            name: "cover_letter",
            type: "text",
            isNullable: true,
          },
          {
            name: "status",
            type: "enum",
            enum: ["pending", "reviewed", "accepted", "rejected", "interview"],
            default: `'pending'`,
          },
          {
            name: "applied_at",
            type: "timestamp",
            default: "now()",
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
    await queryRunner.dropTable("applications");
  }
}

import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateJobSeekersTable1750267953416 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "job_seekers",
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
            name: "resume_url",
            type: "varchar",
            isNullable: true,
          },
          // {
          //   name: "skills",
          //   type: "text",
          //   isNullable: true,
          // },
          {
            name: "experience_years",
            type: "int",
            isNullable: true,
          },
          {
            name: "desired_salary",
            type: "decimal",
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
    await queryRunner.dropTable("job_seekers");
  }
}

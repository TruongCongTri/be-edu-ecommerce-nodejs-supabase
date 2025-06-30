import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateJobsTable1750269107948 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "jobs",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isGenerated: true,
            default: "uuid_generate_v4()",
          },
          {
            name: "employer_id",
            type: "uuid",
          },
          {
            name: "category_id",
            type: "uuid",
          },
          {
            name: "title",
            type: "varchar",
          },
          {
            name: "slug",
            type: "varchar",
            isUnique: true,
          },
          {
            name: "description",
            type: "text",
          },
          {
            name: "requirements",
            type: "text",
            isNullable: true,
          },
          //   {
          //     name: "location",
          //     type: "varchar",
          //   },
          {
            name: "salary_min",
            type: "decimal",
            isNullable: true,
          },
          {
            name: "salary_max",
            type: "decimal",
            isNullable: true,
          },
          {
            name: "employment_type",
            type: "enum",
            enum: [
              "full-time",
              "part-time",
              "contract",
              "internship",
              "freelance",
            ],
          },
          {
            name: "experience_level",
            type: "enum",
            enum: ["fresher", "junior", "mid", "senior"],
          },
          {
            name: "is_active",
            type: "boolean",
            default: true,
          },
          {
            name: "posted_at",
            type: "timestamp",
            default: "now()",
          },
          {
            name: "expires_at",
            type: "timestamp",
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
    await queryRunner.dropTable("jobs");
  }
}

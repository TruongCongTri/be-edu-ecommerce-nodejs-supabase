import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AddRelationsToJobSeekersSkillsTable1750297652644
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "job_seekers_skills",
        columns: [
          {
            name: "job_seeker_id",
            type: "uuid",
            isPrimary: true,
          },
          {
            name: "skill_id",
            type: "uuid",
            isPrimary: true,
          },
        ],
        foreignKeys: [
          {
            columnNames: ["job_seeker_id"],
            referencedTableName: "job_seekers",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
          {
            columnNames: ["skill_id"],
            referencedTableName: "skills",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("job_seekers_skills");
  }
}

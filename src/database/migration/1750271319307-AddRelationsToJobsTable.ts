import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";

export class AddRelationsToJobsTable1750271319307
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Foreign key: employer_id → employers.id
    await queryRunner.createForeignKey(
      "jobs",
      new TableForeignKey({
        columnNames: ["employer_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "employers",
        onDelete: "CASCADE",
      })
    );

    // Foreign key: category_id → categories.id
    await queryRunner.createForeignKey(
      "jobs",
      new TableForeignKey({
        columnNames: ["category_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "categories",
        onDelete: "SET NULL",
      })
    );

    // Join table: jobs_skills
    await queryRunner.createTable(
      new Table({
        name: "jobs_skills",
        columns: [
          { name: "job_id", type: "uuid", isPrimary: true },
          { name: "skill_id", type: "uuid", isPrimary: true },
        ],
        foreignKeys: [
          {
            columnNames: ["job_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "jobs",
            onDelete: "CASCADE",
          },
          {
            columnNames: ["skill_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "skills",
            onDelete: "CASCADE",
          },
        ],
      })
    );

    // Join table: jobs_locations
    await queryRunner.createTable(
      new Table({
        name: "jobs_locations",
        columns: [
          { name: "job_id", type: "uuid", isPrimary: true },
          { name: "location_id", type: "uuid", isPrimary: true },
        ],
        foreignKeys: [
          {
            columnNames: ["job_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "jobs",
            onDelete: "CASCADE",
          },
          {
            columnNames: ["location_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "locations",
            onDelete: "CASCADE",
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("jobs_locations");
    await queryRunner.dropTable("jobs_skills");

    const table = await queryRunner.getTable("jobs");
    if (table) {
      const employerFK = table.foreignKeys.find((fk) =>
        fk.columnNames.includes("employer_id")
      );
      const categoryFK = table.foreignKeys.find((fk) =>
        fk.columnNames.includes("category_id")
      );

      if (employerFK) await queryRunner.dropForeignKey("jobs", employerFK);
      if (categoryFK) await queryRunner.dropForeignKey("jobs", categoryFK);
    }
  }
}

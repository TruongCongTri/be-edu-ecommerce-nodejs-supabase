import { MigrationInterface, QueryRunner, TableForeignKey } from "typeorm";

export class AddRelationsToApplicationsTable1750295878068
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createForeignKey(
      "applications",
      new TableForeignKey({
        columnNames: ["job_id"],
        referencedTableName: "jobs",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "applications",
      new TableForeignKey({
        columnNames: ["job_seeker_id"],
        referencedTableName: "job_seekers",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("applications");

    const jobForeignKey = table!.foreignKeys.find((fk) =>
      fk.columnNames.includes("job_id")
    );
    const seekerForeignKey = table!.foreignKeys.find((fk) =>
      fk.columnNames.includes("job_seeker_id")
    );

    if (jobForeignKey) {
      await queryRunner.dropForeignKey("applications", jobForeignKey);
    }
    if (seekerForeignKey) {
      await queryRunner.dropForeignKey("applications", seekerForeignKey);
    }
  }
}

import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddSlugToProductDetailTable1752415295047
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add column
    await queryRunner.addColumn(
      "product_details",
      new TableColumn({
        name: "slug",
        type: "varchar",
        isUnique: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("product_details", "slug");
  }
}

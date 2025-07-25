import {
  MigrationInterface,
  QueryRunner,
  Table,
} from "typeorm";

export class CreateProductDetailTable1752271352190
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "product_details",
        columns: [
          { name: "id", type: "uuid", isPrimary: true, isGenerated: true, default: "uuid_generate_v4()" },
          { name: "product_id", type: "uuid" },
          { name: "title", type: "varchar" },
          { name: "content", type: "text" },
          { name: "video_url", type: "varchar", isNullable: true },
          { name: "order", type: "int" },
          { name: "is_free_preview", type: "boolean", default: false },
          { name: "created_at", type: "timestamp", default: "now()" },
          { name: "updated_at", type: "timestamp", default: "now()", onUpdate: "now()" },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("product_details");
  }
}

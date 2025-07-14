import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateProductsTable1752270790744 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "products",
        columns: [
          { name: "id", type: "uuid", isPrimary: true, isGenerated: true, default: "uuid_generate_v4()" },
          { name: "category_id", type: "uuid", isNullable: true },
          { name: "name", type: "varchar" },
          { name: "slug", type: "varchar", isUnique: true },
          { name: "short_desc", type: "varchar" },
          { name: "long_desc", type: "text" },
          { name: "image_url", type: "varchar" },
          { name: "price", type: "decimal", isNullable: true },
          { name: "is_active", type: "boolean", default: true },
          { name: "created_at", type: "timestamp", default: "now()" },
          { name: "updated_at", type: "timestamp", default: "now()", onUpdate: "now()" },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("products");
  }
}

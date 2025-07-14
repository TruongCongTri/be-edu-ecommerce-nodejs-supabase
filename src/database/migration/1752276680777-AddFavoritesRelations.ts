import { MigrationInterface, QueryRunner, TableForeignKey } from "typeorm";

export class AddFavoritesRelations1752276680777 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createForeignKey(
      "favorites",
      new TableForeignKey({
        columnNames: ["user_id"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "favorites",
      new TableForeignKey({
        columnNames: ["product_id"],
        referencedTableName: "products",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("favorites");
    if (table) {
      const foreignKeyProd = table.foreignKeys.find((fk) =>
        fk.columnNames.includes("product_id")
      );
      if (foreignKeyProd) {
        await queryRunner.dropForeignKey("favorites", foreignKeyProd);
      }

      const foreignKeyUser = table.foreignKeys.find((fk) =>
        fk.columnNames.includes("user_id")
      );
      if (foreignKeyUser) {
        await queryRunner.dropForeignKey("favorites", foreignKeyUser);
      }
    }
  }
}

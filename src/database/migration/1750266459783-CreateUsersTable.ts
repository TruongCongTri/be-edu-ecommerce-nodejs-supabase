import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateUsersTable1750266459783 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "user_role_enum" AS ENUM ('student', 'educator', 'admin')`);

    await queryRunner.createTable(
      new Table({
        name: "users",
        columns: [
          { name: "id", type: "uuid", isPrimary: true, isGenerated: true, default: "uuid_generate_v4()" },
          { name: "full_name", type: "varchar" },
          { name: "email", type: "varchar", isUnique: true },
          { name: "password_hash", type: "varchar" },
          { name: "role", type: '"user_role_enum"', default: `'student'` },
          { name: "created_at", type: "timestamp", default: "now()" },
          { name: "updated_at", type: "timestamp", default: "now()", onUpdate: "now()" },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
    await queryRunner.query(`DROP TYPE "user_role_enum"`);
  }
}

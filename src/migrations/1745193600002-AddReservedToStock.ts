import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReservedToStock1745193600002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "stock" ADD COLUMN IF NOT EXISTS "reserved" bigint NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "stock" DROP COLUMN IF EXISTS "reserved"`);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSoftDeleteToProductAndSku1745193600001
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "sku" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sku" DROP COLUMN IF EXISTS "deletedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN IF EXISTS "deletedAt"`,
    );
  }
}

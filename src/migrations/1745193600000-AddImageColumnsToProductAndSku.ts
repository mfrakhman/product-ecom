import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddImageColumnsToProductAndSku1745193600000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "imageUrl" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "imageObject" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "sku" ADD COLUMN IF NOT EXISTS "imageUrl" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "sku" ADD COLUMN IF NOT EXISTS "imageObject" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sku" DROP COLUMN IF EXISTS "imageObject"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sku" DROP COLUMN IF EXISTS "imageUrl"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN IF EXISTS "imageObject"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN IF EXISTS "imageUrl"`,
    );
  }
}

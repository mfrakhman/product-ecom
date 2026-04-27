import { MigrationInterface, QueryRunner } from 'typeorm';

export class SkuNullableUniqueVariant1745800000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Standard unique index can't handle NULL sizeId (bags have no size).
    // COALESCE replaces NULL with a sentinel UUID so two bag SKUs with the
    // same product+color are correctly rejected as duplicates.
    await queryRunner.query(`
      CREATE UNIQUE INDEX skus_unique_variant
        ON skus (
          product_id,
          color_id,
          COALESCE(size_id, '00000000-0000-0000-0000-000000000000')
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS skus_unique_variant`);
  }
}

import 'reflect-metadata';
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { AppDataSource } from '../data-source';
import { Category } from '../categories/entities/category.entity';
import { Color } from '../colors/entities/color.entity';
import { Size } from '../sizes/entities/size.entity';
import { Product } from '../products/entities/product.entity';
import { ProductColorImage } from '../products/entities/product-color-image.entity';
import { Sku } from '../skus/entities/sku.entity';
import { Client as MinioClient } from 'minio';

// ── Config ────────────────────────────────────────────────────────────────────

// When run in container: docker cp ~/mockups product-service:/app/mockups
// Override with MOCKUPS_DIR env var for local use
const MOCKUPS_DIR = process.env.MOCKUPS_DIR ?? '/app/mockups';
const DEFAULT_STOCK = 50;
const APPAREL_SIZES = ['s', 'm', 'l', 'xl'];

// ── Color definitions ─────────────────────────────────────────────────────────

const COLORS = [
  { name: 'Black',          slug: 'black',          hex: '#1C1C1C' },
  { name: 'Navy',           slug: 'navy',            hex: '#1F3A5F' },
  { name: 'White',          slug: 'white',           hex: '#F8F8F8' },
  { name: 'Sand',           slug: 'sand',            hex: '#C9B79A' },
  { name: 'Olive',          slug: 'olive',           hex: '#4A5240' },
  { name: 'Charcoal',       slug: 'charcoal',        hex: '#5C5851' },
  { name: 'Dark Brown',     slug: 'dark-brown',      hex: '#3D3424' },
  { name: 'Indigo',         slug: 'indigo',          hex: '#3D4F7C' },
  { name: 'Misty Grey',     slug: 'misty-grey',      hex: '#B0B0B0' },
  { name: 'Brown',          slug: 'brown',           hex: '#6B4226' },
  { name: 'Beige',          slug: 'beige',           hex: '#E8D5B7' },
  { name: 'Ecru',           slug: 'ecru',            hex: '#F5F0E8' },
  { name: 'Dark Olive',     slug: 'dark-olive',      hex: '#3C3A2E' },
  { name: 'Basalt Grey',    slug: 'basalt-grey',     hex: '#6E6B65' },
  { name: 'Taupe',          slug: 'taupe',           hex: '#8B7B6B' },
  { name: 'Classic Navy',   slug: 'classic-navy',    hex: '#1B2A4A' },
  { name: 'Aura Blue',      slug: 'aura-blue',       hex: '#6CA0C8' },
  { name: 'Ochre',          slug: 'ochre',           hex: '#CC7722' },
  { name: 'Wine',           slug: 'wine',            hex: '#7B2D42' },
  { name: 'Dusty Green',    slug: 'dusty-green',     hex: '#7B9E87' },
  { name: 'Light Grey',     slug: 'lt-grey',         hex: '#C8C8C8' },
  { name: 'Dark Grey',      slug: 'dark-grey',       hex: '#555555' },
  { name: 'Grey',           slug: 'grey',            hex: '#9E9E9E' },
  { name: 'Oat',            slug: 'oat',             hex: '#D9C9A8' },
  { name: 'Misty Blue',     slug: 'misty-blue',      hex: '#8FAFC0' },
  { name: 'Misty Green',    slug: 'misty-green',     hex: '#8FA89A' },
  { name: 'Misty Navy',     slug: 'misty-navy',      hex: '#4A5F7A' },
  { name: 'Coffee Brown',   slug: 'coffee-brown',    hex: '#6F4E37' },
  { name: 'Ivory',          slug: 'ivory',           hex: '#F5F5DC' },
  { name: 'Light Blue',     slug: 'lt-blue',         hex: '#8BBCD4' },
  { name: 'Medium Blue',    slug: 'med-blue',        hex: '#4A7DB5' },
  { name: 'Sustained Grey', slug: 'sustained-grey',  hex: '#7A7A7A' },
  { name: 'Dusty Blue',     slug: 'dusty-blue',      hex: '#7B99B5' },
  { name: 'Sage',           slug: 'sage',            hex: '#8FAF8F' },
];

// ── Category mapping ──────────────────────────────────────────────────────────

const CATEGORY_SLUG_MAP: Record<string, string> = {
  't-shirt': 'mens-t-shirts',
  'bags':    'mens-bags',
  'outwear': 'mens-jackets',
  'pants':   'mens-trousers',
};

const SIZEGROUP_MAP: Record<string, string | null> = {
  't-shirt': 'apparel',
  'bags':    null,
  'outwear': 'apparel',
  'pants':   'apparel',
};

// ── CSV parsing ───────────────────────────────────────────────────────────────

interface CsvRow {
  name: string;
  price: number;
  handle: string;
  imageCount: number;
  category: string;
  modelCode: string;
  colorSlug: string;
  productBaseSlug: string;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let inQuote = false;
  let current = '';
  for (const ch of line) {
    if (ch === '"') { inQuote = !inQuote; }
    else if (ch === ',' && !inQuote) { result.push(current); current = ''; }
    else { current += ch; }
  }
  result.push(current);
  return result;
}

function parsePrice(raw: string): number {
  return parseInt(raw.replace(/[^0-9]/g, ''), 10);
}

function parseHandle(handle: string): { modelCode: string; colorSlug: string; productBaseSlug: string } | null {
  const match = handle.match(/^(.+)-(\d{2}[a-z]\d{3})-(.+)$/);
  if (!match) return null;
  return { productBaseSlug: match[1], modelCode: match[2], colorSlug: match[3] };
}

function parseCsv(filePath: string): CsvRow[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n').slice(1);
  const rows: CsvRow[] = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    const cols = parseCsvLine(line);
    const [name, , priceRaw, handle, imageCountRaw, category] = cols;
    const parsed = parseHandle(handle);
    if (!parsed) { console.warn(`Skipping unparseable handle: ${handle}`); continue; }
    rows.push({
      name,
      price: parsePrice(priceRaw),
      handle,
      imageCount: parseInt(imageCountRaw, 10),
      category: category.trim(),
      ...parsed,
    });
  }
  return rows;
}

// ── MinIO client ──────────────────────────────────────────────────────────────

function createMinioClient(): MinioClient {
  return new MinioClient({
    endPoint:  process.env.MINIO_ENDPOINT  ?? 'localhost',
    port:      Number(process.env.MINIO_PORT) || 9000,
    useSSL:    process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY ?? 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY ?? 'minioadmin',
  });
}

function minioPublicUrl(objectName: string): string {
  const publicBase = process.env.MINIO_PUBLIC_URL ?? 'http://localhost:9000';
  const bucket     = process.env.MINIO_BUCKET ?? 'product-service';
  return `${publicBase}/${bucket}/${objectName}`;
}

async function uploadImage(
  minio: MinioClient,
  bucket: string,
  objectName: string,
  filePath: string,
): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  await minio.putObject(bucket, objectName, buffer, buffer.length, { 'Content-Type': 'image/jpeg' });
  return minioPublicUrl(objectName);
}

// ── Seed helpers ──────────────────────────────────────────────────────────────

async function upsertColors() {
  const repo = AppDataSource.getRepository(Color);
  for (const c of COLORS) {
    await repo.createQueryBuilder().insert().into(Color).values(c).orIgnore().execute();
  }
  console.log(`  Colors: ensured ${COLORS.length} entries`);
}

async function ensureTShirtsCategory() {
  const repo = AppDataSource.getRepository(Category);
  const men = await repo.findOneBy({ slug: 'men' });
  if (!men) throw new Error('Men category not found — run base seed first');
  const existing = await repo.findOneBy({ slug: 'mens-t-shirts' });
  if (!existing) {
    await repo.createQueryBuilder()
      .insert().into(Category)
      .values({ name: 'T-Shirts', slug: 'mens-t-shirts', parentId: men.id, displayOrder: 5 })
      .orIgnore().execute();
    console.log('  Created category: Men > T-Shirts');
  }
}

// ── Main seeder ───────────────────────────────────────────────────────────────

async function seedProducts() {
  const csvPath = path.join(MOCKUPS_DIR, 'products.csv');
  if (!fs.existsSync(csvPath)) throw new Error(`CSV not found: ${csvPath}`);

  const LIMITS: Record<string, number> = { 't-shirt': 15 };

  const allRows = parseCsv(csvPath);
  const counts: Record<string, number> = {};
  const rows = allRows.filter(r => {
    counts[r.category] = (counts[r.category] ?? 0) + 1;
    const limit = LIMITS[r.category];
    return !limit || counts[r.category] <= limit;
  });
  console.log(`Seeding ${rows.length} products (15 t-shirts + all from other categories)`);

  await AppDataSource.initialize();
  console.log('DB connected');

  const minio = createMinioClient();
  const bucket = process.env.MINIO_BUCKET ?? 'product-service';
  const bucketExists = await minio.bucketExists(bucket);
  if (!bucketExists) await minio.makeBucket(bucket);

  await upsertColors();
  await ensureTShirtsCategory();

  // Load lookup maps
  const colorBySlug = new Map(
    (await AppDataSource.getRepository(Color).find()).map(c => [c.slug, c])
  );
  const categoryBySlug = new Map(
    (await AppDataSource.getRepository(Category).find()).map(c => [c.slug, c])
  );
  const sizeBySlug = new Map(
    (await AppDataSource.getRepository(Size).find()).map(s => [s.slug, s])
  );

  const productRepo    = AppDataSource.getRepository(Product);
  const skuRepo        = AppDataSource.getRepository(Sku);
  const imageRepo      = AppDataSource.getRepository(ProductColorImage);

  let created = 0, skipped = 0, failed = 0;

  for (const row of rows) {
    const catSlug = CATEGORY_SLUG_MAP[row.category];
    if (!catSlug) { console.warn(`  Unknown category: ${row.category}`); failed++; continue; }

    const category = categoryBySlug.get(catSlug);
    if (!category) { console.warn(`  Category not in DB: ${catSlug}`); failed++; continue; }

    const color = colorBySlug.get(row.colorSlug);
    if (!color) { console.warn(`  Color not in DB: ${row.colorSlug} (${row.handle})`); failed++; continue; }

    // Idempotency: skip if product slug already exists
    const existing = await productRepo.findOneBy({ slug: row.handle });
    if (existing) { skipped++; continue; }

    const sizeGroup = SIZEGROUP_MAP[row.category] ?? null;

    // Create product
    const product = productRepo.create({
      name: row.name,
      slug: row.handle,
      description: null,
      categoryId: category.id,
      sizeGroup,
    });
    const savedProduct = await productRepo.save(product);

    // Create SKUs
    const sizeSlugs = sizeGroup === 'apparel' ? APPAREL_SIZES : [null];

    for (const sizeSlug of sizeSlugs) {
      const size = sizeSlug ? sizeBySlug.get(sizeSlug) : null;
      if (sizeSlug && !size) { console.warn(`  Size not found: ${sizeSlug}`); continue; }

      const skuCode = sizeSlug ? `${row.modelCode}-${sizeSlug}` : row.modelCode;

      const sku = skuRepo.create({
        skuCode,
        productId: savedProduct.id,
        colorId: color.id,
        sizeId: size?.id ?? null,
        price: row.price,
        compareAt: null,
        isActive: true,
      });
      const savedSku = await skuRepo.save(sku);

      await AppDataSource.query(
        `INSERT INTO stock(id, amount, reserved, sku_id) VALUES (gen_random_uuid(), $1, 0, $2)`,
        [DEFAULT_STOCK, savedSku.id],
      );
    }

    // Upload images
    const imageFolder = path.join(MOCKUPS_DIR, row.category, row.handle);
    if (fs.existsSync(imageFolder)) {
      const imageFiles = fs.readdirSync(imageFolder)
        .filter(f => /\.(jpg|jpeg|png)$/i.test(f))
        .sort();

      for (let i = 0; i < imageFiles.length; i++) {
        const filePath = path.join(imageFolder, imageFiles[i]);
        const objectName = `products/${savedProduct.id}/colors/${color.id}/${Date.now()}-${i + 1}.jpg`;
        try {
          const imageUrl = await uploadImage(minio, bucket, objectName, filePath);
          const imgRecord = imageRepo.create({
            productId: savedProduct.id,
            colorId: color.id,
            imageUrl,
            imageObject: objectName,
            altText: null,
            displayOrder: i,
          });
          await imageRepo.save(imgRecord);
        } catch (err) {
          console.warn(`  Image upload failed: ${filePath}`, err);
        }
      }
    } else {
      console.warn(`  Image folder not found: ${imageFolder}`);
    }

    console.log(`  [${++created}/${rows.length}] ${row.name} — ${row.colorSlug}`);
  }

  await AppDataSource.destroy();
  console.log(`\nDone. Created: ${created}, Skipped: ${skipped}, Failed: ${failed}`);
}

seedProducts().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});

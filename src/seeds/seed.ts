import 'dotenv/config';
import { AppDataSource } from '../data-source';
import { Category } from '../categories/entities/category.entity';
import { Color } from '../colors/entities/color.entity';
import { Size } from '../sizes/entities/size.entity';

async function seed() {
  await AppDataSource.initialize();
  console.log('Connected to database');

  await seedColors();
  await seedSizes();
  await seedCategories();

  await AppDataSource.destroy();
  console.log('Seeding complete');
}

// ── Colors ───────────────────────────────────────────────────────────────────

async function seedColors() {
  const repo = AppDataSource.getRepository(Color);

  const colors = [
    { name: 'Black',      slug: 'black',      hex: '#1F1B14', displayOrder: 0 },
    { name: 'Camel',      slug: 'camel',      hex: '#B89968', displayOrder: 1 },
    { name: 'Cream',      slug: 'cream',      hex: '#F1EADD', displayOrder: 2 },
    { name: 'Charcoal',   slug: 'charcoal',   hex: '#5C5851', displayOrder: 3 },
    { name: 'Dark Brown', slug: 'dark-brown', hex: '#3D3424', displayOrder: 4 },
    { name: 'Burgundy',   slug: 'burgundy',   hex: '#9C2E1F', displayOrder: 5 },
    { name: 'Navy',       slug: 'navy',       hex: '#2F4858', displayOrder: 6 },
    { name: 'White',      slug: 'white',      hex: '#FFFFFF', displayOrder: 7 },
    { name: 'Sand',       slug: 'sand',       hex: '#C9B79A', displayOrder: 8 },
    { name: 'Olive',      slug: 'olive',      hex: '#4A5240', displayOrder: 9 },
  ];

  for (const color of colors) {
    await repo
      .createQueryBuilder()
      .insert()
      .into(Color)
      .values(color)
      .orIgnore()
      .execute();
  }

  console.log(`Seeded ${colors.length} colors`);
}

// ── Sizes ────────────────────────────────────────────────────────────────────

async function seedSizes() {
  const repo = AppDataSource.getRepository(Size);

  const apparelNames = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const pantsWaists  = Array.from({ length: 13 }, (_, i) => 26 + i * 2); // 26,28…50
  const shoeEUs      = Array.from({ length: 13 }, (_, i) => 35 + i);     // 35…47

  const sizes = [
    ...apparelNames.map((n, i) => ({ sizeGroup: 'apparel',     name: n,         slug: n.toLowerCase(), sortOrder: i + 1 })),
    ...pantsWaists.map((w, i)  => ({ sizeGroup: 'pants',       name: String(w), slug: `w${w}`,         sortOrder: i + 1 })),
    ...shoeEUs.map((e, i)      => ({ sizeGroup: 'shoes',       name: String(e), slug: `eu${e}`,        sortOrder: i + 1 })),
    { sizeGroup: 'accessories', name: 'OS', slug: 'os', sortOrder: 1 },
  ];

  for (const size of sizes) {
    await repo
      .createQueryBuilder()
      .insert()
      .into(Size)
      .values(size)
      .orIgnore()
      .execute();
  }

  console.log(`Seeded ${sizes.length} sizes`);
}

// ── Categories ───────────────────────────────────────────────────────────────

async function seedCategories() {
  const repo = AppDataSource.getRepository(Category);

  const insert = async (data: Partial<Category>) => {
    await repo
      .createQueryBuilder()
      .insert()
      .into(Category)
      .values(data)
      .orIgnore()
      .execute();
    return repo.findOneBy({ slug: data.slug! });
  };

  // ── Level 0: Gender ──────────────────────────────────────────────
  const women = await insert({ name: 'Women', slug: 'women', displayOrder: 0 });
  const men   = await insert({ name: 'Men',   slug: 'men',   displayOrder: 1 });

  // ── Level 1: Collections ─────────────────────────────────────────

  // Women
  const wOuterwear    = await insert({ name: 'Outerwear',    slug: 'womens-outerwear',    parentId: women!.id, displayOrder: 0 });
  const wKnitwear     = await insert({ name: 'Knitwear',     slug: 'womens-knitwear',     parentId: women!.id, displayOrder: 1 });
  const wDenim        = await insert({ name: 'Denim',        slug: 'womens-denim',        parentId: women!.id, displayOrder: 2 });
  const wTrousers     = await insert({ name: 'Trousers',     slug: 'womens-trousers',     parentId: women!.id, displayOrder: 3 });
  const wBags         = await insert({ name: 'Bags',         slug: 'womens-bags',         parentId: women!.id, displayOrder: 4 });
  await insert({ name: 'Accessories',  slug: 'womens-accessories',  parentId: women!.id, displayOrder: 5 });
  await insert({ name: 'Shoes',        slug: 'womens-shoes',        parentId: women!.id, displayOrder: 6 });

  // Men
  const mOuterwear    = await insert({ name: 'Outerwear',    slug: 'mens-outerwear',      parentId: men!.id, displayOrder: 0 });
  const mKnitwear     = await insert({ name: 'Knitwear',     slug: 'mens-knitwear',       parentId: men!.id, displayOrder: 1 });
  const mTrousers     = await insert({ name: 'Trousers',     slug: 'mens-trousers',       parentId: men!.id, displayOrder: 2 });
  const mBags         = await insert({ name: 'Bags',         slug: 'mens-bags',           parentId: men!.id, displayOrder: 3 });
  await insert({ name: 'Shoes',        slug: 'mens-shoes',          parentId: men!.id, displayOrder: 4 });

  // ── Level 2: Types ───────────────────────────────────────────────

  // Women's Outerwear
  await insert({ name: 'Coats',    slug: 'womens-coats',    parentId: wOuterwear!.id,  displayOrder: 0 });
  await insert({ name: 'Trenches', slug: 'womens-trenches', parentId: wOuterwear!.id,  displayOrder: 1 });
  await insert({ name: 'Blazers',  slug: 'womens-blazers',  parentId: wOuterwear!.id,  displayOrder: 2 });
  await insert({ name: 'Jackets',  slug: 'womens-jackets',  parentId: wOuterwear!.id,  displayOrder: 3 });
  await insert({ name: 'Capes',    slug: 'womens-capes',    parentId: wOuterwear!.id,  displayOrder: 4 });

  // Women's Knitwear
  await insert({ name: 'Sweaters',  slug: 'womens-sweaters',  parentId: wKnitwear!.id, displayOrder: 0 });
  await insert({ name: 'Cardigans', slug: 'womens-cardigans', parentId: wKnitwear!.id, displayOrder: 1 });

  // Men's Outerwear
  await insert({ name: 'Coats',    slug: 'mens-coats',    parentId: mOuterwear!.id, displayOrder: 0 });
  await insert({ name: 'Blazers',  slug: 'mens-blazers',  parentId: mOuterwear!.id, displayOrder: 1 });
  await insert({ name: 'Jackets',  slug: 'mens-jackets',  parentId: mOuterwear!.id, displayOrder: 2 });

  // Men's Knitwear
  await insert({ name: 'Sweaters',  slug: 'mens-sweaters',  parentId: mKnitwear!.id, displayOrder: 0 });
  await insert({ name: 'Cardigans', slug: 'mens-cardigans', parentId: mKnitwear!.id, displayOrder: 1 });

  console.log('Seeded categories');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

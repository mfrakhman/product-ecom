import { AppDataSource } from '../data-source';
import { Category } from '../categories/entities/category.entity';
import { Gender } from '../genders/entities/gender.entity';
import { CategoryGroup } from '../category-groups/entities/category-group.entity';
import { Color } from '../colors/entities/color.entity';
import { Size } from '../sizes/entities/size.entity';

async function seed() {
  await AppDataSource.initialize();
  console.log('Connected to database');

  await seedColors();
  await seedSizes();
  await seedGenders();
  await seedCategoryGroups();
  await seedCategories();

  await AppDataSource.destroy();
  console.log('Seeding complete');
}

// ── Colors ───────────────────────────────────────────────────────────────────

async function seedColors() {
  const repo = AppDataSource.getRepository(Color);

  const colors = [
    { name: 'Black',      slug: 'black',      hex: '#1C1C1C', displayOrder: 0 },
    { name: 'Navy',       slug: 'navy',       hex: '#1F3A5F', displayOrder: 1 },
    { name: 'White',      slug: 'white',      hex: '#F8F8F8', displayOrder: 2 },
    { name: 'Sand',       slug: 'sand',       hex: '#C9B79A', displayOrder: 3 },
    { name: 'Olive',      slug: 'olive',      hex: '#4A5240', displayOrder: 4 },
    { name: 'Charcoal',   slug: 'charcoal',   hex: '#5C5851', displayOrder: 5 },
    { name: 'Dark Brown', slug: 'dark-brown', hex: '#3D3424', displayOrder: 6 },
  ];

  for (const color of colors) {
    await repo.createQueryBuilder().insert().into(Color).values(color).orIgnore().execute();
  }

  console.log(`Seeded ${colors.length} colors`);
}

// ── Sizes ────────────────────────────────────────────────────────────────────

async function seedSizes() {
  const repo = AppDataSource.getRepository(Size);

  const apparelNames = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const pantsWaists  = Array.from({ length: 13 }, (_, i) => 26 + i * 2);
  const shoeEUs      = Array.from({ length: 13 }, (_, i) => 35 + i);

  const sizes = [
    ...apparelNames.map((n, i) => ({ sizeGroup: 'apparel',     name: n,         slug: n.toLowerCase(), sortOrder: i + 1 })),
    ...pantsWaists.map((w, i)  => ({ sizeGroup: 'pants',       name: String(w), slug: `w${w}`,         sortOrder: i + 1 })),
    ...shoeEUs.map((e, i)      => ({ sizeGroup: 'shoes',       name: String(e), slug: `eu${e}`,        sortOrder: i + 1 })),
    { sizeGroup: 'accessories', name: 'OS', slug: 'os', sortOrder: 1 },
  ];

  for (const size of sizes) {
    await repo.createQueryBuilder().insert().into(Size).values(size).orIgnore().execute();
  }

  console.log(`Seeded ${sizes.length} sizes`);
}

// ── Genders ──────────────────────────────────────────────────────────────────

async function seedGenders() {
  const repo = AppDataSource.getRepository(Gender);

  const genders = [
    { name: 'Men',    slug: 'men',    displayOrder: 1 },
    { name: 'Women',  slug: 'women',  displayOrder: 2 },
    { name: 'Unisex', slug: 'unisex', displayOrder: 3 },
  ];

  for (const g of genders) {
    await repo.createQueryBuilder().insert().into(Gender).values(g).orIgnore().execute();
  }

  console.log(`Seeded ${genders.length} genders`);
}

// ── Category Groups ───────────────────────────────────────────────────────────

async function seedCategoryGroups() {
  const repo = AppDataSource.getRepository(CategoryGroup);

  const groups = [
    { name: 'Top',        slug: 'top',        displayOrder: 1 },
    { name: 'Bottom',     slug: 'bottom',     displayOrder: 2 },
    { name: 'Outerwear',  slug: 'outerwear',  displayOrder: 3 },
    { name: 'Shoes',      slug: 'shoes',      displayOrder: 4 },
    { name: 'Accessories',slug: 'accessories',displayOrder: 5 },
    { name: 'Underwear',  slug: 'underwear',  displayOrder: 6 },
  ];

  for (const g of groups) {
    await repo.createQueryBuilder().insert().into(CategoryGroup).values(g).orIgnore().execute();
  }

  console.log(`Seeded ${groups.length} category groups`);
}

// ── Categories ───────────────────────────────────────────────────────────────

async function seedCategories() {
  const genderRepo = AppDataSource.getRepository(Gender);
  const groupRepo  = AppDataSource.getRepository(CategoryGroup);
  const catRepo    = AppDataSource.getRepository(Category);

  const genderBySlug = new Map((await genderRepo.find()).map(g => [g.slug, g]));
  const groupBySlug  = new Map((await groupRepo.find()).map(g => [g.slug, g]));

  const categories = [
    // ── Men · Top ────────────────────────────────────────────────────
    { name: 'T-Shirts',  slug: 'mens-t-shirts',  gender: 'men', group: 'top', displayOrder: 1 },
    { name: 'Shirts',    slug: 'mens-shirts',    gender: 'men', group: 'top', displayOrder: 2 },
    { name: 'Polos',     slug: 'mens-polos',     gender: 'men', group: 'top', displayOrder: 3 },
    { name: 'Hoodies',   slug: 'mens-hoodies',   gender: 'men', group: 'top', displayOrder: 4 },
    { name: 'Sweaters',  slug: 'mens-sweaters',  gender: 'men', group: 'top', displayOrder: 5 },
    { name: 'Tank Tops', slug: 'mens-tank-tops', gender: 'men', group: 'top', displayOrder: 6 },

    // ── Men · Bottom ─────────────────────────────────────────────────
    { name: 'Trousers',  slug: 'mens-trousers',  gender: 'men', group: 'bottom', displayOrder: 1 },
    { name: 'Jeans',     slug: 'mens-jeans',     gender: 'men', group: 'bottom', displayOrder: 2 },
    { name: 'Shorts',    slug: 'mens-shorts',    gender: 'men', group: 'bottom', displayOrder: 3 },
    { name: 'Joggers',   slug: 'mens-joggers',   gender: 'men', group: 'bottom', displayOrder: 4 },

    // ── Men · Outerwear ──────────────────────────────────────────────
    { name: 'Jackets',   slug: 'mens-jackets',   gender: 'men', group: 'outerwear', displayOrder: 1 },
    { name: 'Coats',     slug: 'mens-coats',     gender: 'men', group: 'outerwear', displayOrder: 2 },
    { name: 'Blazers',   slug: 'mens-blazers',   gender: 'men', group: 'outerwear', displayOrder: 3 },
    { name: 'Vests',     slug: 'mens-vests',     gender: 'men', group: 'outerwear', displayOrder: 4 },

    // ── Men · Shoes ──────────────────────────────────────────────────
    { name: 'Sneakers',  slug: 'mens-sneakers',  gender: 'men', group: 'shoes', displayOrder: 1 },
    { name: 'Boots',     slug: 'mens-boots',     gender: 'men', group: 'shoes', displayOrder: 2 },
    { name: 'Loafers',   slug: 'mens-loafers',   gender: 'men', group: 'shoes', displayOrder: 3 },
    { name: 'Sandals',   slug: 'mens-sandals',   gender: 'men', group: 'shoes', displayOrder: 4 },

    // ── Men · Underwear ──────────────────────────────────────────────
    { name: 'Underwear', slug: 'mens-underwear', gender: 'men', group: 'underwear', displayOrder: 1 },
    { name: 'Socks',     slug: 'mens-socks',     gender: 'men', group: 'underwear', displayOrder: 2 },

    // ── Women · Top ──────────────────────────────────────────────────
    { name: 'T-Shirts',  slug: 'womens-t-shirts',  gender: 'women', group: 'top', displayOrder: 1 },
    { name: 'Blouses',   slug: 'womens-blouses',   gender: 'women', group: 'top', displayOrder: 2 },
    { name: 'Sweaters',  slug: 'womens-sweaters',  gender: 'women', group: 'top', displayOrder: 3 },
    { name: 'Hoodies',   slug: 'womens-hoodies',   gender: 'women', group: 'top', displayOrder: 4 },
    { name: 'Tank Tops', slug: 'womens-tank-tops', gender: 'women', group: 'top', displayOrder: 5 },

    // ── Women · Bottom ───────────────────────────────────────────────
    { name: 'Trousers',  slug: 'womens-trousers',  gender: 'women', group: 'bottom', displayOrder: 1 },
    { name: 'Jeans',     slug: 'womens-jeans',     gender: 'women', group: 'bottom', displayOrder: 2 },
    { name: 'Skirts',    slug: 'womens-skirts',    gender: 'women', group: 'bottom', displayOrder: 3 },
    { name: 'Shorts',    slug: 'womens-shorts',    gender: 'women', group: 'bottom', displayOrder: 4 },
    { name: 'Leggings',  slug: 'womens-leggings',  gender: 'women', group: 'bottom', displayOrder: 5 },

    // ── Women · Outerwear ────────────────────────────────────────────
    { name: 'Jackets',   slug: 'womens-jackets',   gender: 'women', group: 'outerwear', displayOrder: 1 },
    { name: 'Coats',     slug: 'womens-coats',     gender: 'women', group: 'outerwear', displayOrder: 2 },
    { name: 'Blazers',   slug: 'womens-blazers',   gender: 'women', group: 'outerwear', displayOrder: 3 },
    { name: 'Vests',     slug: 'womens-vests',     gender: 'women', group: 'outerwear', displayOrder: 4 },

    // ── Women · Shoes ────────────────────────────────────────────────
    { name: 'Sneakers',  slug: 'womens-sneakers',  gender: 'women', group: 'shoes', displayOrder: 1 },
    { name: 'Boots',     slug: 'womens-boots',     gender: 'women', group: 'shoes', displayOrder: 2 },
    { name: 'Heels',     slug: 'womens-heels',     gender: 'women', group: 'shoes', displayOrder: 3 },
    { name: 'Sandals',   slug: 'womens-sandals',   gender: 'women', group: 'shoes', displayOrder: 4 },
    { name: 'Flats',     slug: 'womens-flats',     gender: 'women', group: 'shoes', displayOrder: 5 },

    // ── Women · Underwear ────────────────────────────────────────────
    { name: 'Underwear', slug: 'womens-underwear', gender: 'women', group: 'underwear', displayOrder: 1 },
    { name: 'Socks',     slug: 'womens-socks',     gender: 'women', group: 'underwear', displayOrder: 2 },

    // ── Unisex · Accessories ─────────────────────────────────────────
    { name: 'Bags',      slug: 'bags',      gender: 'unisex', group: 'accessories', displayOrder: 1 },
    { name: 'Backpacks', slug: 'backpacks', gender: 'unisex', group: 'accessories', displayOrder: 2 },
    { name: 'Wallets',   slug: 'wallets',   gender: 'unisex', group: 'accessories', displayOrder: 3 },
    { name: 'Belts',     slug: 'belts',     gender: 'unisex', group: 'accessories', displayOrder: 4 },
    { name: 'Hats',      slug: 'hats',      gender: 'unisex', group: 'accessories', displayOrder: 5 },
    { name: 'Scarves',   slug: 'scarves',   gender: 'unisex', group: 'accessories', displayOrder: 6 },
  ];

  for (const cat of categories) {
    const gender = genderBySlug.get(cat.gender);
    const group  = groupBySlug.get(cat.group);
    if (!gender || !group) {
      console.warn(`  Skipping ${cat.slug} — gender/group not found`);
      continue;
    }
    await catRepo
      .createQueryBuilder()
      .insert()
      .into(Category)
      .values({ name: cat.name, slug: cat.slug, genderId: gender.id, groupId: group.id, displayOrder: cat.displayOrder })
      .orIgnore()
      .execute();
  }

  console.log(`Seeded ${categories.length} categories`);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

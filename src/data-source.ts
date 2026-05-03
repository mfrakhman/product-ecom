import { DataSource } from 'typeorm';
import { Product } from './products/entities/product.entity';
import { ProductColorImage } from './products/entities/product-color-image.entity';
import { Sku } from './skus/entities/sku.entity';
import { Stock } from './stocks/entities/stock.entity';
import { Category } from './categories/entities/category.entity';
import { Gender } from './genders/entities/gender.entity';
import { CategoryGroup } from './category-groups/entities/category-group.entity';
import { Color } from './colors/entities/color.entity';
import { Size } from './sizes/entities/size.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASS ?? 'postgres',
  database: process.env.DB_NAME ?? 'microserv_db',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  entities: [Product, ProductColorImage, Sku, Stock, Category, Gender, CategoryGroup, Color, Size],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  synchronize: false,
});

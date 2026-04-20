import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Product } from './products/entities/product.entity';
import { Sku } from './skus/entities/sku.entity';
import { Stock } from './stocks/entities/stock.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASS ?? 'postgres',
  database: process.env.DB_NAME ?? 'microserv_db',
  entities: [Product, Sku, Stock],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  synchronize: false,
});

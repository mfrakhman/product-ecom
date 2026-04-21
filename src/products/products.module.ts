import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductsRepository } from './repositories/products.repository';
import { Product } from './entities/product.entity';
import { Sku } from '../skus/entities/sku.entity';
import { SkusRepository } from '../skus/repositories/skus.repository';
import { StocksModule } from '../stocks/stocks.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Sku]), StorageModule, StocksModule],
  controllers: [ProductsController],
  providers: [ProductsService, ProductsRepository, SkusRepository],
  exports: [ProductsRepository],
})
export class ProductsModule {}

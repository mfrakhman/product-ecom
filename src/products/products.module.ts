import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductsRepository } from './repositories/products.repository';
import { Product } from './entities/product.entity';
import { ProductColorImage } from './entities/product-color-image.entity';
import { Sku } from '../skus/entities/sku.entity';
import { SkusRepository } from '../skus/repositories/skus.repository';
import { StocksModule } from '../stocks/stocks.module';
import { StorageModule } from '../storage/storage.module';
import { Color } from '../colors/entities/color.entity';
import { ProductColorImagesService } from './product-color-images/product-color-images.service';
import { ProductColorImagesController } from './product-color-images/product-color-images.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductColorImage, Sku, Color]),
    StocksModule,
    StorageModule,
  ],
  controllers: [ProductsController, ProductColorImagesController],
  providers: [
    ProductsService,
    ProductsRepository,
    SkusRepository,
    ProductColorImagesService,
  ],
  exports: [ProductsRepository],
})
export class ProductsModule {}

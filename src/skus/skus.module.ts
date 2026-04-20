import { Module } from '@nestjs/common';
import { SkusService } from './skus.service';
import { SkusController } from './skus.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sku } from './entities/sku.entity';
import { ProductsModule } from '../products/products.module';
import { SkusRepository } from './repositories/skus.repository';
import { StocksModule } from '../stocks/stocks.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [TypeOrmModule.forFeature([Sku]), ProductsModule, StocksModule, StorageModule],
  providers: [SkusService, SkusRepository],
  controllers: [SkusController],
})
export class SkusModule {}

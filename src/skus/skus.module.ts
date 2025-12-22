import { Module, forwardRef } from '@nestjs/common';
import { SkusService } from './skus.service';
import { SkusController } from './skus.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sku } from './entities/sku.entity';
import { ProductsModule } from '../products/products.module';
import { SkusRepository } from './repositories/skus.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Sku]), ProductsModule],
  providers: [SkusService, SkusRepository],
  controllers: [SkusController],
})
export class SkusModule {}

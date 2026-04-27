import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Size } from './entities/size.entity';
import { SizesRepository } from './repositories/sizes.repository';
import { SizesService } from './sizes.service';
import { SizesController } from './sizes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Size])],
  controllers: [SizesController],
  providers: [SizesService, SizesRepository],
  exports: [SizesRepository],
})
export class SizesModule {}

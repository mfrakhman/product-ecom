import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Color } from './entities/color.entity';
import { ColorsRepository } from './repositories/colors.repository';
import { ColorsService } from './colors.service';
import { ColorsController } from './colors.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Color])],
  controllers: [ColorsController],
  providers: [ColorsService, ColorsRepository],
  exports: [ColorsRepository],
})
export class ColorsModule {}

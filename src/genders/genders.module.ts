import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gender } from './entities/gender.entity';
import { GendersRepository } from './repositories/genders.repository';
import { GendersService } from './genders.service';
import { GendersController } from './genders.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Gender])],
  controllers: [GendersController],
  providers: [GendersService, GendersRepository],
  exports: [GendersRepository],
})
export class GendersModule {}

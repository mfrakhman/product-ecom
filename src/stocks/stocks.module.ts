import { Module } from '@nestjs/common';
import { StocksService } from './stocks.service';
import { StocksController } from './stocks.controller';
import { Type } from 'class-transformer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stock } from './entities/stock.entity';
import { StocksRepository } from './repositories/stock.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Stock])],
  providers: [StocksService, StocksRepository],
  controllers: [StocksController],
  exports: [StocksService],
})
export class StocksModule {}

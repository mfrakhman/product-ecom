import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StocksRepository } from './repositories/stock.repository';
import { EntityManager, Not } from 'typeorm';
import { Stock } from './entities/stock.entity';

@Injectable()
export class StocksService {
  constructor(
    private readonly stocksRepository: StocksRepository,
    private readonly skusRepository: StocksRepository,
  ) {}

  async initializeStock(amount: number, skuId: string, manager: EntityManager) {
    if (amount < 0) {
      throw new BadRequestException('Stock amount cannot be negative');
    }

    const stock = manager.create(Stock, {
      amount: amount,
      sku: { id: skuId },
    });
    return await manager.save(stock);
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StocksRepository } from './repositories/stock.repository';
import { EntityManager, Not } from 'typeorm';
import { Stock } from './entities/stock.entity';
import { InsufficientStockError } from './errors/insufficient-stock.error';

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

  async increaseStock(skuId: string, quantity: number, manager: EntityManager) {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity to increase must be positive');
    }

    const stock = await this.stocksRepository.increaseStock(
      skuId,
      quantity,
      manager,
    );
    return stock;
  }

  async decreaseStock(
    skuId: string,
    quantity: number,
    manager: EntityManager,
  ): Promise<void> {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity to decrease must be positive');
    }
    const success = await this.stocksRepository.decreaseStock(
      skuId,
      quantity,
      manager,
    );
    if (!success) {
      throw new InsufficientStockError(skuId, quantity);
    }
  }
}

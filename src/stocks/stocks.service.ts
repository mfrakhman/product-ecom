import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { StocksRepository } from './repositories/stock.repository';
import { EntityManager } from 'typeorm';
import { Stock } from './entities/stock.entity';
import { InsufficientStockError } from './errors/insufficient-stock.error';

@Injectable()
export class StocksService {
  constructor(private readonly stocksRepository: StocksRepository) {}

  async initializeStock(amount: number, skuId: string, manager: EntityManager) {
    if (amount <= 0) {
      throw new BadRequestException('Stock amount must be greater than zero');
    }
    const stock = manager.create(Stock, { amount, reserved: 0, sku: { id: skuId } });
    return await manager.save(stock);
  }

  async increaseStock(skuId: string, quantity: number, manager: EntityManager) {
    if (quantity <= 0) throw new BadRequestException('Quantity to increase must be positive');
    await this.stocksRepository.increaseStock(skuId, quantity, manager);
  }

  async decreaseStock(skuId: string, quantity: number, manager: EntityManager): Promise<void> {
    if (quantity <= 0) throw new BadRequestException('Quantity to decrease must be positive');
    const success = await this.stocksRepository.decreaseStock(skuId, quantity, manager);
    if (!success) throw new InsufficientStockError(skuId, quantity);
  }

  async reserveStock(skuId: string, quantity: number, manager: EntityManager): Promise<void> {
    if (quantity <= 0) throw new BadRequestException('Quantity must be positive');
    const success = await this.stocksRepository.reserveStock(skuId, quantity, manager);
    if (!success) throw new InsufficientStockError(skuId, quantity);
  }

  async commitReservation(skuId: string, quantity: number, manager: EntityManager): Promise<void> {
    if (quantity <= 0) throw new BadRequestException('Quantity must be positive');
    await this.stocksRepository.commitReservation(skuId, quantity, manager);
  }

  async releaseReservation(skuId: string, quantity: number, manager: EntityManager): Promise<void> {
    if (quantity <= 0) throw new BadRequestException('Quantity must be positive');
    await this.stocksRepository.releaseReservation(skuId, quantity, manager);
  }
}

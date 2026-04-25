import { Injectable } from '@nestjs/common';
import { Repository, EntityManager } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Stock } from '../entities/stock.entity';

@Injectable()
export class StocksRepository {
  constructor(
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
  ) {}

  create(stock: Partial<Stock>) {
    const newStock = this.stockRepository.create(stock);
    return this.stockRepository.save(newStock);
  }

  findById(id: string) {
    return this.stockRepository.findOne({ where: { id }, relations: ['sku'] });
  }

  async increaseStock(skuId: string, quantity: number, manager: EntityManager): Promise<void> {
    await manager
      .createQueryBuilder()
      .update(Stock)
      .set({ amount: () => `"amount" + ${quantity}` })
      .where('sku_id = :skuId', { skuId })
      .execute();
  }

  async decreaseStock(skuId: string, quantity: number, manager: EntityManager): Promise<boolean> {
    const result = await manager
      .createQueryBuilder()
      .update(Stock)
      .set({ amount: () => `"amount" - ${quantity}` })
      .where('sku_id = :skuId', { skuId })
      .andWhere('"amount" >= :quantity', { quantity })
      .execute();
    return result.affected === 1;
  }

  // Reserve: increase reserved only if available (amount - reserved) >= quantity
  async reserveStock(skuId: string, quantity: number, manager: EntityManager): Promise<boolean> {
    const result = await manager
      .createQueryBuilder()
      .update(Stock)
      .set({ reserved: () => `"reserved" + ${quantity}` })
      .where('sku_id = :skuId', { skuId })
      .andWhere('"amount" - "reserved" >= :quantity', { quantity })
      .execute();
    return result.affected === 1;
  }

  // Commit: permanently deduct — decrease both amount and reserved atomically
  async commitReservation(skuId: string, quantity: number, manager: EntityManager): Promise<boolean> {
    const result = await manager
      .createQueryBuilder()
      .update(Stock)
      .set({
        amount: () => `"amount" - ${quantity}`,
        reserved: () => `"reserved" - ${quantity}`,
      })
      .where('sku_id = :skuId', { skuId })
      .andWhere('"reserved" >= :quantity', { quantity })
      .andWhere('"amount" >= :quantity', { quantity })
      .execute();
    return result.affected === 1;
  }

  // Release: undo reservation — decrease reserved only
  async releaseReservation(skuId: string, quantity: number, manager: EntityManager): Promise<boolean> {
    const result = await manager
      .createQueryBuilder()
      .update(Stock)
      .set({ reserved: () => `GREATEST("reserved" - ${quantity}, 0)` })
      .where('sku_id = :skuId', { skuId })
      .execute();
    return result.affected === 1;
  }
}

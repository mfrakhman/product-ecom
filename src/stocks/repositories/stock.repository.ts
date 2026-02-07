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

  async increaseStock(
    skuId: string,
    quantity: number,
    manager: EntityManager,
  ): Promise<void> {
    await manager
      .createQueryBuilder()
      .update(Stock)
      .set({ amount: () => `"amount" + ${quantity}` })
      .where('sku_id = :skuId', { skuId })
      .execute();
  }

  async decreaseStock(
    skuId: string,
    quantity: number,
    manager: EntityManager,
  ): Promise<Boolean> {
    const result = await manager
      .createQueryBuilder()
      .update(Stock)
      .set({ amount: () => `"amount" - ${quantity}` })
      .where('sku_id = :skuId', { skuId })
      .andWhere('"amount" >= :quantity', { quantity })
      .execute();

    return result.affected === 1;
  }
}

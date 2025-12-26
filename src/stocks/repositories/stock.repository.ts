import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
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
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { SkusRepository } from './repositories/skus.repository';
import { CreateSkuDto } from './dtos/create-sku.dto';
import { ProductsRepository } from '../products/repositories/products.repository';
import { StocksService } from '../stocks/stocks.service';
import { DataSource } from 'typeorm';

@Injectable()
export class SkusService {
  constructor(
    private readonly skusRepository: SkusRepository,
    private readonly productsRepository: ProductsRepository,
    private readonly stocksService: StocksService,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateSkuDto) {
    return this.dataSource.transaction(async (manager) => {
      const product = await this.productsRepository.findById(dto.product_id);
      if (!product) {
        throw new NotFoundException('Associated product not found');
      }
      const sku = await this.skusRepository.create({
        skuCode: dto.skuCode,
        name: dto.name,
        description: dto.description,
        size: dto.size,
        color: dto.color,
        price: dto.price,
        isActive: dto.isActive,
        product: product,
      });

      await manager.save(sku);

      await this.stocksService.initializeStock(dto.quantity, sku.id, manager);
      return sku;
    });
  }

  async findAll() {
    const skus = await this.skusRepository.findAll();
    return { message: 'success fetching skus', data: skus };
  }

  async findById(id: string) {
    const sku = await this.skusRepository.findById(id);

    if (!sku) {
      throw new NotFoundException('SKU not found');
    }
    return { message: 'success fetching sku', data: sku };
  }

  async findByCode(skuCode: string) {
    //
  }

  async update() {
    //
  }

  async deactivate() {
    //
  }

  async activate() {
    //
  }

  async delete() {
    //
  }
}

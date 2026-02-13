import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SkusRepository } from './repositories/skus.repository';
import { CreateSkuDto } from './dtos/create-sku.dto';
import { ProductsRepository } from '../products/repositories/products.repository';
import { StocksService } from '../stocks/stocks.service';
import { DataSource, EntityManager } from 'typeorm';
import { restockSkuDto } from './dtos/restock-sku.dto';

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
      const sku = await this.skusRepository.createWithManager(
        {
          skuCode: dto.skuCode,
          name: dto.name,
          description: dto.description,
          size: dto.size,
          color: dto.color,
          price: dto.price,
          isActive: dto.isActive,
          product: product,
        },
        manager,
      );

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

  async restockSku(skuId: string, dto: restockSkuDto) {
    const { quantity } = dto;
    return this.dataSource.transaction(async (manager) => {
      const sku = await this.skusRepository.findById(skuId);
      if (!sku) {
        throw new NotFoundException('SKU not found');
      }
      await this.stocksService.increaseStock(skuId, quantity, manager);
      return { message: 'SKU restocked successfully' };
    });
  }

  async validateSkus(skuIds: string[]) {
    if (!Array.isArray(skuIds) || skuIds.length === 0) {
      throw new BadRequestException('skuIds must be a non-empty array');
    }

    const uniqueIds = Array.from(new Set(skuIds));
    const existingSkus =
      await this.skusRepository.findActiveIdsByIds(uniqueIds);
    const existingIds = new Set(existingSkus.map((s) => s.id));
    const invalid = uniqueIds.filter((id) => !existingIds.has(id));

    return {
      valid: uniqueIds.filter((id) => existingIds.has(id)),
      invalid,
    };
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

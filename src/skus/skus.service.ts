import { Injectable, NotFoundException } from '@nestjs/common';
import { SkusRepository } from './repositories/skus.repository';
import { CreateSkuDto } from './dtos/create-sku.dto';
import { ProductsRepository } from '../products/repositories/products.repository';

@Injectable()
export class SkusService {
  constructor(
    private readonly skusRepository: SkusRepository,
    private readonly productsRepository: ProductsRepository,
  ) {}

  async create(dto: CreateSkuDto) {
    const product = await this.productsRepository.findById(dto.product_id);
    if (!product) {
      throw new NotFoundException('Associated product not found');
    }
    return this.skusRepository.create({
      skuCode: dto.skuCode,
      name: dto.name,
      description: dto.description,
      size: dto.size,
      color: dto.color,
      price: dto.price,
      isActive: dto.isActive,
      product: product,
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

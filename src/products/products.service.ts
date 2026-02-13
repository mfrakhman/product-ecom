import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsRepository } from './repositories/products.repository';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async create(dto: CreateProductDto) {
    const product = await this.productsRepository.create(dto);
    return { message: 'Product created successfully', data: product };
  }

  async findAll(page = 1, limit = 10, query?: string) {
    return this.productsRepository.findAll(page, limit, query);
  }

  async findById(id: string) {
    const product = await this.productsRepository.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return { message: 'Product retrieved successfully', data: product };
  }

  async findSkusById(id: string) {
    const product = await this.productsRepository.findSkusById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return {
      message: 'Product SKUs retrieved successfully',
      data: product.skus,
    };
  }

  async update(id: string, updateData: UpdateProductDto) {
    const product = await this.productsRepository.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    await this.productsRepository.update(id, updateData);
    return { message: 'Product updated successfully', data: updateData };
  }

  async delete(id: string) {
    const product = await this.productsRepository.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    await this.productsRepository.delete(id);
    return { message: 'Product deleted successfully' };
  }
}

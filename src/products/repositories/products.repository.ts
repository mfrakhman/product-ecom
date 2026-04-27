import { Injectable } from '@nestjs/common';
import { Repository, Like, ILike } from 'typeorm';
import { Product } from '../entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  create(product: Partial<Product>) {
    const newProduct = this.productRepository.create(product);
    return this.productRepository.save(newProduct);
  }

  findAll(page = 1, limit = 10, query?: string) {
    const skip = (page - 1) * limit;
    const where = query ? { name: ILike(`%${query}%`) } : {};
    return this.productRepository.find({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['category', 'images'],
    });
  }

  findById(id: string) {
    return this.productRepository.findOne({
      where: { id },
      relations: ['category', 'images', 'skus', 'skus.stock', 'skus.color', 'skus.size'],
    });
  }

  findSkusById(id: string) {
    return this.productRepository.findOne({
      where: { id },
      relations: ['skus', 'skus.stock', 'skus.color', 'skus.size'],
    });
  }

  update(id: string, updateData: Partial<Product>) {
    return this.productRepository
      .update(id, updateData)
      .then(() => this.findById(id));
  }

  delete(id: string) {
    return this.productRepository.softDelete(id).then(() => {});
  }
}

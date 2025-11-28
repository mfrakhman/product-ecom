import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
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

  findAll() {
    return this.productRepository.find();
  }

  findById(id: string) {
    return this.productRepository.findOneBy({ id });
  }

  update(id: string, updateData: Partial<Product>) {
    return this.productRepository
      .update(id, updateData)
      .then(() => this.findById(id));
  }

  delete(id: string) {
    return this.productRepository.delete(id).then(() => {});
  }
}

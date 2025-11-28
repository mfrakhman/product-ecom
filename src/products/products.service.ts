import { Injectable } from '@nestjs/common';
import { ProductsRepository } from './repositories/products.repository';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async create(productData: Partial<any>) {
    return this.productsRepository.create(productData);
  }
}

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotImplementedException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ProductsRepository } from './repositories/products.repository';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { SkusRepository } from '../skus/repositories/skus.repository';
import { StocksService } from '../stocks/stocks.service';
import { Product } from './entities/product.entity';
import { Sku } from '../skus/entities/sku.entity';
import 'multer';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly skusRepository: SkusRepository,
    private readonly stocksService: StocksService,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateProductDto) {
    const codes = dto.skus.map((s) => s.skuCode);
    if (new Set(codes).size !== codes.length)
      throw new BadRequestException('Duplicate skuCode within request');

    return this.dataSource.transaction(async (manager) => {
      const existing = await manager.findOne(Sku, {
        where: codes.map((c) => ({ skuCode: c })),
      });
      if (existing)
        throw new ConflictException(`SKU code "${existing.skuCode}" already exists`);

      const product = manager.create(Product, {
        name: dto.name,
        slug: dto.slug,
        description: dto.description ?? null,
        categoryId: dto.categoryId,
        sizeGroup: dto.sizeGroup ?? null,
      });
      const savedProduct = await manager.save(product);

      for (const skuDto of dto.skus) {
        const sku = manager.create(Sku, {
          skuCode: skuDto.skuCode,
          productId: savedProduct.id,
          colorId: skuDto.colorId,
          sizeId: skuDto.sizeId ?? null,
          price: skuDto.price,
          compareAt: skuDto.compareAt ?? null,
          isActive: skuDto.isActive,
        });
        const savedSku = await manager.save(sku);
        await this.stocksService.initializeStock(skuDto.quantity, savedSku.id, manager);
      }

      const result = await manager.findOne(Product, {
        where: { id: savedProduct.id },
        relations: ['skus', 'skus.stock', 'skus.color', 'skus.size', 'category'],
      });
      return { message: 'Product created successfully', data: result };
    });
  }

  async findAll(page = 1, limit = 10, query?: string, slug?: string) {
    return this.productsRepository.findAll(page, limit, query, slug);
  }

  async findById(id: string) {
    const product = await this.productsRepository.findById(id);
    if (!product) throw new NotFoundException('Product not found');
    return { message: 'Product retrieved successfully', data: product };
  }

  async findSkusById(id: string) {
    const product = await this.productsRepository.findSkusById(id);
    if (!product) throw new NotFoundException('Product not found');
    return { message: 'Product SKUs retrieved successfully', data: product.skus };
  }

  async update(id: string, updateData: UpdateProductDto) {
    const product = await this.productsRepository.findById(id);
    if (!product) throw new NotFoundException('Product not found');
    await this.productsRepository.update(id, updateData);
    return { message: 'Product updated successfully', data: updateData };
  }

  async delete(id: string) {
    const product = await this.productsRepository.findById(id);
    if (!product) throw new NotFoundException('Product not found');
    for (const sku of product.skus ?? []) {
      await this.skusRepository.delete(sku.id);
    }
    await this.productsRepository.delete(id);
    return { message: 'Product deleted successfully' };
  }

  // TODO: replace with POST /products/:id/colors/:colorId/images
  async uploadImage(_id: string, _file: Express.Multer.File) {
    throw new NotImplementedException(
      'Product image upload moved to /products/:id/colors/:colorId/images',
    );
  }

  // TODO: replace with DELETE /products/:id/colors/:colorId/images/:imageId
  async deleteImage(_id: string) {
    throw new NotImplementedException(
      'Product image management moved to /products/:id/colors/:colorId/images',
    );
  }
}

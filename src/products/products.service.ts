import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ProductsRepository } from './repositories/products.repository';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { StorageService } from '../storage/storage.service';
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
    private readonly storageService: StorageService,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateProductDto) {
    const codes = dto.skus.map(s => s.skuCode)
    if (new Set(codes).size !== codes.length)
      throw new BadRequestException('Duplicate skuCode within request')

    return this.dataSource.transaction(async (manager) => {
      const existing = await manager.findOne(Sku, { where: codes.map(c => ({ skuCode: c })) })
      if (existing) throw new ConflictException(`SKU code "${existing.skuCode}" already exists`)

      const product = manager.create(Product, {
        name: dto.name,
        description: dto.description,
        category: dto.category,
      });
      const savedProduct = await manager.save(product);

      for (const skuDto of dto.skus) {
        const sku = manager.create(Sku, {
          skuCode: skuDto.skuCode,
          name: skuDto.name,
          description: skuDto.description,
          size: skuDto.size,
          color: skuDto.color,
          price: skuDto.price,
          isActive: skuDto.isActive,
          product: savedProduct,
        });
        const savedSku = await manager.save(sku);
        await this.stocksService.initializeStock(skuDto.quantity, savedSku.id, manager);
      }

      const result = await manager.findOne(Product, {
        where: { id: savedProduct.id },
        relations: ['skus', 'skus.stock'],
      });
      return { message: 'Product created successfully', data: result };
    });
  }

  async findAll(page = 1, limit = 10, query?: string) {
    return this.productsRepository.findAll(page, limit, query);
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
    if (product.imageObject) await this.storageService.delete(product.imageObject);
    for (const sku of product.skus ?? []) {
      if (sku.imageObject) await this.storageService.delete(sku.imageObject);
      await this.skusRepository.delete(sku.id);
    }
    await this.productsRepository.delete(id);
    return { message: 'Product deleted successfully' };
  }

  async uploadImage(id: string, file: Express.Multer.File) {
    const product = await this.productsRepository.findById(id);
    if (!product) throw new NotFoundException('Product not found');
    if (!file.mimetype.startsWith('image/')) throw new BadRequestException('File must be an image');
    if (product.imageObject) await this.storageService.delete(product.imageObject);
    const objectName = this.storageService.buildObjectName('products', id, file.originalname);
    const imageUrl = await this.storageService.upload(objectName, file.buffer, file.mimetype);
    await this.productsRepository.update(id, { imageUrl, imageObject: objectName });
    return { message: 'Image uploaded successfully', data: { imageUrl } };
  }

  async deleteImage(id: string) {
    const product = await this.productsRepository.findById(id);
    if (!product) throw new NotFoundException('Product not found');
    if (!product.imageObject) throw new BadRequestException('Product has no image');
    await this.storageService.delete(product.imageObject);
    await this.productsRepository.update(id, { imageUrl: null, imageObject: null });
    return { message: 'Image deleted successfully' };
  }
}

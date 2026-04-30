import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotImplementedException,
  NotFoundException,
} from '@nestjs/common';
import { SkusRepository } from './repositories/skus.repository';
import { CreateSkuDto } from './dtos/create-sku.dto';
import { UpdateSkuDto } from './dtos/update-sku.dto';
import { ProductsRepository } from '../products/repositories/products.repository';
import { StocksService } from '../stocks/stocks.service';
import { DataSource } from 'typeorm';
import { Sku } from './entities/sku.entity';
import { restockSkuDto } from './dtos/restock-sku.dto';
import 'multer';

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
      if (!product) throw new NotFoundException('Associated product not found');

      const existing = await manager.findOne(Sku, {
        where: { skuCode: dto.skuCode },
      });
      if (existing)
        throw new ConflictException(`SKU code "${dto.skuCode}" already exists`);

      const sku = await this.skusRepository.createWithManager(
        {
          skuCode: dto.skuCode,
          productId: product.id,
          colorId: dto.colorId,
          sizeId: dto.sizeId ?? null,
          price: dto.price,
          compareAt: dto.compareAt ?? null,
          isActive: dto.isActive,
        },
        manager,
      );

      await this.stocksService.initializeStock(dto.quantity, sku.id, manager);
      return { message: 'SKU created successfully', data: sku };
    });
  }

  async findAll() {
    const skus = await this.skusRepository.findAll();
    return { message: 'success fetching skus', data: skus };
  }

  async findById(id: string) {
    const sku = await this.skusRepository.findById(id);
    if (!sku) throw new NotFoundException('SKU not found');
    const available = sku.stock ? sku.stock.amount - sku.stock.reserved : null;
    (sku as any).available = available;
    return { message: 'success fetching sku', data: sku };
  }

  async update(id: string, dto: UpdateSkuDto) {
    const sku = await this.skusRepository.findById(id);
    if (!sku) throw new NotFoundException('SKU not found');

    if (dto.skuCode && dto.skuCode !== sku.skuCode) {
      const conflict = await this.skusRepository.findByCode(dto.skuCode);
      if (conflict) throw new ConflictException(`SKU code "${dto.skuCode}" already exists`);
    }

    const patch: Partial<Sku> = {};
    if (dto.skuCode   !== undefined) patch.skuCode   = dto.skuCode;
    if (dto.colorId   !== undefined) patch.colorId   = dto.colorId;
    if (dto.sizeId    !== undefined) patch.sizeId    = dto.sizeId ?? null;
    if (dto.price     !== undefined) patch.price     = dto.price;
    if (dto.compareAt !== undefined) patch.compareAt = dto.compareAt ?? null;
    if (dto.isActive  !== undefined) patch.isActive  = dto.isActive;

    await this.skusRepository.update(id, patch);
    const updated = await this.skusRepository.findById(id);
    return { message: 'SKU updated successfully', data: updated };
  }

  async restockSku(skuId: string, dto: restockSkuDto) {
    return this.dataSource.transaction(async (manager) => {
      const sku = await this.skusRepository.findById(skuId);
      if (!sku) throw new NotFoundException('SKU not found');
      await this.stocksService.increaseStock(skuId, dto.quantity, manager);
      return { message: 'SKU restocked successfully' };
    });
  }

  async validateSkus(skuIds: string[]) {
    if (!Array.isArray(skuIds) || skuIds.length === 0) {
      throw new BadRequestException('skuIds must be a non-empty array');
    }

    const uniqueIds = Array.from(new Set(skuIds));
    const existingSkus = await this.skusRepository.findActiveIdsByIds(uniqueIds);
    const existingIds = new Set(existingSkus.map((s) => s.id));
    const invalid = uniqueIds.filter((id) => !existingIds.has(id));

    return {
      valid: existingSkus.map((s) => ({ id: s.id, price: s.price })),
      invalid,
    };
  }

  // TODO: SKU images removed — use /products/:id/colors/:colorId/images instead
  async uploadImage(_id: string, _file: Express.Multer.File) {
    throw new NotImplementedException(
      'SKU images removed. Use /products/:id/colors/:colorId/images',
    );
  }

  async deleteImage(_id: string) {
    throw new NotImplementedException(
      'SKU images removed. Use /products/:id/colors/:colorId/images',
    );
  }
}
